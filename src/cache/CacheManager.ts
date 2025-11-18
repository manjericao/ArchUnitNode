import * as fs from 'fs';
import * as crypto from 'crypto';
import { TSModule } from '../types';
import { TSClass } from '../core/TSClass';

/**
 * Cache entry with metadata
 */
interface CacheEntry<T> {
  data: T;
  hash: string;
  timestamp: number;
}

/**
 * Options for configuring the cache manager
 */
export interface CacheOptions {
  /** Maximum number of entries per cache tier (default: 1000) */
  maxCacheSize?: number;
  /** Time-to-live for cache entries in milliseconds (default: 5 minutes) */
  cacheTTL?: number;
}

/**
 * Statistics for a single cache tier
 */
export interface CacheTierStats {
  /** Number of entries in the cache */
  size: number;
  /** Number of cache hits */
  hits: number;
  /** Number of cache misses */
  misses: number;
  /** Hit rate (hits / (hits + misses)) */
  hitRate: number;
}

/**
 * Overall cache statistics for all tiers
 */
export interface CacheStats {
  /** AST cache tier statistics */
  astCache: CacheTierStats;
  /** Module cache tier statistics */
  moduleCache: CacheTierStats;
  /** Rule cache tier statistics */
  ruleCache: CacheTierStats;
}

/**
 * 3-tier caching system for ArchUnit-TS
 *
 * Tier 1: File AST cache (hash-based)
 * Tier 2: Module analysis cache
 * Tier 3: Rule evaluation cache
 */
export class CacheManager {
  private astCache: Map<string, CacheEntry<TSModule>>;
  private moduleCache: Map<string, CacheEntry<TSClass[]>>;
  private ruleCache: Map<string, CacheEntry<unknown>>;
  private maxCacheSize: number;
  private cacheTTL: number; // Time to live in milliseconds

  // Hit/miss tracking for accurate hit rate calculation
  private astHits = 0;
  private astMisses = 0;
  private moduleHits = 0;
  private moduleMisses = 0;
  private ruleHits = 0;
  private ruleMisses = 0;

  constructor(options: CacheOptions = {}) {
    this.astCache = new Map();
    this.moduleCache = new Map();
    this.ruleCache = new Map();
    this.maxCacheSize = options.maxCacheSize || 1000;
    this.cacheTTL = options.cacheTTL || 5 * 60 * 1000; // Default 5 minutes
  }

  /**
   * Tier 1: Get cached AST for a file
   */
  public getAST(filePath: string): TSModule | null {
    const entry = this.astCache.get(filePath);

    if (!entry) {
      this.astMisses++;
      return null;
    }

    // Check if cache is still valid
    if (!this.isValid(entry)) {
      this.astCache.delete(filePath);
      this.astMisses++;
      return null;
    }

    // Verify file hasn't changed
    const currentHash = this.getFileHash(filePath);
    if (currentHash !== entry.hash) {
      this.astCache.delete(filePath);
      this.astMisses++;
      return null;
    }

    this.astHits++;
    return entry.data;
  }

  /**
   * Tier 1: Cache AST for a file
   */
  public setAST(filePath: string, module: TSModule): void {
    const hash = this.getFileHash(filePath);

    this.astCache.set(filePath, {
      data: module,
      hash,
      timestamp: Date.now(),
    });

    this.evictIfNeeded(this.astCache);
  }

  /**
   * Tier 2: Get cached module analysis
   */
  public getModuleAnalysis(key: string): TSClass[] | null {
    const entry = this.moduleCache.get(key);

    if (!entry || !this.isValid(entry)) {
      this.moduleCache.delete(key);
      this.moduleMisses++;
      return null;
    }

    this.moduleHits++;
    return entry.data;
  }

  /**
   * Tier 2: Cache module analysis
   */
  public setModuleAnalysis(key: string, classes: TSClass[]): void {
    this.moduleCache.set(key, {
      data: classes,
      hash: this.hashString(key),
      timestamp: Date.now(),
    });

    this.evictIfNeeded(this.moduleCache);
  }

