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
 * 3-tier caching system for ArchUnit-TS
 *
 * Tier 1: File AST cache (hash-based)
 * Tier 2: Module analysis cache
 * Tier 3: Rule evaluation cache
 */
export class CacheManager {
  private astCache: Map<string, CacheEntry<TSModule>>;
  private moduleCache: Map<string, CacheEntry<TSClass[]>>;
  private ruleCache: Map<string, CacheEntry<any>>;
  private maxCacheSize: number;
  private cacheTTL: number; // Time to live in milliseconds

  constructor(options: {
    maxCacheSize?: number;
    cacheTTL?: number;
  } = {}) {
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
      return null;
    }

    // Check if cache is still valid
    if (!this.isValid(entry)) {
      this.astCache.delete(filePath);
      return null;
    }

    // Verify file hasn't changed
    const currentHash = this.getFileHash(filePath);
    if (currentHash !== entry.hash) {
      this.astCache.delete(filePath);
      return null;
    }

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
      return null;
    }

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
  public getRuleEvaluation(ruleKey: string): any | null {
    const entry = this.ruleCache.get(ruleKey);

    if (!entry || !this.isValid(entry)) {
      this.ruleCache.delete(ruleKey);
      return null;
    }

    return entry.data;
  }

  /**
   * Tier 3: Cache rule evaluation
   */
  public setRuleEvaluation(ruleKey: string, result: any): void {
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
  }

  /**
   * Clear specific cache tier
   */
  public clearTier(tier: 1 | 2 | 3): void {
    switch (tier) {
      case 1:
        this.astCache.clear();
        break;
      case 2:
        this.moduleCache.clear();
        break;
      case 3:
        this.ruleCache.clear();
        break;
    }
  }

  /**
   * Get cache statistics
   */
  public getStats() {
    return {
      astCache: {
        size: this.astCache.size,
        hitRate: this.calculateHitRate(this.astCache),
      },
      moduleCache: {
        size: this.moduleCache.size,
        hitRate: this.calculateHitRate(this.moduleCache),
      },
      ruleCache: {
        size: this.ruleCache.size,
        hitRate: this.calculateHitRate(this.ruleCache),
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
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp);

    const toRemove = entries.slice(0, Math.floor(this.maxCacheSize * 0.2));
    for (const [key] of toRemove) {
      cache.delete(key);
    }
  }

  /**
   * Calculate hit rate (simplified - would need hit/miss tracking in production)
   */
  private calculateHitRate<T>(cache: Map<string, CacheEntry<T>>): number {
    // This is a placeholder - in a real implementation, we'd track hits and misses
    return cache.size > 0 ? 0.75 : 0;
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
