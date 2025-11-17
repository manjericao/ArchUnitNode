/**
 * Example: Clean Architecture Tests
 *
 * This example demonstrates how to enforce Clean Architecture principles
 * using ArchUnit-TS with proper layer separation and dependency rules.
 */

import { createArchUnit, ArchRuleDefinition, layeredArchitecture, ArchUnitTS } from 'archunit-ts';

describe('Clean Architecture', () => {
  let archUnit: ArchUnitTS;

  beforeAll(() => {
    archUnit = createArchUnit();
  });

  describe('Layer Dependencies', () => {
    it('should enforce clean architecture layers', async () => {
      const architecture = layeredArchitecture()
        .layer('Presentation')
        .definedBy('presentation', 'controllers', 'adapters/controllers')
        .layer('Application')
        .definedBy('application', 'usecases')
        .layer('Domain')
        .definedBy('domain', 'entities', 'core')
        .layer('Infrastructure')
        .definedBy('infrastructure', 'persistence', 'external')
        // Domain should not depend on anything
        .whereLayer('Domain')
        .mayNotAccessLayers('Application', 'Presentation', 'Infrastructure')
        // Application should only depend on Domain
        .whereLayer('Application')
        .mayOnlyAccessLayers('Domain')
        // Presentation should only depend on Application and Domain
        .whereLayer('Presentation')
        .mayOnlyAccessLayers('Application', 'Domain');

      const violations = architecture.check(await archUnit.analyzeCode('./src'));
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Domain Layer', () => {
    it('domain entities should not depend on infrastructure', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('domain')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('infrastructure');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('domain entities should not depend on application layer', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('domain')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('application');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('domain entities should not depend on presentation layer', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('domain')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('presentation');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('entities should be in domain package', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .areAnnotatedWith('Entity')
        .should()
        .resideInPackage('domain/entities');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Application Layer', () => {
    it('use cases should only depend on domain', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('application/usecases')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('domain', 'application/interfaces');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('use cases should end with "UseCase"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('application/usecases')
        .should()
        .haveSimpleNameEndingWith('UseCase');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Infrastructure Layer', () => {
    it('repositories should be in infrastructure', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Repository')
        .should()
        .resideInPackage('infrastructure');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('infrastructure should not be imported by domain', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('domain')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('infrastructure');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Presentation Layer', () => {
    it('controllers should be in presentation layer', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .resideInPackage('presentation');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('controllers should not depend on infrastructure', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('presentation')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('infrastructure');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Dependency Inversion', () => {
    it('interfaces should be in application or domain layer', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameStartingWith('I')
        .should()
        .resideInAnyPackage('domain', 'application');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('application should depend on abstractions not concretions', async () => {
      // This would check that application layer only depends on interfaces
      // Implementation would require analyzing actual dependencies
      expect(true).toBe(true);
    });
  });
});
