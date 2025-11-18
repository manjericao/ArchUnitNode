import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import { ArchRuleDefinition } from '../../src/lang/ArchRuleDefinition';
import { GraphBuilder } from '../../src/graph/GraphBuilder';
import * as path from 'path';
import * as fs from 'fs';

describe('Performance Tests', () => {
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  describe('Code Analysis Performance', () => {
    it('should analyze codebase within acceptable time', async () => {
      const analyzer = new CodeAnalyzer();
      const startTime = performance.now();

      const classes = await analyzer.analyze(fixturesPath);

      const duration = performance.now() - startTime;

      console.log('\nCode Analysis Performance:');
      console.log(`  Files analyzed: ${classes.size()}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);
      console.log(`  Avg per class: ${(duration / classes.size()).toFixed(2)}ms`);

      // Should complete quickly for small codebase
      expect(duration).toBeLessThan(1000); // < 1 second
    });

    it('should handle large file counts efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const tempDir = path.join(__dirname, 'temp-large');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create 100 files
      const fileCount = 100;
      const files: string[] = [];

      for (let i = 0; i < fileCount; i++) {
        const filePath = path.join(tempDir, `File${i}.ts`);
        fs.writeFileSync(
          filePath,
          `
          export class Class${i} {
            private field${i}: string;
            method${i}() {
              return ${i};
            }
          }
          `,
          'utf-8'
        );
        files.push(filePath);
      }

      const startTime = performance.now();
      const classes = await analyzer.analyze(tempDir);
      const duration = performance.now() - startTime;

      const avgPerFile = duration / fileCount;

      console.log('\nLarge Codebase Performance:');
      console.log(`  Files: ${fileCount}`);
      console.log(`  Classes: ${classes.size()}`);
      console.log(`  Total time: ${duration.toFixed(2)}ms`);
      console.log(`  Avg per file: ${avgPerFile.toFixed(2)}ms`);

      // Should scale linearly
      expect(avgPerFile).toBeLessThan(20); // < 20ms per file

      // Cleanup
      for (const file of files) {
        fs.unlinkSync(file);
      }
      fs.rmdirSync(tempDir);
    });
  });

  describe('Rule Evaluation Performance', () => {
    it('should evaluate rules efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .beAnnotatedWith('Service');

      const startTime = performance.now();
      const violations = rule.check(classes);
      const duration = performance.now() - startTime;

      console.log('\nRule Evaluation Performance:');
      console.log(`  Classes checked: ${classes.size()}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);
      console.log(`  Violations: ${violations.length}`);

      // Rule evaluation should be fast
      expect(duration).toBeLessThan(100); // < 100ms
    });

    it('should handle complex rules efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .and()
        .areAnnotatedWith('Service')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('models', 'repositories', 'types');

      const startTime = performance.now();
      const violations = rule.check(classes);
      const duration = performance.now() - startTime;

      console.log('\nComplex Rule Performance:');
      console.log(`  Duration: ${duration.toFixed(2)}ms`);
      console.log(`  Violations: ${violations.length}`);

      // Even complex rules should be reasonably fast
      expect(duration).toBeLessThan(200); // < 200ms
    });

    it('should evaluate multiple rules efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const rules = [
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .beAnnotatedWith('Service'),
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .beAnnotatedWith('Controller'),
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('repositories')
          .should()
          .beAnnotatedWith('Repository'),
        ArchRuleDefinition.classes()
          .that()
          .haveSimpleNameEndingWith('Service')
          .should()
          .resideInPackage('services'),
        ArchRuleDefinition.classes()
          .that()
          .haveSimpleNameEndingWith('Controller')
          .should()
          .resideInPackage('controllers'),
      ];

      const startTime = performance.now();

      rules.forEach((rule) => rule.check(classes));

      const duration = performance.now() - startTime;
      const avgPerRule = duration / rules.length;

      console.log('\nMultiple Rules Performance:');
      console.log(`  Rules evaluated: ${rules.length}`);
      console.log(`  Total duration: ${duration.toFixed(2)}ms`);
      console.log(`  Avg per rule: ${avgPerRule.toFixed(2)}ms`);

      // Should evaluate multiple rules quickly
      expect(avgPerRule).toBeLessThan(50); // < 50ms per rule
    });
  });

  describe('Dependency Graph Performance', () => {
    it('should build dependency graph efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const startTime = performance.now();
      const graph = new GraphBuilder().build(classes);
      const duration = performance.now() - startTime;

      console.log('\nDependency Graph Build Performance:');
      console.log(`  Nodes: ${graph.getNodes().length}`);
      console.log(`  Edges: ${graph.getEdges().length}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Graph building should be fast
      expect(duration).toBeLessThan(100); // < 100ms
    });

    it('should detect cycles efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);
      const graph = new GraphBuilder().build(classes);

      const startTime = performance.now();
      const hasCycles = graph.hasCycles();
      const duration = performance.now() - startTime;

      console.log('\nCycle Detection Performance:');
      console.log(`  Nodes: ${graph.getNodes().length}`);
      console.log(`  Has cycles: ${hasCycles}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Cycle detection should be fast
      expect(duration).toBeLessThan(50); // < 50ms
    });

    it('should find all cycles efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);
      const graph = new GraphBuilder().build(classes);

      const startTime = performance.now();
      const cycles = graph.findCycles();
      const duration = performance.now() - startTime;

      console.log('\nFind All Cycles Performance:');
      console.log(`  Nodes: ${graph.getNodes().length}`);
      console.log(`  Cycles found: ${cycles.length}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Finding all cycles should be reasonably fast
      expect(duration).toBeLessThan(100); // < 100ms
    });
  });

  describe('Pattern Matching Performance', () => {
    it('should filter by package pattern efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const startTime = performance.now();
      const filtered = classes.resideInPackage('services');
      const duration = performance.now() - startTime;

      console.log('\nPackage Filter Performance:');
      console.log(`  Total classes: ${classes.size()}`);
      console.log(`  Filtered classes: ${filtered.size()}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Filtering should be very fast
      expect(duration).toBeLessThan(10); // < 10ms
    });

    it('should filter by name pattern efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const startTime = performance.now();
      const filtered = classes.that((cls) => cls.name.includes('User'));
      const duration = performance.now() - startTime;

      console.log('\nName Filter Performance:');
      console.log(`  Total classes: ${classes.size()}`);
      console.log(`  Filtered classes: ${filtered.size()}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Name filtering should be very fast
      expect(duration).toBeLessThan(10); // < 10ms
    });

    it('should filter with complex predicates efficiently', async () => {
      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const startTime = performance.now();
      const filtered = classes.that((cls) => {
        return cls.methods.length > 2 && cls.decorators.length > 0 && cls.name.endsWith('Service');
      });
      const duration = performance.now() - startTime;

      console.log('\nComplex Predicate Filter Performance:');
      console.log(`  Total classes: ${classes.size()}`);
      console.log(`  Filtered classes: ${filtered.size()}`);
      console.log(`  Duration: ${duration.toFixed(2)}ms`);

      // Complex filtering should still be fast
      expect(duration).toBeLessThan(20); // < 20ms
    });
  });

  describe('Memory Usage', () => {
    it('should have reasonable memory footprint', async () => {
      global.gc && global.gc(); // Force garbage collection if available

      const memBefore = process.memoryUsage().heapUsed / 1024 / 1024; // MB

      const analyzer = new CodeAnalyzer();
      const classes = await analyzer.analyze(fixturesPath);

      const memAfter = process.memoryUsage().heapUsed / 1024 / 1024; // MB
      const memDelta = memAfter - memBefore;
      const memPerClass = memDelta / classes.size();

      console.log('\nMemory Usage:');
      console.log(`  Classes: ${classes.size()}`);
      console.log(`  Memory before: ${memBefore.toFixed(2)} MB`);
      console.log(`  Memory after: ${memAfter.toFixed(2)} MB`);
      console.log(`  Memory delta: ${memDelta.toFixed(2)} MB`);
      console.log(`  Memory per class: ${memPerClass.toFixed(3)} MB`);

      // Memory usage should be reasonable
      expect(memDelta).toBeLessThan(50); // < 50 MB for small codebase
    });
  });

  describe('Scalability Tests', () => {
    it('should scale linearly with codebase size', async () => {
      const analyzer = new CodeAnalyzer();
      const tempDir = path.join(__dirname, 'temp-scale');

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const sizes = [10, 20, 40, 80];
      const durations: number[] = [];

      for (const size of sizes) {
        // Create files
        const files: string[] = [];
        for (let i = 0; i < size; i++) {
          const filePath = path.join(tempDir, `File${i}.ts`);
          fs.writeFileSync(
            filePath,
            `export class Class${i} { method() { return ${i}; } }`,
            'utf-8'
          );
          files.push(filePath);
        }

        // Measure analysis time
        const startTime = performance.now();
        await analyzer.analyze(tempDir);
        const duration = performance.now() - startTime;
        durations.push(duration);

        // Cleanup
        for (const file of files) {
          try {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          } catch (err) {
            // Ignore cleanup errors
          }
        }
      }

      // Final cleanup of temp directory
      try {
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
      } catch (err) {
        // Ignore cleanup errors
      }

      console.log('\nScalability Test:');
      sizes.forEach((size, i) => {
        const perFile = durations[i] / size;
        console.log(`  ${size} files: ${durations[i].toFixed(2)}ms (${perFile.toFixed(2)}ms/file)`);
      });

      // Check for linear scaling (not exponential)
      const ratio = durations[3] / durations[0]; // 80 files vs 10 files
      const expectedRatio = sizes[3] / sizes[0]; // 8x

      console.log(`  Scaling factor: ${ratio.toFixed(2)}x (expected: ${expectedRatio}x)`);

      // Should scale close to linearly (within 2x of expected)
      expect(ratio).toBeLessThan(expectedRatio * 2);

      // Clean up temporary directory
      if (fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  });
});
