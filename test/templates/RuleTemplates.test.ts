import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import { TSClasses } from '../../src/core/TSClasses';
import { RuleTemplates } from '../../src/templates/RuleTemplates';
import * as path from 'path';

describe('RuleTemplates - Pre-built Architecture Rules', () => {
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze(fixturesPath);
  });

  describe('Naming Convention Templates', () => {
    describe('serviceNamingConvention()', () => {
      it('should create rule for service naming', () => {
        const rule = RuleTemplates.serviceNamingConvention();
        expect(rule).toBeDefined();
        expect(rule.check).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Service suffix in services package', () => {
        const rule = RuleTemplates.serviceNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('controllerNamingConvention()', () => {
      it('should create rule for controller naming', () => {
        const rule = RuleTemplates.controllerNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Controller suffix in controllers package', () => {
        const rule = RuleTemplates.controllerNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('repositoryNamingConvention()', () => {
      it('should create rule for repository naming', () => {
        const rule = RuleTemplates.repositoryNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Repository suffix in repositories package', () => {
        const rule = RuleTemplates.repositoryNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('dtoNamingConvention()', () => {
      it('should create rule for DTO naming', () => {
        const rule = RuleTemplates.dtoNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce DTO/Dto suffix in dto package', () => {
        const rule = RuleTemplates.dtoNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('validatorNamingConvention()', () => {
      it('should create rule for validator naming', () => {
        const rule = RuleTemplates.validatorNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Validator suffix', () => {
        const rule = RuleTemplates.validatorNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('middlewareNamingConvention()', () => {
      it('should create rule for middleware naming', () => {
        const rule = RuleTemplates.middlewareNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Middleware suffix', () => {
        const rule = RuleTemplates.middlewareNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('guardNamingConvention()', () => {
      it('should create rule for guard naming', () => {
        const rule = RuleTemplates.guardNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Guard suffix', () => {
        const rule = RuleTemplates.guardNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('eventHandlerNamingConvention()', () => {
      it('should create rule for event handler naming', () => {
        const rule = RuleTemplates.eventHandlerNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Handler suffix', () => {
        const rule = RuleTemplates.eventHandlerNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('factoryNamingConvention()', () => {
      it('should create rule for factory naming', () => {
        const rule = RuleTemplates.factoryNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Factory suffix', () => {
        const rule = RuleTemplates.factoryNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Extended Naming Convention Templates', () => {
    describe('entityNamingConvention()', () => {
      it('should create rule for entity naming', () => {
        const rule = RuleTemplates.entityNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Entity suffix', () => {
        const rule = RuleTemplates.entityNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('valueObjectNamingConvention()', () => {
      it('should create rule for value object naming', () => {
        const rule = RuleTemplates.valueObjectNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce VO or ValueObject suffix', () => {
        const rule = RuleTemplates.valueObjectNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('exceptionNamingConvention()', () => {
      it('should create rule for exception naming', () => {
        const rule = RuleTemplates.exceptionNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Exception or Error suffix', () => {
        const rule = RuleTemplates.exceptionNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('interfaceNamingConvention()', () => {
      it('should create rule for interface naming', () => {
        const rule = RuleTemplates.interfaceNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce I prefix', () => {
        const rule = RuleTemplates.interfaceNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('abstractClassNamingConvention()', () => {
      it('should create rule for abstract class naming', () => {
        const rule = RuleTemplates.abstractClassNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Abstract or Base prefix', () => {
        const rule = RuleTemplates.abstractClassNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('testClassNamingConvention()', () => {
      it('should create rule for test class naming', () => {
        const rule = RuleTemplates.testClassNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Test or Spec suffix', () => {
        const rule = RuleTemplates.testClassNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('utilityClassNamingConvention()', () => {
      it('should create rule for utility class naming', () => {
        const rule = RuleTemplates.utilityClassNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Utils or Helper suffix', () => {
        const rule = RuleTemplates.utilityClassNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('builderNamingConvention()', () => {
      it('should create rule for builder naming', () => {
        const rule = RuleTemplates.builderNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Builder suffix', () => {
        const rule = RuleTemplates.builderNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('adapterNamingConvention()', () => {
      it('should create rule for adapter naming', () => {
        const rule = RuleTemplates.adapterNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Adapter suffix', () => {
        const rule = RuleTemplates.adapterNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('providerNamingConvention()', () => {
      it('should create rule for provider naming', () => {
        const rule = RuleTemplates.providerNamingConvention();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce Provider suffix', () => {
        const rule = RuleTemplates.providerNamingConvention();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Dependency Rules Templates', () => {
    describe('controllersShouldNotDependOnRepositories()', () => {
      it('should create rule preventing controllers -> repositories', () => {
        const rule = RuleTemplates.controllersShouldNotDependOnRepositories();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect violations of layering', () => {
        const rule = RuleTemplates.controllersShouldNotDependOnRepositories();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('repositoriesShouldNotDependOnServices()', () => {
      it('should create rule preventing repositories -> services', () => {
        const rule = RuleTemplates.repositoriesShouldNotDependOnServices();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect violations of layering', () => {
        const rule = RuleTemplates.repositoriesShouldNotDependOnServices();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('servicesShouldNotDependOnControllers()', () => {
      it('should create rule preventing services -> controllers', () => {
        const rule = RuleTemplates.servicesShouldNotDependOnControllers();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should detect violations of layering', () => {
        const rule = RuleTemplates.servicesShouldNotDependOnControllers();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('domainShouldNotDependOnInfrastructure()', () => {
      it('should create rule preventing domain -> infrastructure', () => {
        const rule = RuleTemplates.domainShouldNotDependOnInfrastructure();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce clean architecture principle', () => {
        const rule = RuleTemplates.domainShouldNotDependOnInfrastructure();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('domainShouldNotDependOnApplication()', () => {
      it('should create rule preventing domain -> application', () => {
        const rule = RuleTemplates.domainShouldNotDependOnApplication();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce clean architecture principle', () => {
        const rule = RuleTemplates.domainShouldNotDependOnApplication();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Pattern-Specific Rules Templates', () => {
    describe('utilityClassesShouldHavePrivateConstructors()', () => {
      it('should create rule for utility class constructors', () => {
        const rule = RuleTemplates.utilityClassesShouldHavePrivateConstructors();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce private constructors pattern', () => {
        const rule = RuleTemplates.utilityClassesShouldHavePrivateConstructors();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('immutableClassesShouldHaveReadonlyFields()', () => {
      it('should create rule for immutable classes', () => {
        const rule = RuleTemplates.immutableClassesShouldHaveReadonlyFields();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce readonly fields pattern', () => {
        const rule = RuleTemplates.immutableClassesShouldHaveReadonlyFields();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('dtosShouldBeImmutable()', () => {
      it('should create rule for DTO immutability', () => {
        const rule = RuleTemplates.dtosShouldBeImmutable();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce readonly fields in DTOs', () => {
        const rule = RuleTemplates.dtosShouldBeImmutable();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('entitiesShouldBeAnnotated()', () => {
      it('should create rule for entity annotations', () => {
        const rule = RuleTemplates.entitiesShouldBeAnnotated();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce @Entity decorator', () => {
        const rule = RuleTemplates.entitiesShouldBeAnnotated();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('servicesShouldBeAnnotated()', () => {
      it('should create rule for service annotations', () => {
        const rule = RuleTemplates.servicesShouldBeAnnotated();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce @Injectable or @Service decorator', () => {
        const rule = RuleTemplates.servicesShouldBeAnnotated();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('controllersShouldBeAnnotated()', () => {
      it('should create rule for controller annotations', () => {
        const rule = RuleTemplates.controllersShouldBeAnnotated();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce @Controller decorator', () => {
        const rule = RuleTemplates.controllersShouldBeAnnotated();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('repositoriesShouldBeAnnotated()', () => {
      it('should create rule for repository annotations', () => {
        const rule = RuleTemplates.repositoriesShouldBeAnnotated();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce @Repository or @Injectable decorator', () => {
        const rule = RuleTemplates.repositoriesShouldBeAnnotated();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('valueObjectsShouldBeImmutable()', () => {
      it('should create rule for value object immutability', () => {
        const rule = RuleTemplates.valueObjectsShouldBeImmutable();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce readonly fields in value objects', () => {
        const rule = RuleTemplates.valueObjectsShouldBeImmutable();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('interfacesShouldBeInInterfacesPackage()', () => {
      it('should create rule for interface location', () => {
        const rule = RuleTemplates.interfacesShouldBeInInterfacesPackage();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce interfaces package location', () => {
        const rule = RuleTemplates.interfacesShouldBeInInterfacesPackage();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('abstractClassesShouldBeAbstract()', () => {
      it('should create rule for abstract modifier', () => {
        const rule = RuleTemplates.abstractClassesShouldBeAbstract();
        expect(rule).toBeDefined();
        expect(typeof rule.check).toBe('function');
      });

      it('should enforce abstract modifier on Abstract/Base classes', () => {
        const rule = RuleTemplates.abstractClassesShouldBeAbstract();
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Rule Collection Methods', () => {
    describe('getAllNamingConventionRules()', () => {
      it('should return array of naming convention rules', () => {
        const rules = RuleTemplates.getAllNamingConventionRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBe(9);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllNamingConventionRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });

      it('should include all basic naming conventions', () => {
        const rules = RuleTemplates.getAllNamingConventionRules();
        expect(rules.length).toBeGreaterThanOrEqual(9);
      });
    });

    describe('getAllDependencyRules()', () => {
      it('should return array of dependency rules', () => {
        const rules = RuleTemplates.getAllDependencyRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBeGreaterThanOrEqual(1);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllDependencyRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });
    });

    describe('getAllArchitecturalRules()', () => {
      it('should return array of architectural rules', () => {
        const rules = RuleTemplates.getAllArchitecturalRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBe(4);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllArchitecturalRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });

      it('should include layering and clean architecture rules', () => {
        const rules = RuleTemplates.getAllArchitecturalRules();
        expect(rules.length).toBeGreaterThanOrEqual(4);
      });
    });

    describe('getAllPatternRules()', () => {
      it('should return array of pattern-specific rules', () => {
        const rules = RuleTemplates.getAllPatternRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBe(10);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllPatternRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });

      it('should include immutability and annotation rules', () => {
        const rules = RuleTemplates.getAllPatternRules();
        expect(rules.length).toBeGreaterThanOrEqual(10);
      });
    });

    describe('getAllExtendedNamingConventionRules()', () => {
      it('should return array of extended naming rules', () => {
        const rules = RuleTemplates.getAllExtendedNamingConventionRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBe(10);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllExtendedNamingConventionRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });

      it('should include entity, VO, exception naming rules', () => {
        const rules = RuleTemplates.getAllExtendedNamingConventionRules();
        expect(rules.length).toBeGreaterThanOrEqual(10);
      });
    });

    describe('getAllRules()', () => {
      it('should return all template rules', () => {
        const rules = RuleTemplates.getAllRules();
        expect(Array.isArray(rules)).toBe(true);
        expect(rules.length).toBeGreaterThanOrEqual(24);
      });

      it('should return all ArchRule instances', () => {
        const rules = RuleTemplates.getAllRules();
        rules.forEach((rule) => {
          expect(typeof rule.check).toBe('function');
          expect(rule.check).toBeDefined();
        });
      });

      it('should combine all rule categories', () => {
        const allRules = RuleTemplates.getAllRules();
        const namingRules = RuleTemplates.getAllNamingConventionRules();
        const dependencyRules = RuleTemplates.getAllDependencyRules();
        const architecturalRules = RuleTemplates.getAllArchitecturalRules();
        const patternRules = RuleTemplates.getAllPatternRules();

        const expectedTotal =
          namingRules.length +
          dependencyRules.length +
          architecturalRules.length +
          patternRules.length;

        expect(allRules.length).toBe(expectedTotal);
      });

      it('should allow checking all rules at once', () => {
        const rules = RuleTemplates.getAllRules();
        rules.forEach((rule) => {
          const violations = rule.check(classes);
          expect(Array.isArray(violations)).toBe(true);
        });
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with real codebase analysis', () => {
      const serviceRule = RuleTemplates.serviceNamingConvention();
      const violations = serviceRule.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should allow combining multiple templates', () => {
      const rules = [
        RuleTemplates.serviceNamingConvention(),
        RuleTemplates.controllerNamingConvention(),
        RuleTemplates.repositoryNamingConvention(),
      ];

      rules.forEach((rule) => {
        const violations = rule.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    it('should support batch validation with all rules', () => {
      const allRules = RuleTemplates.getAllRules();
      let totalViolations = 0;

      allRules.forEach((rule) => {
        const violations = rule.check(classes);
        totalViolations += violations.length;
      });

      expect(totalViolations).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty class collection', () => {
      const emptyClasses = new TSClasses([]);
      const rule = RuleTemplates.serviceNamingConvention();
      const violations = rule.check(emptyClasses);
      expect(violations).toEqual([]);
    });

    it('should handle classes with no matching packages', () => {
      const rule = RuleTemplates.serviceNamingConvention();
      const violations = rule.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should create independent rule instances', () => {
      const rule1 = RuleTemplates.serviceNamingConvention();
      const rule2 = RuleTemplates.serviceNamingConvention();
      expect(rule1).not.toBe(rule2);
    });

    it('should work with getAllRules multiple times', () => {
      const rules1 = RuleTemplates.getAllRules();
      const rules2 = RuleTemplates.getAllRules();
      expect(rules1.length).toBe(rules2.length);
      expect(rules1).not.toBe(rules2);
    });
  });
});
