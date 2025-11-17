/**
 * Example: Express.js API Architecture Tests
 *
 * This example demonstrates how to test the architecture of an Express.js API
 * using ArchUnit-TS to enforce MVC pattern and dependency rules.
 */

import { createArchUnit, ArchRuleDefinition, ArchUnitTS } from 'archunit-ts';

describe('Express API Architecture', () => {
  let archUnit: ArchUnitTS;

  beforeAll(() => {
    archUnit = createArchUnit();
  });

  describe('Naming Conventions', () => {
    it('controllers should end with "Controller"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .haveSimpleNameEndingWith('Controller');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('services should end with "Service"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameEndingWith('Service');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('repositories should end with "Repository"', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('repositories')
        .should()
        .haveSimpleNameEndingWith('Repository');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('models should end with "Model" or be simple nouns', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .haveSimpleNameMatching(/^[A-Z][a-zA-Z]*(Model)?$/);

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Layer Dependencies', () => {
    it('controllers should only depend on services and models', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('services', 'models', 'middleware');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('services should not depend on controllers', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('controllers');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('models should not depend on services or controllers', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notDependOnClassesThat()
        .resideInAnyPackage('services', 'controllers', 'repositories');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('repositories should only depend on models', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('repositories')
        .should()
        .onlyDependOnClassesThat()
        .resideInPackage('models');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Package Organization', () => {
    it('all controllers should be in controllers package', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .resideInPackage('controllers');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('all services should be in services package', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });

    it('all repositories should be in repositories package', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Repository')
        .should()
        .resideInPackage('repositories');

      const violations = await archUnit.checkRule('./src', rule);
      ArchUnitTS.assertNoViolations(violations);
    });
  });

  describe('Multiple Rules', () => {
    it('should check all architecture rules together', async () => {
      const rules = [
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .haveSimpleNameEndingWith('Controller'),

        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .haveSimpleNameEndingWith('Service'),

        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('models')
          .should()
          .notDependOnClassesThat()
          .resideInAnyPackage('services', 'controllers'),
      ];

      const violations = await archUnit.checkRules('./src', rules);
      ArchUnitTS.assertNoViolations(violations);
    });
  });
});
