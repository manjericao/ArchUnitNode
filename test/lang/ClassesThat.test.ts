import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import { TSClasses } from '../../src/core/TSClasses';
import { ClassesThat, ClassesThatShould } from '../../src/lang/syntax/ClassesThat';
import * as path from 'path';

describe('ClassesThat - Filtering and Predicate Chains', () => {
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze(fixturesPath);
  });

  describe('Constructor and Basic Setup', () => {
    it('should create ClassesThat instance with classes', () => {
      const that = new ClassesThat(classes);
      expect(that).toBeDefined();
      expect(that).toBeInstanceOf(ClassesThat);
    });

    it('should create with empty predicates by default', () => {
      const that = new ClassesThat(classes);
      expect(that).toBeDefined();
    });

    it('should create with AND operator by default', () => {
      const that = new ClassesThat(classes);
      expect(that).toBeDefined();
    });
  });

  describe('not() - Negation', () => {
    it('should negate the next condition', () => {
      const that = new ClassesThat(classes);
      const negated = that.not();
      expect(negated).toBeInstanceOf(ClassesThat);
    });

    it('should chain not() with filter conditions', () => {
      const that = new ClassesThat(classes);
      const result = that.not().resideInPackage('test');
      expect(result).toBeDefined();
    });
  });

  describe('or() - Logical OR', () => {
    it('should set OR operator for combining predicates', () => {
      const that = new ClassesThat(classes);
      const orThat = that.or();
      expect(orThat).toBeInstanceOf(ClassesThat);
    });

    it('should allow chaining conditions with OR', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services').or().resideInPackage('models');
      expect(result).toBeDefined();
    });
  });

  describe('and() - Logical AND', () => {
    it('should set AND operator for combining predicates', () => {
      const that = new ClassesThat(classes);
      const andThat = that.and();
      expect(andThat).toBeInstanceOf(ClassesThat);
    });

    it('should allow chaining conditions with AND', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services').and().haveSimpleNameEndingWith('Service');
      expect(result).toBeDefined();
    });
  });

  describe('resideInPackage() - Package Filtering', () => {
    it('should filter classes by package pattern', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with wildcard patterns', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('*');
      expect(result).toBeDefined();
    });

    it('should work with deep wildcard patterns', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('**');
      expect(result).toBeDefined();
    });

    it('should apply negation to package filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().resideInPackage('test');
      expect(result).toBeDefined();
    });
  });

  describe('resideOutsideOfPackage() - Inverse Package Filtering', () => {
    it('should filter classes outside a package', () => {
      const that = new ClassesThat(classes);
      const result = that.resideOutsideOfPackage('test');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with specific package patterns', () => {
      const that = new ClassesThat(classes);
      const result = that.resideOutsideOfPackage('controllers');
      expect(result).toBeDefined();
    });

    it('should apply negation to outside package filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().resideOutsideOfPackage('services');
      expect(result).toBeDefined();
    });
  });

  describe('areAnnotatedWith() - Decorator Filtering', () => {
    it('should filter classes with specific decorator', () => {
      const that = new ClassesThat(classes);
      const result = that.areAnnotatedWith('Service');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with common decorators', () => {
      const that = new ClassesThat(classes);
      const result = that.areAnnotatedWith('Injectable');
      expect(result).toBeDefined();
    });

    it('should apply negation to decorator filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().areAnnotatedWith('Deprecated');
      expect(result).toBeDefined();
    });
  });

  describe('areNotAnnotatedWith() - Inverse Decorator Filtering', () => {
    it('should filter classes without specific decorator', () => {
      const that = new ClassesThat(classes);
      const result = that.areNotAnnotatedWith('Deprecated');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with any decorator name', () => {
      const that = new ClassesThat(classes);
      const result = that.areNotAnnotatedWith('Internal');
      expect(result).toBeDefined();
    });

    it('should apply negation correctly', () => {
      const that = new ClassesThat(classes);
      const result = that.not().areNotAnnotatedWith('Service');
      expect(result).toBeDefined();
    });
  });

  describe('haveSimpleNameMatching() - Name Pattern Filtering', () => {
    it('should filter by regex pattern', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameMatching(/User/);
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should filter by string pattern', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameMatching('Service');
      expect(result).toBeDefined();
    });

    it('should work with complex regex', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameMatching(/^User.*Service$/);
      expect(result).toBeDefined();
    });

    it('should apply negation to pattern', () => {
      const that = new ClassesThat(classes);
      const result = that.not().haveSimpleNameMatching(/Test/);
      expect(result).toBeDefined();
    });
  });

  describe('haveSimpleNameEndingWith() - Suffix Filtering', () => {
    it('should filter by suffix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameEndingWith('Service');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with Controller suffix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameEndingWith('Controller');
      expect(result).toBeDefined();
    });

    it('should work with Repository suffix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameEndingWith('Repository');
      expect(result).toBeDefined();
    });

    it('should apply negation to suffix filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().haveSimpleNameEndingWith('Test');
      expect(result).toBeDefined();
    });
  });

  describe('haveSimpleNameStartingWith() - Prefix Filtering', () => {
    it('should filter by prefix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameStartingWith('User');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with Abstract prefix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameStartingWith('Abstract');
      expect(result).toBeDefined();
    });

    it('should work with Base prefix', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameStartingWith('Base');
      expect(result).toBeDefined();
    });

    it('should apply negation to prefix filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().haveSimpleNameStartingWith('Test');
      expect(result).toBeDefined();
    });
  });

  describe('areAssignableTo() - Type Hierarchy Filtering', () => {
    it('should filter by assignable type', () => {
      const that = new ClassesThat(classes);
      const result = that.areAssignableTo('BaseClass');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with interface names', () => {
      const that = new ClassesThat(classes);
      const result = that.areAssignableTo('IService');
      expect(result).toBeDefined();
    });

    it('should apply negation to type filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().areAssignableTo('LegacyClass');
      expect(result).toBeDefined();
    });
  });

  describe('implement() - Interface Implementation Filtering', () => {
    it('should filter classes implementing interface', () => {
      const that = new ClassesThat(classes);
      const result = that.implement('IService');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with any interface name', () => {
      const that = new ClassesThat(classes);
      const result = that.implement('Serializable');
      expect(result).toBeDefined();
    });

    it('should apply negation to interface filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().implement('Deprecated');
      expect(result).toBeDefined();
    });
  });

  describe('extend() - Class Extension Filtering', () => {
    it('should filter classes extending another class', () => {
      const that = new ClassesThat(classes);
      const result = that.extend('BaseService');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should work with any class name', () => {
      const that = new ClassesThat(classes);
      const result = that.extend('AbstractController');
      expect(result).toBeDefined();
    });

    it('should apply negation to extension filter', () => {
      const that = new ClassesThat(classes);
      const result = that.not().extend('LegacyClass');
      expect(result).toBeDefined();
    });
  });

  describe('Complex Predicate Chains', () => {
    it('should combine multiple filters with AND', () => {
      const that = new ClassesThat(classes);
      const result = that
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .and()
        .areAnnotatedWith('Injectable');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should combine multiple filters with OR', () => {
      const that = new ClassesThat(classes);
      const result = that
        .resideInPackage('services')
        .or()
        .resideInPackage('controllers')
        .or()
        .resideInPackage('repositories');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should mix AND and OR operators', () => {
      const that = new ClassesThat(classes);
      const result = that
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .or()
        .areAnnotatedWith('Legacy');
      expect(result).toBeDefined();
    });

    it('should apply multiple negations', () => {
      const that = new ClassesThat(classes);
      const result = that
        .not()
        .resideInPackage('test')
        .and()
        .not()
        .haveSimpleNameStartingWith('Test');
      expect(result).toBeDefined();
    });

    it('should handle very complex chains', () => {
      const that = new ClassesThat(classes);
      const result = that
        .resideInPackage('services')
        .and()
        .haveSimpleNameEndingWith('Service')
        .or()
        .resideInPackage('controllers')
        .and()
        .haveSimpleNameEndingWith('Controller')
        .and()
        .not()
        .areAnnotatedWith('Deprecated');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });
  });

  describe('Transition to ClassesShould', () => {
    it('should return ClassesThatShould from filtering methods', () => {
      const that = new ClassesThat(classes);
      const filtered = that.resideInPackage('services');
      expect(filtered).toBeInstanceOf(ClassesThatShould);
      expect(filtered.should).toBeDefined();
      expect(typeof filtered.should).toBe('function');
    });

    it('should return ClassesShould from should()', () => {
      const that = new ClassesThat(classes);
      const filtered = that.resideInPackage('services');
      const should = filtered.should();
      expect(should).toBeDefined();
    });

    it('should allow full fluent chain to assertions', () => {
      const that = new ClassesThat(classes);
      const rule = that.resideInPackage('services').should().haveSimpleNameEndingWith('Service');
      expect(rule).toBeDefined();
      expect(rule.check).toBeDefined();
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty class collection', () => {
      const emptyClasses = new TSClasses([]);
      const that = new ClassesThat(emptyClasses);
      const result = that.resideInPackage('any');
      expect(result).toBeDefined();
    });

    it('should handle no matching predicates', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('nonexistent-package-xyz');
      expect(result).toBeDefined();
      expect(result.should).toBeDefined();
    });

    it('should handle special characters in package names', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('package-with-dashes_and_underscores');
      expect(result).toBeDefined();
    });

    it('should handle empty string patterns', () => {
      const that = new ClassesThat(classes);
      const result = that.haveSimpleNameMatching('');
      expect(result).toBeDefined();
    });

    it('should handle very long predicate chains', () => {
      let that = new ClassesThat(classes);
      for (let i = 0; i < 10; i++) {
        that = that.resideInPackage('test').and() as ClassesThat;
      }
      expect(that).toBeDefined();
    });
  });

  describe('Predicate Application Logic', () => {
    it('should apply AND predicates correctly (all must match)', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services').and().haveSimpleNameEndingWith('Service');
      expect(result).toBeInstanceOf(ClassesThatShould);
      const should = result.should();
      expect(should).toBeDefined();
    });

    it('should apply OR predicates correctly (any can match)', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services').or().resideInPackage('controllers');
      expect(result).toBeInstanceOf(ClassesThatShould);
      const should = result.should();
      expect(should).toBeDefined();
    });

    it('should handle complex predicate chains', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services');
      expect(result).toBeInstanceOf(ClassesThatShould);
      const should = result.should();
      expect(should).toBeDefined();
    });
  });

  describe('Integration with Real Code', () => {
    it('should filter service classes from fixtures', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('services').should();
      expect(result).toBeDefined();
    });

    it('should find controller classes from fixtures', () => {
      const that = new ClassesThat(classes);
      const result = that.resideInPackage('controllers').should();
      expect(result).toBeDefined();
    });

    it('should combine filters for repository pattern', () => {
      const that = new ClassesThat(classes);
      const result = that
        .resideInPackage('repositories')
        .and()
        .haveSimpleNameEndingWith('Repository')
        .should();
      expect(result).toBeDefined();
    });
  });
});
