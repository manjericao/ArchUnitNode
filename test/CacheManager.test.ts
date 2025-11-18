import { CacheManager, getGlobalCache, resetGlobalCache } from '../src/cache/CacheManager';
import { TSModule, TSClass as TSClassInterface } from '../src/types';
import { TSClass } from '../src/core/TSClass';
import * as fs from 'fs';
import * as path from 'path';

describe('CacheManager', () => {
  let cacheManager: CacheManager;
  let testFilePath: string;

  beforeEach(() => {
    cacheManager = new CacheManager();
    testFilePath = path.join(__dirname, 'fixtures', 'sample-code', 'models', 'User.ts');
  });

  afterEach(() => {
    cacheManager.clearAll();
  });

  describe('Tier 1: AST Cache', () => {
    describe('Hit Rate Tracking', () => {
      it('should track cache hits correctly', () => {
        const mockModule: TSModule = {
          name: 'TestModule',
          filePath: testFilePath,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };

        // Initial stats should be zero
        let stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(0);
        expect(stats.astCache.misses).toBe(0);
        expect(stats.astCache.hitRate).toBe(0);

        // First access - cache miss
        let result = cacheManager.getAST(testFilePath);
        expect(result).toBeNull();

        stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(0);
        expect(stats.astCache.misses).toBe(1);
        expect(stats.astCache.hitRate).toBe(0);

        // Store in cache
        cacheManager.setAST(testFilePath, mockModule);

        // Second access - cache hit
        result = cacheManager.getAST(testFilePath);
        expect(result).toEqual(mockModule);

        stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(1);
        expect(stats.astCache.misses).toBe(1);
        expect(stats.astCache.hitRate).toBe(0.5); // 1 hit out of 2 total accesses

        // Third access - another cache hit
        result = cacheManager.getAST(testFilePath);
        expect(result).toEqual(mockModule);

        stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(2);
        expect(stats.astCache.misses).toBe(1);
        expect(stats.astCache.hitRate).toBeCloseTo(0.6667, 4); // 2 hits out of 3 total accesses
      });

      it('should track cache misses for non-existent files', () => {
        const nonExistentPath = '/non/existent/file.ts';

        // Multiple misses
        cacheManager.getAST(nonExistentPath);
        cacheManager.getAST(nonExistentPath);
        cacheManager.getAST(nonExistentPath);

        const stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(0);
        expect(stats.astCache.misses).toBe(3);
        expect(stats.astCache.hitRate).toBe(0);
      });

      it('should track cache miss when file hash changes', () => {
        const mockModule: TSModule = {
          name: 'TestModule',
          filePath: testFilePath,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };

        // Store in cache
        cacheManager.setAST(testFilePath, mockModule);

        // First access - cache hit
        let result = cacheManager.getAST(testFilePath);
        expect(result).toEqual(mockModule);

        // Simulate file change by creating a temporary file
        const tempFilePath = path.join(__dirname, 'temp-test-file.ts');
        fs.writeFileSync(tempFilePath, 'original content', 'utf-8');

        const tempModule: TSModule = {
          name: 'TempModule',
          filePath: tempFilePath,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };

        cacheManager.setAST(tempFilePath, tempModule);

        // Access - cache hit
        result = cacheManager.getAST(tempFilePath);
        expect(result).toEqual(tempModule);

        // Change file content
        fs.writeFileSync(tempFilePath, 'modified content', 'utf-8');

        // Access after change - cache miss due to hash mismatch
        result = cacheManager.getAST(tempFilePath);
        expect(result).toBeNull();

        const stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(2); // Two successful hits
        expect(stats.astCache.misses).toBe(1); // One miss after file change

        // Cleanup
        fs.unlinkSync(tempFilePath);
      });

      it('should handle 100% hit rate', () => {
        const mockModule: TSModule = {
          name: 'TestModule',
          filePath: testFilePath,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };

        cacheManager.setAST(testFilePath, mockModule);

        // Multiple hits, no misses
        for (let i = 0; i < 10; i++) {
          cacheManager.getAST(testFilePath);
        }

        const stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(10);
        expect(stats.astCache.misses).toBe(0);
        expect(stats.astCache.hitRate).toBe(1.0); // 100% hit rate
      });
    });

    describe('Cache TTL', () => {
      it('should invalidate cache after TTL expires', () => {
        const shortTTLCache = new CacheManager({ cacheTTL: 100 }); // 100ms TTL

        const mockModule: TSModule = {
          name: 'TestModule',
          filePath: testFilePath,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };

        shortTTLCache.setAST(testFilePath, mockModule);

        // Immediate access - should hit
        let result = shortTTLCache.getAST(testFilePath);
        expect(result).toEqual(mockModule);

        // Wait for TTL to expire
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            // Access after TTL - should miss
            result = shortTTLCache.getAST(testFilePath);
            expect(result).toBeNull();

            const stats = shortTTLCache.getStats();
            expect(stats.astCache.hits).toBe(1);
            expect(stats.astCache.misses).toBe(1);
            expect(stats.astCache.hitRate).toBe(0.5);

            resolve();
          }, 150);
        });
      });
    });
  });

  describe('Tier 2: Module Cache', () => {
    describe('Hit Rate Tracking', () => {
      it('should track module cache hits correctly', () => {
        const mockClass: TSClassInterface = {
          name: 'TestClass',
          filePath: testFilePath,
          decorators: [],
          methods: [],
          properties: [],

          implements: [],
          imports: [],
          exports: [],
        };
        const mockClasses = [new TSClass(mockClass)];

        // Initial stats
        let stats = cacheManager.getStats();
        expect(stats.moduleCache.hits).toBe(0);
        expect(stats.moduleCache.misses).toBe(0);
        expect(stats.moduleCache.hitRate).toBe(0);

        // First access - cache miss
        let result = cacheManager.getModuleAnalysis('test-key');
        expect(result).toBeNull();

        stats = cacheManager.getStats();
        expect(stats.moduleCache.hits).toBe(0);
        expect(stats.moduleCache.misses).toBe(1);

        // Store in cache
        cacheManager.setModuleAnalysis('test-key', mockClasses);

        // Second access - cache hit
        result = cacheManager.getModuleAnalysis('test-key');
        expect(result).toEqual(mockClasses);

        stats = cacheManager.getStats();
        expect(stats.moduleCache.hits).toBe(1);
        expect(stats.moduleCache.misses).toBe(1);
        expect(stats.moduleCache.hitRate).toBe(0.5);

        // Multiple hits
        for (let i = 0; i < 3; i++) {
          cacheManager.getModuleAnalysis('test-key');
        }

        stats = cacheManager.getStats();
        expect(stats.moduleCache.hits).toBe(4);
        expect(stats.moduleCache.misses).toBe(1);
        expect(stats.moduleCache.hitRate).toBe(0.8); // 4 hits out of 5 total
      });

      it('should track separate hit rates for different keys', () => {
        const mockClasses1 = [
          new TSClass({
            name: 'Class1',
            filePath: 'file1.ts',
            decorators: [],
            methods: [],
            properties: [],

            implements: [],
            imports: [],
            exports: [],
          }),
        ];
        const mockClasses2 = [
          new TSClass({
            name: 'Class2',
            filePath: 'file2.ts',
            decorators: [],
            methods: [],
            properties: [],

            implements: [],
            imports: [],
            exports: [],
          }),
        ];

        // Set up cache for two different keys
        cacheManager.setModuleAnalysis('key1', mockClasses1);
        cacheManager.setModuleAnalysis('key2', mockClasses2);

        // Access pattern: hit, miss, hit, hit, miss
        cacheManager.getModuleAnalysis('key1'); // hit
        cacheManager.getModuleAnalysis('key3'); // miss
        cacheManager.getModuleAnalysis('key2'); // hit
        cacheManager.getModuleAnalysis('key1'); // hit
        cacheManager.getModuleAnalysis('key4'); // miss

        const stats = cacheManager.getStats();
        expect(stats.moduleCache.hits).toBe(3);
        expect(stats.moduleCache.misses).toBe(2);
        expect(stats.moduleCache.hitRate).toBe(0.6); // 3 hits out of 5 total
      });
    });
  });

  describe('Tier 3: Rule Cache', () => {
    describe('Hit Rate Tracking', () => {
      it('should track rule cache hits correctly', () => {
        const mockResult = { violations: [], passed: true };

        // Initial stats
        let stats = cacheManager.getStats();
        expect(stats.ruleCache.hits).toBe(0);
        expect(stats.ruleCache.misses).toBe(0);
        expect(stats.ruleCache.hitRate).toBe(0);

        // First access - cache miss
        let result = cacheManager.getRuleEvaluation('rule-key');
        expect(result).toBeNull();

        stats = cacheManager.getStats();
        expect(stats.ruleCache.misses).toBe(1);

        // Store in cache
        cacheManager.setRuleEvaluation('rule-key', mockResult);

        // Second access - cache hit
        result = cacheManager.getRuleEvaluation('rule-key');
        expect(result).toEqual(mockResult);

        stats = cacheManager.getStats();
        expect(stats.ruleCache.hits).toBe(1);
        expect(stats.ruleCache.misses).toBe(1);
        expect(stats.ruleCache.hitRate).toBe(0.5);
      });

      it('should handle complex rule result caching', () => {
        const complexResult = {
          violations: [
            { message: 'Violation 1', className: 'ClassA' },
            { message: 'Violation 2', className: 'ClassB' },
          ],
          passed: false,
          metadata: { ruleType: 'dependency', severity: 'error' },
        };

        cacheManager.setRuleEvaluation('complex-rule', complexResult);

        // Multiple accesses
        for (let i = 0; i < 5; i++) {
          const result = cacheManager.getRuleEvaluation('complex-rule');
          expect(result).toEqual(complexResult);
        }

        const stats = cacheManager.getStats();
        expect(stats.ruleCache.hits).toBe(5);
        expect(stats.ruleCache.misses).toBe(0);
        expect(stats.ruleCache.hitRate).toBe(1.0);
      });
    });
  });

  describe('Cache Eviction', () => {
    it('should evict oldest entries when cache exceeds max size', () => {
      const smallCache = new CacheManager({ maxCacheSize: 10 });

      // Fill cache to capacity
      for (let i = 0; i < 10; i++) {
        const mockModule: TSModule = {
          name: 'TestModule',
          filePath: `file${i}.ts`,
          classes: [],
          interfaces: [],
          functions: [],
          imports: [],
          exports: [],
        };
        // Create temp files for hash validation
        const tempPath = path.join(__dirname, `temp-${i}.ts`);
        fs.writeFileSync(tempPath, `content ${i}`, 'utf-8');
        smallCache.setAST(tempPath, mockModule);
      }

      let stats = smallCache.getStats();
      expect(stats.astCache.size).toBe(10);

      // Add one more to trigger eviction
      const tempPath = path.join(__dirname, 'temp-11.ts');
      fs.writeFileSync(tempPath, 'content 11', 'utf-8');
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: tempPath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };
      smallCache.setAST(tempPath, mockModule);

      stats = smallCache.getStats();
      // Should evict ~20% of entries (2 entries), leaving 9
      expect(stats.astCache.size).toBeLessThan(11);
      expect(stats.astCache.size).toBeGreaterThanOrEqual(9);

      // Cleanup temp files
      for (let i = 0; i < 10; i++) {
        const tempPath = path.join(__dirname, `temp-${i}.ts`);
        if (fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
    });
  });

  describe('Cache Clearing', () => {
    it('should clear all caches and reset hit/miss counters', () => {
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };

      // Populate all cache tiers
      cacheManager.setAST(testFilePath, mockModule);
      cacheManager.setModuleAnalysis('key1', []);
      cacheManager.setRuleEvaluation('rule1', {});

      // Generate some hits
      cacheManager.getAST(testFilePath);
      cacheManager.getModuleAnalysis('key1');
      cacheManager.getRuleEvaluation('rule1');

      // Verify caches have data
      let stats = cacheManager.getStats();
      expect(stats.astCache.size).toBeGreaterThan(0);
      expect(stats.moduleCache.size).toBeGreaterThan(0);
      expect(stats.ruleCache.size).toBeGreaterThan(0);
      expect(stats.astCache.hits).toBeGreaterThan(0);

      // Clear all
      cacheManager.clearAll();

      // Verify everything is reset
      stats = cacheManager.getStats();
      expect(stats.astCache.size).toBe(0);
      expect(stats.moduleCache.size).toBe(0);
      expect(stats.ruleCache.size).toBe(0);
      expect(stats.astCache.hits).toBe(0);
      expect(stats.astCache.misses).toBe(0);
      expect(stats.moduleCache.hits).toBe(0);
      expect(stats.moduleCache.misses).toBe(0);
      expect(stats.ruleCache.hits).toBe(0);
      expect(stats.ruleCache.misses).toBe(0);
    });

    it('should clear specific cache tier only', () => {
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };

      // Populate all tiers
      cacheManager.setAST(testFilePath, mockModule);
      cacheManager.setModuleAnalysis('key1', []);
      cacheManager.setRuleEvaluation('rule1', {});

      // Generate hits
      cacheManager.getAST(testFilePath);
      cacheManager.getModuleAnalysis('key1');
      cacheManager.getRuleEvaluation('rule1');

      // Clear only tier 2
      cacheManager.clearTier(2);

      const stats = cacheManager.getStats();
      expect(stats.astCache.size).toBeGreaterThan(0); // Tier 1 preserved
      expect(stats.moduleCache.size).toBe(0); // Tier 2 cleared
      expect(stats.ruleCache.size).toBeGreaterThan(0); // Tier 3 preserved
      expect(stats.moduleCache.hits).toBe(0); // Tier 2 counters reset
      expect(stats.moduleCache.misses).toBe(0);
      expect(stats.astCache.hits).toBeGreaterThan(0); // Other counters preserved
    });
  });

  describe('Global Cache', () => {
    afterEach(() => {
      resetGlobalCache();
    });

    it('should return singleton global cache instance', () => {
      const cache1 = getGlobalCache();
      const cache2 = getGlobalCache();

      expect(cache1).toBe(cache2); // Same instance
    });

    it('should track stats across global cache accesses', () => {
      const cache = getGlobalCache();
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };

      cache.setAST(testFilePath, mockModule);
      cache.getAST(testFilePath);

      const stats = cache.getStats();
      expect(stats.astCache.hits).toBe(1);

      // Access via getGlobalCache again
      const cache2 = getGlobalCache();
      cache2.getAST(testFilePath);

      const stats2 = cache2.getStats();
      expect(stats2.astCache.hits).toBe(2); // Accumulated stats
    });

    it('should reset global cache instance', () => {
      const cache1 = getGlobalCache();
      cache1.setAST(testFilePath, {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      });

      resetGlobalCache();

      const cache2 = getGlobalCache();
      expect(cache2).not.toBe(cache1); // Different instance
      expect(cache2.getStats().astCache.size).toBe(0); // Fresh cache
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero accesses gracefully', () => {
      const stats = cacheManager.getStats();
      expect(stats.astCache.hitRate).toBe(0);
      expect(stats.moduleCache.hitRate).toBe(0);
      expect(stats.ruleCache.hitRate).toBe(0);
    });

    it('should handle concurrent cache accesses', () => {
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };

      cacheManager.setAST(testFilePath, mockModule);

      // Simulate concurrent accesses
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(Promise.resolve(cacheManager.getAST(testFilePath)));
      }

      return Promise.all(promises).then(() => {
        const stats = cacheManager.getStats();
        expect(stats.astCache.hits).toBe(100);
        expect(stats.astCache.misses).toBe(0);
        expect(stats.astCache.hitRate).toBe(1.0);
      });
    });

    it('should maintain accurate stats after mixed hit/miss pattern', () => {
      const mockModule: TSModule = {
        name: 'TestModule',
        filePath: testFilePath,
        classes: [],
        interfaces: [],
        functions: [],
        imports: [],
        exports: [],
      };

      cacheManager.setAST(testFilePath, mockModule);

      // Complex access pattern
      cacheManager.getAST(testFilePath); // hit
      cacheManager.getAST('nonexistent1.ts'); // miss
      cacheManager.getAST(testFilePath); // hit
      cacheManager.getAST('nonexistent2.ts'); // miss
      cacheManager.getAST(testFilePath); // hit
      cacheManager.getAST('nonexistent3.ts'); // miss

      const stats = cacheManager.getStats();
      expect(stats.astCache.hits).toBe(3);
      expect(stats.astCache.misses).toBe(3);
      expect(stats.astCache.hitRate).toBe(0.5);
    });
  });
});
