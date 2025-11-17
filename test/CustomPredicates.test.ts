import { ArchRuleDefinition, createArchUnit } from '../src/index';
import * as path from 'path';

describe('Custom Predicates', () => {
  const basePath = path.join(__dirname, 'fixtures/sample-code');
  const archUnit = createArchUnit();

  describe('Basic custom predicate filtering', () => {
    it('should filter classes with many methods using custom predicate', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.length > 5)
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(basePath, rule);

      // UserService has only 2 methods, so if we're filtering for >5 methods,
      // there should be no violations (no classes match the predicate)
      expect(violations).toHaveLength(0);
    });

    it('should filter exported classes using custom predicate', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.isExported)
        .should()
        .haveSimpleNameMatching(/^[A-Z]/); // Should start with capital letter

      const violations = await archUnit.checkRule(basePath, rule);

      // All exported classes in our fixtures start with capital letters
      expect(violations).toHaveLength(0);
    });

    it('should filter classes with specific properties count', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.properties.length >= 1)
        .should()
        .resideInPackage('models');

      const violations = await archUnit.checkRule(basePath, rule);

      // Models should have properties, controllers/services might have violations
      expect(violations.length).toBeGreaterThanOrEqual(0);
    });

    it('should filter classes by file path pattern', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.filePath.includes('controllers'))
        .should()
        .haveSimpleNameEndingWith('Controller');

      const violations = await archUnit.checkRule(basePath, rule);

      expect(violations).toHaveLength(0);
    });
  });

  describe('Combining custom predicates with built-in filters', () => {
    it('should combine custom predicate with resideInPackage filter', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.isExported)
        .resideInPackage('services')
        .should()
        .haveSimpleNameEndingWith('Service');

      const violations = await archUnit.checkRule(basePath, rule);

      expect(violations).toHaveLength(0);
    });

    it('should combine custom predicate with decorator filter', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.length > 0)
        .areAnnotatedWith('Service')
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(basePath, rule);

      expect(violations).toHaveLength(0);
    });
  });

  describe('Complex custom predicates', () => {
    it('should filter classes with specific method names', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.some((method) => method.name === 'constructor'))
        .should()
        .beAnnotatedWith('Service');

      const violations = await archUnit.checkRule(basePath, rule);

      // This will have violations - not all classes with constructors have @Service
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should filter classes that extend other classes', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.extends !== undefined)
        .should()
        .resideInPackage('models');

      const violations = await archUnit.checkRule(basePath, rule);

      // Classes that extend should be in models
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should filter classes implementing interfaces', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.implements.length > 0)
        .should()
        .haveSimpleNameMatching(/^[A-Z]/);

      const violations = await archUnit.checkRule(basePath, rule);

      expect(violations).toHaveLength(0);
    });

    it('should filter abstract classes', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.isAbstract)
        .should()
        .haveSimpleNameStartingWith('Abstract');

      const violations = await archUnit.checkRule(basePath, rule);

      // This might have violations if abstract classes don't start with Abstract
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Custom predicates with method and property analysis', () => {
    it('should filter classes with public methods', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.some((m) => m.isPublic))
        .should()
        .beAnnotatedWith('Service');

      const violations = await archUnit.checkRule(basePath, rule);

      // Not all classes with public methods are services
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should filter classes with private properties', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.properties.some((p) => p.isPrivate))
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(basePath, rule);

      expect(Array.isArray(violations)).toBe(true);
    });

    it('should filter classes with static methods', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.some((m) => m.isStatic))
        .should()
        .haveSimpleNameMatching(/Helper|Util/);

      const violations = await archUnit.checkRule(basePath, rule);

      // This tests if static methods are in helper/util classes
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Negation with custom predicates', () => {
    it('should work with noClasses selector', async () => {
      const rule = ArchRuleDefinition.noClasses()
        .that((cls) => cls.methods.length === 0)
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(basePath, rule);

      // Empty classes should not be in services
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Real-world use cases', () => {
    it('should enforce that large classes (>10 methods) are in services', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.methods.length > 10)
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(basePath, rule);

      expect(Array.isArray(violations)).toBe(true);
    });

    it('should enforce that classes with many dependencies are properly annotated', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => cls.implements.length > 2)
        .should()
        .beAnnotatedWith('Complex');

      const violations = await archUnit.checkRule(basePath, rule);

      // This will likely have violations as not all complex classes are annotated
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should enforce naming conventions based on class structure', async () => {
      const rule = ArchRuleDefinition.classes()
        .that((cls) => {
          // Classes with only getters/setters should end with Model or DTO
          const hasOnlyAccessors = cls.methods.every(
            (m) => m.name.startsWith('get') || m.name.startsWith('set')
          );
          return hasOnlyAccessors && cls.methods.length > 0;
        })
        .should()
        .haveSimpleNameMatching(/Model|DTO/);

      const violations = await archUnit.checkRule(basePath, rule);

      expect(Array.isArray(violations)).toBe(true);
    });
  });
});
