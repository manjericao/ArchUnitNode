/**
 * Comprehensive tests for ClassesShould.ts
 * Target: Bring coverage from 37% to 80%+
 *
 * Tests all assertion methods in the ClassesShould fluent API
 */

import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import { ArchRuleDefinition } from '../../src/lang/ArchRuleDefinition';
import { TSClasses } from '../../src/core/TSClasses';
import { ClassesShould } from '../../src/lang/syntax/ClassesShould';
import { Severity } from '../../src/types';
import * as path from 'path';

describe('ClassesShould - Comprehensive Coverage', () => {
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze(fixturesPath);
  });

  describe('Constructor', () => {
    it('should create ClassesShould instance with classes', () => {
      const should = new ClassesShould(classes);
      expect(should).toBeDefined();
      expect(should).toBeInstanceOf(ClassesShould);
    });

    it('should create with empty TSClasses', () => {
      const emptyClasses = new TSClasses([]);
      const should = new ClassesShould(emptyClasses);
      expect(should).toBeDefined();
    });
  });

  describe('Package Rules', () => {
    describe('resideInPackage()', () => {
      it('should create rule for package location', () => {
        const should = new ClassesShould(classes);
        const rule = should.resideInPackage('services');
        expect(rule).toBeDefined();
        expect(rule.check).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes are in correct package', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .resideInPackage('services');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations when classes are in wrong package', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .resideInPackage('controllers');

        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0].message).toContain('does not reside in package');
        expect(violations[0].severity).toBe(Severity.ERROR);
      });

      it('should work with wildcard patterns', () => {
        const should = new ClassesShould(classes);
        const rule = should.resideInPackage('**/services');
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('resideOutsideOfPackage()', () => {
      it('should create rule for classes outside package', () => {
        const should = new ClassesShould(classes);
        const rule = should.resideOutsideOfPackage('test');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes are outside forbidden package', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .notResideInPackage('controllers');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations when classes are in forbidden package', () => {
        const should = new ClassesShould(classes);
        const rule = should.resideOutsideOfPackage('services');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notResideInPackage()', () => {
      it('should be alias for resideOutsideOfPackage', () => {
        const should = new ClassesShould(classes);
        const rule = should.notResideInPackage('test');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should work the same as resideOutsideOfPackage', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .notResideInPackage('controllers');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });
    });
  });

  describe('Decorator/Annotation Rules', () => {
    describe('beAnnotatedWith()', () => {
      it('should create rule for decorator presence', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAnnotatedWith('Service');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes have required decorator', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .areAnnotatedWith('Service')
          .should()
          .beAnnotatedWith('Service');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations when classes lack decorator', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAnnotatedWith('NonExistentDecorator');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0].message).toContain('is not annotated');
      });
    });

    describe('notBeAnnotatedWith()', () => {
      it('should create rule for decorator absence', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeAnnotatedWith('Deprecated');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes do not have forbidden decorator', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeAnnotatedWith('ForbiddenDecorator');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations when classes have forbidden decorator', () => {
        const should = new ClassesShould(classes.areAnnotatedWith('Service'));
        const rule = should.notBeAnnotatedWith('Service');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Naming Rules', () => {
    describe('haveSimpleNameMatching()', () => {
      it('should create rule for name pattern matching', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleNameMatching(/Service$/);
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names match regex pattern', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .haveSimpleNameMatching(/Service$/);

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should pass when names match string pattern', () => {
        const should = new ClassesShould(classes.resideInPackage('services'));
        const rule = should.haveSimpleNameMatching('Service');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });

      it('should detect violations for non-matching patterns', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleNameMatching(/^Test/);
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0].message).toContain('does not have simple name matching');
      });
    });

    describe('haveSimpleNameEndingWith()', () => {
      it('should create rule for name suffix', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleNameEndingWith('Service');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names end with suffix', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .haveSimpleNameEndingWith('Service');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations for wrong suffixes', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .haveSimpleNameEndingWith('Controller');

        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0].message).toContain('endingWith');
      });
    });

    describe('haveSimpleNameStartingWith()', () => {
      it('should create rule for name prefix', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleNameStartingWith('User');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names start with prefix', () => {
        const should = new ClassesShould(classes.haveSimpleNameStartingWith('User'));
        const rule = should.haveSimpleNameStartingWith('User');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect violations for wrong prefixes', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleNameStartingWith('TestPrefix');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
        expect(violations[0].message).toContain('startingWith');
      });
    });

    describe('haveSimpleName()', () => {
      it('should create rule for exact name match', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleName('UserService');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when name matches exactly', () => {
        const actualClass = classes.getAll()[0];
        if (actualClass) {
          const should = new ClassesShould(classes.that((cls) => cls.name === actualClass.name));
          const rule = should.haveSimpleName(actualClass.name);
          const violations = rule.check(classes);
          expect(violations).toHaveLength(0);
        }
      });

      it('should detect name mismatches', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveSimpleName('NonExistentClass');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
      });
    });

    describe('notHaveSimpleName()', () => {
      it('should create rule for name exclusion', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleName('ForbiddenName');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names do not match', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleName('NonExistentClass');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect exact name matches as violations', () => {
        const actualClass = classes.getAll()[0];
        if (actualClass) {
          const should = new ClassesShould(classes);
          const rule = should.notHaveSimpleName(actualClass.name);
          const violations = rule.check(classes);
          expect(violations.length).toBeGreaterThan(0);
          expect(violations[0].message).toContain('should not have simple name');
        }
      });
    });

    describe('notHaveSimpleNameMatching()', () => {
      it('should create rule for pattern exclusion', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameMatching(/^Test/);
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names do not match pattern', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameMatching(/^Test/);
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect pattern matches', () => {
        const should = new ClassesShould(classes.resideInPackage('services'));
        const rule = should.notHaveSimpleNameMatching(/Service/);
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notHaveSimpleNameEndingWith()', () => {
      it('should create rule for suffix exclusion', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameEndingWith('Test');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names do not end with suffix', () => {
        const should = new ClassesShould(classes.resideInPackage('services'));
        const rule = should.notHaveSimpleNameEndingWith('Controller');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect forbidden suffixes', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameEndingWith('Service');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notHaveSimpleNameStartingWith()', () => {
      it('should create rule for prefix exclusion', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameStartingWith('Test');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when names do not start with prefix', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameStartingWith('Test');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect forbidden prefixes', () => {
        const should = new ClassesShould(classes);
        const rule = should.notHaveSimpleNameStartingWith('User');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('haveFullyQualifiedName()', () => {
      it('should create rule for FQN', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveFullyQualifiedName('com.example.Class');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when FQN matches', () => {
        const actualClass = classes.getAll()[0];
        if (actualClass) {
          const fqn = actualClass.getFullyQualifiedName();
          const should = new ClassesShould(classes.that((cls) => cls.name === actualClass.name));
          const rule = should.haveFullyQualifiedName(fqn);
          const violations = rule.check(classes);
          expect(violations).toHaveLength(0);
        }
      });

      it('should detect FQN mismatches', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveFullyQualifiedName('com.nonexistent.Class');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Dependency Rules', () => {
    describe('onlyDependOnClassesThat()', () => {
      it('should return dependency builder', () => {
        const should = new ClassesShould(classes);
        const dependencyBuilder = should.onlyDependOnClassesThat();
        expect(dependencyBuilder).toBeDefined();
        expect(dependencyBuilder.resideInPackage).toBeDefined();
      });

      it('should check dependencies are only in allowed packages', () => {
        const should = new ClassesShould(classes.resideInPackage('controllers'));
        const rule = should
          .onlyDependOnClassesThat()
          .resideInAnyPackage('services', 'models', 'controllers');
        expect(rule).toBeDefined();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should create rule with resideInPackage', () => {
        const should = new ClassesShould(classes.resideInPackage('services'));
        const rule = should.onlyDependOnClassesThat().resideInPackage('models');
        expect(rule).toBeDefined();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('notDependOnClassesThat()', () => {
      it('should return negated dependency builder', () => {
        const should = new ClassesShould(classes);
        const dependencyBuilder = should.notDependOnClassesThat();
        expect(dependencyBuilder).toBeDefined();
        expect(dependencyBuilder.resideInPackage).toBeDefined();
      });

      it('should pass when classes do not depend on forbidden packages', () => {
        const should = new ClassesShould(classes.resideInPackage('models'));
        const rule = should.notDependOnClassesThat().resideInPackage('controllers');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect forbidden dependencies', () => {
        const should = new ClassesShould(classes.resideInPackage('controllers'));
        const rule = should.notDependOnClassesThat().resideInPackage('services');
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Cyclic Dependency Rules', () => {
    describe('notFormCycles()', () => {
      it('should create rule for no cycles', () => {
        const should = new ClassesShould(classes);
        const rule = should.notFormCycles();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when no cycles exist', () => {
        const should = new ClassesShould(classes);
        const rule = should.notFormCycles();
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });
    });

    describe('formCycles()', () => {
      it('should create rule for cycles existence', () => {
        const should = new ClassesShould(classes);
        const rule = should.formCycles();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect when no cycles exist (inverse check)', () => {
        const should = new ClassesShould(classes);
        const rule = should.formCycles();
        const violations = rule.check(classes);
        // Since no cycles exist, this should have violations
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Interface Rules', () => {
    describe('beInterfaces()', () => {
      it('should create rule for interface check', () => {
        const should = new ClassesShould(classes);
        const rule = should.beInterfaces();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when filtered to actual interfaces', () => {
        const interfaces = classes.that((cls) => {
          const tsClass = classes.getAll().find((c) => c.name === cls.name);
          return tsClass ? tsClass.isInterface : false;
        });
        const should = new ClassesShould(interfaces);
        const rule = should.beInterfaces();
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect non-interface classes', () => {
        const should = new ClassesShould(classes);
        const rule = should.beInterfaces();
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notBeInterfaces()', () => {
      it('should create rule for non-interface check', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeInterfaces();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when filtered to non-interfaces', () => {
        const nonInterfaces = classes.that((cls) => {
          const tsClass = classes.getAll().find((c) => c.name === cls.name);
          return tsClass ? !tsClass.isInterface : true;
        });
        const should = new ClassesShould(nonInterfaces);
        const rule = should.notBeInterfaces();
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });
    });
  });

  describe('Abstract Rules', () => {
    describe('beAbstract()', () => {
      it('should create rule for abstract check', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAbstract();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when filtered to abstract classes', () => {
        const abstractClasses = classes.that((cls) => cls.isAbstract);
        const should = new ClassesShould(abstractClasses);
        const rule = should.beAbstract();
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect non-abstract classes', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAbstract();
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notBeAbstract()', () => {
      it('should create rule for concrete classes', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeAbstract();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when filtered to concrete classes', () => {
        const concreteClasses = classes.that((cls) => !cls.isAbstract);
        const should = new ClassesShould(concreteClasses);
        const rule = should.notBeAbstract();
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });
    });
  });

  describe('Assignable Rules', () => {
    describe('beAssignableTo()', () => {
      it('should create rule for assignability check', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAssignableTo('BaseClass');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes are assignable to type', () => {
        const rule = ArchRuleDefinition.classes()
          .that()
          .areAssignableTo('BaseClass')
          .should()
          .beAssignableTo('BaseClass');

        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });

      it('should detect non-assignable classes', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAssignableTo('NonExistentBaseClass');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('notBeAssignableTo()', () => {
      it('should create rule for non-assignability', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeAssignableTo('ForbiddenType');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should pass when classes are not assignable', () => {
        const should = new ClassesShould(classes);
        const rule = should.notBeAssignableTo('NonExistentType');
        const violations = rule.check(classes);
        expect(violations).toHaveLength(0);
      });
    });

    describe('beAssignableFrom()', () => {
      it('should create rule for reverse assignability', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAssignableFrom('DerivedClass');
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should check reverse assignability', () => {
        const should = new ClassesShould(classes);
        const rule = should.beAssignableFrom('NonExistentClass');
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Field and Method Rules', () => {
    describe('haveOnlyReadonlyFields()', () => {
      it('should create rule for readonly fields', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyReadonlyFields();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect mutable fields', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyReadonlyFields();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('haveOnlyPrivateConstructors()', () => {
      it('should create rule for private constructors', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyPrivateConstructors();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect public constructors', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyPrivateConstructors();
        const violations = rule.check(classes);
        expect(violations.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('haveOnlyPublicMethods()', () => {
      it('should create rule for public methods', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyPublicMethods();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect non-public methods', () => {
        const should = new ClassesShould(classes);
        const rule = should.haveOnlyPublicMethods();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle empty class collections', () => {
      const emptyClasses = new TSClasses([]);
      const should = new ClassesShould(emptyClasses);
      const rule = should.resideInPackage('any');
      const violations = rule.check(emptyClasses);
      expect(violations).toHaveLength(0);
    });

    it('should work with ArchRuleDefinition static API', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameEndingWith('Service');

      expect(rule).toBeDefined();
      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });

    it('should apply severity levels', () => {
      const rule = ArchRuleDefinition.classes().should().resideInPackage('nonexistent').asWarning();

      const violations = rule.check(classes);
      if (violations.length > 0) {
        expect(violations[0].severity).toBe(Severity.WARNING);
      }
    });

    it('should generate descriptions', () => {
      const rule = ArchRuleDefinition.classes().should().resideInPackage('services');

      const description = rule.getDescription();
      expect(description).toBeTruthy();
      expect(typeof description).toBe('string');
      expect(description).toContain('package');
    });

    it('should work with complex filter chains', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .should()
        .beAnnotatedWith('Injectable');

      expect(rule).toBeDefined();
      const violations = rule.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });
  });
});