  /**
   * Tier 3: Get cached rule evaluation
   */
  public getRuleEvaluation(ruleKey: string): unknown | null {
    const entry = this.ruleCache.get(ruleKey);

    if (!entry || !this.isValid(entry)) {
      this.ruleCache.delete(ruleKey);
      this.ruleMisses++;
      return null;
    }

    this.ruleHits++;
    return entry.data;
  }

  /**
   * Tier 3: Cache rule evaluation
   */
  public setRuleEvaluation(ruleKey: string, result: unknown): void {
    this.ruleCache.set(ruleKey, {
      data: result,
      hash: this.hashString(ruleKey),
      timestamp: Date.now(),
    });

    this.evictIfNeeded(this.ruleCache);
  }

  /**
   * Clear all caches
   */
  public clearAll(): void {
    this.astCache.clear();
    this.moduleCache.clear();
    this.ruleCache.clear();
    // Reset hit/miss counters
    this.astHits = 0;
    this.astMisses = 0;
    this.moduleHits = 0;
    this.moduleMisses = 0;
    this.ruleHits = 0;
    this.ruleMisses = 0;
  }

  /**
   * Clear specific cache tier
   */
  public clearTier(tier: 1 | 2 | 3): void {
    switch (tier) {
      case 1:
        this.astCache.clear();
        this.astHits = 0;
        this.astMisses = 0;
        break;
      case 2:
        this.moduleCache.clear();
        this.moduleHits = 0;
        this.moduleMisses = 0;
        break;
      case 3:
        this.ruleCache.clear();
        this.ruleHits = 0;
        this.ruleMisses = 0;
        break;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    return {
      astCache: {
        size: this.astCache.size,
        hits: this.astHits,
        misses: this.astMisses,
        hitRate: this.calculateHitRate(this.astHits, this.astMisses),
      },
      moduleCache: {
        size: this.moduleCache.size,
        hits: this.moduleHits,
        misses: this.moduleMisses,
        hitRate: this.calculateHitRate(this.moduleHits, this.moduleMisses),
      },
      ruleCache: {
        size: this.ruleCache.size,
        hits: this.ruleHits,
        misses: this.ruleMisses,
        hitRate: this.calculateHitRate(this.ruleHits, this.ruleMisses),
      },
    };
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    const age = Date.now() - entry.timestamp;
    return age < this.cacheTTL;
  }

  /**
   * Get hash of file contents
   */
  private getFileHash(filePath: string): string {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      return this.hashString(content);
    } catch {
      return '';
    }
  }

  /**
   * Hash a string using SHA-256
   */
  private hashString(input: string): string {
    return crypto.createHash('sha256').update(input).digest('hex');
  }

  /**
   * Evict oldest entries if cache exceeds max size
   */
  private evictIfNeeded<T>(cache: Map<string, CacheEntry<T>>): void {
    if (cache.size <= this.maxCacheSize) {
      return;
    }

    // Sort by timestamp and remove oldest entries
    const entries = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
    for (const [key] of toRemove) {
      cache.delete(key);
    }
  }

  /**
   * Calculate cache hit rate
   * @param hits Number of cache hits
   * @param misses Number of cache misses
   * @returns Hit rate as a decimal between 0 and 1, or 0 if no accesses
   */
  private calculateHitRate(hits: number, misses: number): number {
    const total = hits + misses;
    return total > 0 ? hits / total : 0;
  }
}

/**
 * Global cache instance
 */
let globalCache: CacheManager | null = null;

/**
 * Get or create global cache instance
 */
export function getGlobalCache(): CacheManager {
  if (!globalCache) {
    globalCache = new CacheManager();
  }
  return globalCache;
}

/**
 * Reset global cache (useful for testing)
 */
export function resetGlobalCache(): void {
  globalCache = null;
}
