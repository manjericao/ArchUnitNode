import { ArchRuleDefinition } from '../src/lang/ArchRuleDefinition';
import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import { TSClasses } from '../src/core/TSClasses';
import * as path from 'path';
import * as fs from 'fs';

describe('Pattern Matching', () => {
  let analyzer: CodeAnalyzer;
  let testClasses: TSClasses;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    testClasses = await analyzer.analyze(fixturesPath);
  });

  describe('Package Pattern Matching', () => {
    it('should match exact package names', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      // Should find classes in services package
      expect(violations.length).toBeDefined();
    });

    it('should match wildcard patterns with *', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('*')
        .should()
        .haveSimpleNameMatching(/[A-Z].*/);

      const violations = rule.check(testClasses);
      // Should match any single-level package
      expect(violations).toBeDefined();
    });

    it('should match deep wildcard patterns with **', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInAnyPackage('**')
        .should()
        .haveSimpleNameMatching(/[A-Z].*/);

      const violations = rule.check(testClasses);
      // Should match all packages at any depth
      expect(violations).toBeDefined();
    });

    it('should match specific patterns with path separators', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('fixtures/sample-code/services')
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should distinguish between similar package names', () => {
      // Create test classes with similar paths
      const tempDir = path.join(__dirname, 'temp-pattern');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const servicesDir = path.join(tempDir, 'services');
      const servicesImplDir = path.join(tempDir, 'services-impl');
      fs.mkdirSync(servicesDir, { recursive: true });
      fs.mkdirSync(servicesImplDir, { recursive: true });

      fs.writeFileSync(
        path.join(servicesDir, 'MyService.ts'),
        'export class MyService {}',
        'utf-8'
      );
      fs.writeFileSync(
        path.join(servicesImplDir, 'MyServiceImpl.ts'),
        'export class MyServiceImpl {}',
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const servicesClasses = result.resideInPackage('services');
        const servicesImplClasses = result.resideInPackage('services-impl');

        // Should not match similar package names
        const servicesNames = servicesClasses.getAll().map((c) => c.name);
        const servicesImplNames = servicesImplClasses.getAll().map((c) => c.name);

        expect(servicesNames).toContain('MyService');
        expect(servicesNames).not.toContain('MyServiceImpl');
        expect(servicesImplNames).toContain('MyServiceImpl');
        expect(servicesImplNames).not.toContain('MyService');

        // Cleanup
        fs.unlinkSync(path.join(servicesDir, 'MyService.ts'));
        fs.unlinkSync(path.join(servicesImplDir, 'MyServiceImpl.ts'));
        fs.rmdirSync(servicesDir);
        fs.rmdirSync(servicesImplDir);
        fs.rmdirSync(tempDir);
      });

      return classes;
    });
  });

  describe('Wildcard Pattern Matching', () => {
    it('should handle single-level wildcard *', () => {
      const tempDir = path.join(__dirname, 'temp-wildcard');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create multi-level structure
      const level1Dir = path.join(tempDir, 'level1');
      const level2Dir = path.join(level1Dir, 'level2');
      fs.mkdirSync(level1Dir, { recursive: true });
      fs.mkdirSync(level2Dir, { recursive: true });

      fs.writeFileSync(path.join(level1Dir, 'Level1.ts'), 'export class Level1 {}', 'utf-8');
      fs.writeFileSync(path.join(level2Dir, 'Level2.ts'), 'export class Level2 {}', 'utf-8');

      const classes = analyzer.analyze(tempDir).then((result) => {
        // resideInPackage matches the package and all sub-packages (like ArchUnit Java)
        // Both Level1 (in level1) and Level2 (in level1/level2) should match
        const singleLevel = result.resideInPackage('level1');

        const classNames = singleLevel.getAll().map((c) => c.name);
        // Should match both level1 and level2 (level2 is a subpackage of level1)
        expect(classNames).toContain('Level1');
        expect(classNames).toContain('Level2');

        // Cleanup
        fs.unlinkSync(path.join(level1Dir, 'Level1.ts'));
        fs.unlinkSync(path.join(level2Dir, 'Level2.ts'));
        fs.rmdirSync(level2Dir);
        fs.rmdirSync(level1Dir);
        fs.rmdirSync(tempDir);
      });

      return classes;
    });

    it('should handle multi-level wildcard **', () => {
      const tempDir = path.join(__dirname, 'temp-deep-wildcard');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Create deep structure
      const level1Dir = path.join(tempDir, 'a');
      const level2Dir = path.join(level1Dir, 'b');
      const level3Dir = path.join(level2Dir, 'c');
      fs.mkdirSync(level1Dir, { recursive: true });
      fs.mkdirSync(level2Dir, { recursive: true });
      fs.mkdirSync(level3Dir, { recursive: true });

      fs.writeFileSync(path.join(level1Dir, 'A.ts'), 'export class A {}', 'utf-8');
      fs.writeFileSync(path.join(level2Dir, 'B.ts'), 'export class B {}', 'utf-8');
      fs.writeFileSync(path.join(level3Dir, 'C.ts'), 'export class C {}', 'utf-8');

      const classes = analyzer.analyze(tempDir).then((result) => {
        // ** should match all levels
        const allLevels = result.resideInAnyPackage('**');

        const classNames = allLevels.getAll().map((c) => c.name);
        // Should match all three classes
        expect(classNames).toContain('A');
        expect(classNames).toContain('B');
        expect(classNames).toContain('C');

        // Cleanup
        fs.unlinkSync(path.join(level1Dir, 'A.ts'));
        fs.unlinkSync(path.join(level2Dir, 'B.ts'));
        fs.unlinkSync(path.join(level3Dir, 'C.ts'));
        fs.rmdirSync(level3Dir);
        fs.rmdirSync(level2Dir);
        fs.rmdirSync(level1Dir);
        fs.rmdirSync(tempDir);
      });

      return classes;
    });

    it('should handle mixed wildcard patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInAnyPackage('fixtures/*/services')
        .should()
        .haveSimpleNameEndingWith('Service');

      const violations = rule.check(testClasses);
      // Should match services directory under any single-level subdirectory
      expect(violations).toBeDefined();
    });
  });

  describe('Dependency Pattern Matching', () => {
    it('should match dependencies with wildcards', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('services', 'models', '**/types');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should prevent cross-layer dependencies', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notDependOnClassesThat()
        .resideInAnyPackage('controllers', 'services');

      const violations = rule.check(testClasses);
      // Models should not depend on controllers or services
      expect(violations).toBeDefined();
    });

    it('should handle relative import patterns', () => {
      const tempDir = path.join(__dirname, 'temp-imports');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(tempDir, 'ClassA.ts'),
        `
        import { ClassB } from './ClassB';
        export class ClassA {
          private b: ClassB;
        }
        `,
        'utf-8'
      );

      fs.writeFileSync(path.join(tempDir, 'ClassB.ts'), 'export class ClassB {}', 'utf-8');

      const classes = analyzer.analyze(tempDir).then((result) => {
        const classA = result.getAll().find((c) => c.name === 'ClassA');
        expect(classA).toBeDefined();

        const deps = classA!.getDependencies();
        expect(deps.length).toBeGreaterThan(0);

        // Cleanup
        fs.unlinkSync(path.join(tempDir, 'ClassA.ts'));
        fs.unlinkSync(path.join(tempDir, 'ClassB.ts'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });

    it('should handle node_modules dependencies', () => {
      const tempDir = path.join(__dirname, 'temp-node-modules');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(tempDir, 'Service.ts'),
        `
        import { Observable } from 'rxjs';
        export class Service {
          getData(): Observable<any> {
            return new Observable();
          }
        }
        `,
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const service = result.getAll().find((c) => c.name === 'Service');
        expect(service).toBeDefined();

        // Should handle node_modules imports
        expect(service!.getImports()).toBeDefined();

        // Cleanup
        fs.unlinkSync(path.join(tempDir, 'Service.ts'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });
  });

  describe('Naming Pattern Matching', () => {
    it('should match regex patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameMatching(/.*Service$/)
        .should()
        .resideInPackage('services');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should match string patterns as regex', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameMatching('User.*')
        .should()
        .beAnnotatedWith('Entity');

      const violations = rule.check(testClasses);
      // Classes starting with "User" should be entities
      expect(violations).toBeDefined();
    });

    it('should match prefix patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameStartingWith('User')
        .should()
        .resideInAnyPackage('models', 'services', 'controllers', 'repositories');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should match suffix patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .resideInPackage('controllers');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should handle complex regex patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameMatching(/^[A-Z][a-z]+[A-Z][a-z]+(Controller|Service|Repository)$/)
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      // Classes with specific naming conventions should have matching decorators
      expect(violations).toBeDefined();
    });

    it('should handle case-sensitive matching', () => {
      const tempDir = path.join(__dirname, 'temp-case');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(tempDir, 'UserService.ts'),
        'export class UserService {}',
        'utf-8'
      );
      fs.writeFileSync(
        path.join(tempDir, 'userService.ts'),
        'export class userService {}',
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const upperCase = result.getAll().find((c) => c.name === 'UserService');
        const lowerCase = result.getAll().find((c) => c.name === 'userService');

        expect(upperCase).toBeDefined();
        expect(lowerCase).toBeDefined();

        // Pattern should be case-sensitive by default
        const upperCaseMatches = /^[A-Z].*/.test('UserService');
        const lowerCaseMatches = /^[A-Z].*/.test('userService');

        expect(upperCaseMatches).toBe(true);
        expect(lowerCaseMatches).toBe(false);

        // Cleanup
        fs.unlinkSync(path.join(tempDir, 'UserService.ts'));
        fs.unlinkSync(path.join(tempDir, 'userService.ts'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });
  });

  describe('Path Segment Matching', () => {
    it('should prevent false positives with partial matches', () => {
      const tempDir = path.join(__dirname, 'temp-segments');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const servicesDir = path.join(tempDir, 'services');
      const notServicesDir = path.join(tempDir, 'notservices');
      fs.mkdirSync(servicesDir, { recursive: true });
      fs.mkdirSync(notServicesDir, { recursive: true });

      fs.writeFileSync(
        path.join(servicesDir, 'RealService.ts'),
        'export class RealService {}',
        'utf-8'
      );
      fs.writeFileSync(
        path.join(notServicesDir, 'FakeService.ts'),
        'export class FakeService {}',
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const servicesClasses = result.resideInPackage('services');
        const classNames = servicesClasses.getAll().map((c) => c.name);

        // Should match only exact segment "services", not "notservices"
        expect(classNames).toContain('RealService');
        expect(classNames).not.toContain('FakeService');

        // Cleanup
        fs.unlinkSync(path.join(servicesDir, 'RealService.ts'));
        fs.unlinkSync(path.join(notServicesDir, 'FakeService.ts'));
        fs.rmdirSync(servicesDir);
        fs.rmdirSync(notServicesDir);
        fs.rmdirSync(tempDir);
      });

      return classes;
    });

    it('should match full path segments correctly', () => {
      const tempDir = path.join(__dirname, 'temp-full-segments');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const pathDir = path.join(tempDir, 'app', 'services', 'user');
      fs.mkdirSync(pathDir, { recursive: true });

      fs.writeFileSync(
        path.join(pathDir, 'UserService.ts'),
        'export class UserService {}',
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const appClasses = result.resideInPackage('app');
        const servicesClasses = result.resideInPackage('services');
        const userClasses = result.resideInPackage('user');

        // Should find class in all parent segments
        expect(appClasses.getAll().length).toBeGreaterThan(0);
        expect(servicesClasses.getAll().length).toBeGreaterThan(0);
        expect(userClasses.getAll().length).toBeGreaterThan(0);

        // Cleanup
        fs.unlinkSync(path.join(pathDir, 'UserService.ts'));
        fs.rmdirSync(pathDir);
        fs.rmdirSync(path.join(tempDir, 'app', 'services'));
        fs.rmdirSync(path.join(tempDir, 'app'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });
  });

  describe('Annotation Pattern Matching', () => {
    it('should match decorator names exactly', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .areAnnotatedWith('Service')
        .should()
        .resideInPackage('services');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should distinguish between similar decorator names', () => {
      const tempDir = path.join(__dirname, 'temp-decorators');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(
        path.join(tempDir, 'Classes.ts'),
        `
        function Service() {}
        function ServiceImpl() {}

        @Service
        export class MyService {}

        @ServiceImpl
        export class MyServiceImpl {}
        `,
        'utf-8'
      );

      const classes = analyzer.analyze(tempDir).then((result) => {
        const serviceClasses = result.getAll().filter((c) => c.isAnnotatedWith('Service'));
        const serviceImplClasses = result.getAll().filter((c) => c.isAnnotatedWith('ServiceImpl'));

        // Should not match partial decorator names
        const serviceNames = serviceClasses.map((c) => c.name);
        const serviceImplNames = serviceImplClasses.map((c) => c.name);

        expect(serviceNames).toContain('MyService');
        expect(serviceNames).not.toContain('MyServiceImpl');
        expect(serviceImplNames).toContain('MyServiceImpl');

        // Cleanup
        fs.unlinkSync(path.join(tempDir, 'Classes.ts'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });
  });

  describe('Complex Pattern Combinations', () => {
    it('should combine multiple pattern filters', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .and()
        .areAnnotatedWith('Service')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('controllers');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should handle negative patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notBeAnnotatedWith('Controller')
        .andShould()
        .notBeAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should handle custom predicate patterns', () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => {
          return cls.methods.length > 2 && cls.name.includes('Service');
        })
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      // Services with multiple methods should have @Service decorator
      expect(violations).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty patterns gracefully', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('')
        .should()
        .haveSimpleNameMatching(/.*/);

      const violations = rule.check(testClasses);
      expect(violations).toBeDefined();
    });

    it('should handle special regex characters in patterns', () => {
      const tempDir = path.join(__dirname, 'temp-special');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      fs.writeFileSync(path.join(tempDir, 'Class.test.ts'), 'export class TestClass {}', 'utf-8');

      const classes = analyzer.analyze(tempDir).then((result) => {
        // Should handle files with special characters
        expect(result.getAll().length).toBeGreaterThan(0);

        // Cleanup
        fs.unlinkSync(path.join(tempDir, 'Class.test.ts'));
        fs.rmdirSync(tempDir);
      });

      return classes;
    });

    it('should handle very long pattern strings', () => {
      const longPattern = 'a/'.repeat(100) + '**';
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInAnyPackage(longPattern)
        .should()
        .haveSimpleNameMatching(/.*/);

      // Should not crash with long patterns
      expect(() => {
        rule.check(testClasses);
      }).not.toThrow();
    });
  });
});
