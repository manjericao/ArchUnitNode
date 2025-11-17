/**
 * Example: NestJS Application Architecture Tests
 *
 * This example demonstrates how to test NestJS architecture
 * including decorator usage and module boundaries.
 */

import { createArchUnit, ArchRuleDefinition, ArchUnitTS } from 'archunit-ts';

describe('NestJS Architecture', () => {
  let archUnit: ArchUnitTS;

  beforeAll(() => {
    archUnit = createArchUnit();
  });

  describe('Decorator Usage', () => {
    it('controllers should be annotated with @Controller', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .beAnnotatedWith('Controller');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('services should be annotated with @Injectable', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .beAnnotatedWith('Injectable');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('entities should be annotated with @Entity', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('entities')
        .should()
        .beAnnotatedWith('Entity');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('guards should be annotated with @Injectable', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Guard')
        .should()
        .beAnnotatedWith('Injectable');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Module Boundaries', () => {
    it('auth module should not depend on user module internals', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('auth')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('user/services');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('common module should not depend on feature modules', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('common')
        .should()
        .notDependOnClassesThat()
        .resideInAnyPackage('users', 'auth', 'products');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Naming Conventions', () => {
    it('DTOs should end with "Dto"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('dto')
        .should()
        .haveSimpleNameEndingWith('Dto');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('interceptors should end with "Interceptor"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('interceptors')
        .should()
        .haveSimpleNameEndingWith('Interceptor');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('pipes should end with "Pipe"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('pipes')
        .should()
        .haveSimpleNameEndingWith('Pipe');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Database Layer', () => {
    it('repositories should reside in database module', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Repository')
        .should()
        .resideInPackage('database');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('entities should not depend on services', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('entities')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('services');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });
});
