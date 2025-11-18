import { CacheManager } from '../../src/cache/CacheManager';
import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import * as path from 'path';
import * as fs from 'fs';

describe('Cache Performance Benchmarks', () => {
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  describe('AST Cache Performance', () => {
    it('should demonstrate cache hit performance improvement', async () => {
      const cache = new CacheManager();
      const analyzer = new CodeAnalyzer({ enableCache: true, cache });

      const testFile = path.join(fixturesPath, 'services', 'UserService.ts');

      // First parse - cache miss
      const start1 = performance.now();
      await analyzer.analyze(testFile);
      const firstParseDuration = performance.now() - start1;

      // Second parse - cache hit
      const start2 = performance.now();
      await analyzer.analyze(testFile);
      const cachedParseDuration = performance.now() - start2;

      const stats = cache.getStats();

      console.log('\nCache Performance Comparison:');
      console.log(`  First parse (cold cache): ${firstParseDuration.toFixed(2)}ms`);
      console.log(`  Cached parse (warm cache): ${cachedParseDuration.toFixed(2)}ms`);
      console.log(`  Speedup: ${(firstParseDuration / cachedParseDuration).toFixed(2)}x`);
      console.log(`  Cache hit rate: ${(stats.astCache.hitRate * 100).toFixed(1)}%`);

      // Cache should be significantly faster
      expect(cachedParseDuration).toBeLessThan(firstParseDuration);
      expect(stats.astCache.hitRate).toBeGreaterThan(0);
    });

    it('should measure cache overhead for misses', async () => {
      const cacheManager = new CacheManager();
      const analyzerWithCache = new CodeAnalyzer({ enableCache: true, cache: cacheManager });
      const analyzerWithoutCache = new CodeAnalyzer({ enableCache: false });

      const testFile = path.join(fixturesPath, 'models', 'User.ts');

      // Measure with cache (miss)
      const start1 = performance.now();
      await analyzerWithCache.analyze(testFile);
      const withCacheDuration = performance.now() - start1;

      // Measure without cache
      const start2 = performance.now();
      await analyzerWithoutCache.analyze(testFile);
      const withoutCacheDuration = performance.now() - start2;

      const overhead = withCacheDuration - withoutCacheDuration;
      const overheadPercent = (overhead / withoutCacheDuration) * 100;

      console.log('\nCache Overhead on Miss:');
      console.log(`  With cache:    ${withCacheDuration.toFixed(2)}ms`);
      console.log(`  Without cache: ${withoutCacheDuration.toFixed(2)}ms`);
      console.log(`  Overhead:      ${overhead.toFixed(2)}ms (${overheadPercent.toFixed(1)}%)`);

      // Overhead should be minimal (< 20%)
      expect(overheadPercent).toBeLessThan(20);
    });

    it('should benchmark cache hit rate with repeated analysis', async () => {
      const cache = new CacheManager();
      const analyzer = new CodeAnalyzer({ enableCache: true, cache });

      const iterations = 10;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        await analyzer.analyze(fixturesPath);
      }

      const totalDuration = performance.now() - startTime;
      const avgDuration = totalDuration / iterations;
      const stats = cache.getStats();

      console.log('\nRepeated Analysis Benchmark:');
      console.log(`  Iterations: ${iterations}`);
      console.log(`  Total time: ${totalDuration.toFixed(2)}ms`);
      console.log(`  Average time per iteration: ${avgDuration.toFixed(2)}ms`);
      console.log(`  Cache statistics:`);
      console.log(`    AST hits: ${stats.astCache.hits}`);
      console.log(`    AST misses: ${stats.astCache.misses}`);
      console.log(`    Hit rate: ${(stats.astCache.hitRate * 100).toFixed(1)}%`);

      // After multiple iterations, hit rate should be high
      expect(stats.astCache.hitRate).toBeGreaterThan(0.7); // > 70%
    });
  });

  describe('Cache Size and Eviction', () => {
    it('should benchmark cache eviction performance', async () => {
      const smallCache = new CacheManager({ maxCacheSize: 10 });

      // Create temporary files to exceed cache size
      const tempDir = path.join(__dirname, 'temp-cache-bench');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const fileCount = 20; // More than cache capacity
      const files: string[] = [];

      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(tempDir, `File${i}.ts`);
        fs.writeFileSync(filePath, `export class Class${i} {}`, 'utf-8');
        files.push(filePath);
      }

      const startTime = performance.now();

      // Fill cache beyond capacity
      const analyzer = new CodeAnalyzer({ enableCache: true, cache: smallCache });
      for (const file of files) {
        await analyzer.analyze(file);
      }

      const duration = performance.now() - startTime;
      const stats = smallCache.getStats();

      console.log('\nCache Eviction Benchmark:');
      console.log(`  Files processed: ${fileCount}`);
      console.log(`  Cache capacity: 10`);
      console.log(`  Current cache size: ${stats.astCache.size}`);
      console.log(`  Processing time: ${duration.toFixed(2)}ms`);
      console.log(`  Avg time per file: ${(duration / fileCount).toFixed(2)}ms`);

      // Cache size should not exceed capacity
      expect(stats.astCache.size).toBeLessThanOrEqual(10);

      // Cleanup
      for (const file of files) {
        fs.unlinkSync(file);
      }
      fs.rmdirSync(tempDir);
    });

    it('should measure memory efficiency of cache', async () => {
      const cache = new CacheManager({ maxCacheSize: 100 });
      const analyzer = new CodeAnalyzer({ enableCache: true, cache });

      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      // Analyze the codebase multiple times to fill cache
      for (let i = 0; i < 5; i++) {
        await analyzer.analyze(fixturesPath);
      }

      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memDelta = memAfter - memBefore;
      const stats = cache.getStats();

      console.log('\nCache Memory Usage:');
      console.log(`  Memory before: ${memBefore.toFixed(2)} MB`);
      console.log(`  Memory after:  ${memAfter.toFixed(2)} MB`);
      console.log(`  Memory delta:  ${memDelta.toFixed(2)} MB`);
      console.log(`  Cache entries: ${stats.astCache.size}`);
      console.log(`  Avg memory per entry: ${(memDelta / stats.astCache.size).toFixed(2)} MB`);

      // Memory usage should be reasonable (< 100 MB delta)
      expect(memDelta).toBeLessThan(100);
    });
  });

  describe('Cache TTL Performance', () => {
    it('should benchmark TTL expiration overhead', async () => {
      const shortTTLCache = new CacheManager({ cacheTTL: 100 }); // 100ms TTL
      const analyzer = new CodeAnalyzer({ enableCache: true, cache: shortTTLCache });

      const testFile = path.join(fixturesPath, 'services', 'UserService.ts');

      // First parse
      await analyzer.analyze(testFile);

      // Wait for TTL to expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Second parse after expiration - should be a miss
      const start = performance.now();
      await analyzer.analyze(testFile);
      const duration = performance.now() - start;

      const stats = shortTTLCache.getStats();

      console.log('\nTTL Expiration Benchmark:');
      console.log(`  TTL: 100ms`);
      console.log(`  Parse after expiration: ${duration.toFixed(2)}ms`);
      console.log(`  Cache misses: ${stats.astCache.misses}`);

      // Should have a cache miss after TTL expiration
      expect(stats.astCache.misses).toBeGreaterThan(0);
    });
  });

  describe('Multi-Tier Cache Performance', () => {
    it('should benchmark all three cache tiers', async () => {
      const cache = new CacheManager();
      const analyzer = new CodeAnalyzer({ enableCache: true, cache });

      const startTime = performance.now();

      // First analysis - populate all cache tiers
      const result1 = await analyzer.analyzeWithErrors(fixturesPath);

      // Second analysis - hit all cache tiers
      const result2 = await analyzer.analyzeWithErrors(fixturesPath);

      const duration = performance.now() - startTime;
      const stats = cache.getStats();

      console.log('\nMulti-Tier Cache Performance:');
      console.log(`  Total duration: ${duration.toFixed(2)}ms`);
      console.log('\n  Tier 1 (AST):');
      console.log(`    Size: ${stats.astCache.size}`);
      console.log(`    Hits: ${stats.astCache.hits}`);
      console.log(`    Hit rate: ${(stats.astCache.hitRate * 100).toFixed(1)}%`);
      console.log('\n  Tier 2 (Module):');
      console.log(`    Size: ${stats.moduleCache.size}`);
      console.log(`    Hits: ${stats.moduleCache.hits}`);
      console.log(`    Hit rate: ${(stats.moduleCache.hitRate * 100).toFixed(1)}%`);
      console.log('\n  Tier 3 (Rule):');
      console.log(`    Size: ${stats.ruleCache.size}`);
      console.log(`    Hits: ${stats.ruleCache.hits}`);
      console.log(`    Hit rate: ${(stats.ruleCache.hitRate * 100).toFixed(1)}%`);

      expect(result1.classes.size()).toBe(result2.classes.size());
    });
  });

  describe('Real-World Scenarios', () => {
    it('should benchmark watch mode simulation', async () => {
      const cache = new CacheManager();
      const analyzer = new CodeAnalyzer({ enableCache: true, cache });

      // Simulate watch mode: repeated analysis with occasional file changes
      const cycles = 10;
      const durations: number[] = [];

      for (let i = 0; i < cycles; i++) {
        const start = performance.now();
        await analyzer.analyze(fixturesPath);
        const duration = performance.now() - start;
        durations.push(duration);

        // Simulate a small delay between checks
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / cycles;
      const minDuration = Math.min(...durations);
      const maxDuration = Math.max(...durations);
      const stats = cache.getStats();

      console.log('\nWatch Mode Simulation:');
      console.log(`  Cycles: ${cycles}`);
      console.log(`  Average duration: ${avgDuration.toFixed(2)}ms`);
      console.log(`  Min duration: ${minDuration.toFixed(2)}ms`);
      console.log(`  Max duration: ${maxDuration.toFixed(2)}ms`);
      console.log(`  Cache hit rate: ${(stats.astCache.hitRate * 100).toFixed(1)}%`);

      // Later cycles should be faster due to caching
      const firstThreeDurations = durations.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
      const lastThreeDurations = durations.slice(-3).reduce((a, b) => a + b, 0) / 3;

      console.log(`  First 3 cycles avg: ${firstThreeDurations.toFixed(2)}ms`);
      console.log(`  Last 3 cycles avg: ${lastThreeDurations.toFixed(2)}ms`);
      console.log(
        `  Improvement: ${((1 - lastThreeDurations / firstThreeDurations) * 100).toFixed(1)}%`
      );

      expect(lastThreeDurations).toBeLessThan(firstThreeDurations);
    });
  });
});
