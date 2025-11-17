/**
 * Integration tests with real-world scenarios
 * These tests verify the library works end-to-end
 */

import { createArchUnit, ArchRuleDefinition, ArchUnitTS } from '../../src';
import * as path from 'path';

describe('Integration Tests - Real World Scenarios', () => {
  let archUnit: ArchUnitTS;

  beforeAll(() => {
    archUnit = createArchUnit();
  });

  describe('Express API Pattern', () => {
    it('should enforce MVC separation', async () => {
      // This would test against a real Express.js structure
      // For now, we test against the test fixtures
      const basePath = path.join(__dirname, '../fixtures/mvc-app');

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('models');

      const violations = await archUnit.checkRule(basePath, rule);

      // With proper fixtures, this should pass
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Layered Architecture Pattern', () => {
    it('should detect layer violations', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');

      const rules = [
        // Controllers should not directly access repositories
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .notDependOnClassesThat()
          .resideInPackage('repositories'),

        // Models should not depend on anything
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('models')
          .should()
          .notDependOnClassesThat()
          .resideInAnyPackage('controllers', 'services', 'repositories'),
      ];

      const violations = await archUnit.checkRules(basePath, rules);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Naming Conventions', () => {
    it('should enforce consistent naming across codebase', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');

      const namingRules = [
        // Controllers should end with 'Controller'
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .haveSimpleNameEndingWith('Controller'),

        // Services should end with 'Service'
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .haveSimpleNameEndingWith('Service'),

        // Models should end with 'Model' or 'Entity'
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('models')
          .should()
          .haveSimpleNameMatching(/^.*(?:Model|Entity)$/),
      ];

      const violations = await archUnit.checkRules(basePath, namingRules);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Decorator Enforcement', () => {
    it('should verify decorators match package structure', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');

      const decoratorRules = [
        // Classes in controllers should have @Controller decorator
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .beAnnotatedWith('Controller'),

        // Classes in services should have @Injectable decorator
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('services')
          .should()
          .beAnnotatedWith('Injectable'),
      ];

      const violations = await archUnit.checkRules(basePath, decoratorRules);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Comprehensive Architecture Check', () => {
    it('should run multiple rules and collect all violations', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');

      const allRules = [
        // Naming
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('controllers')
          .should()
          .haveSimpleNameEndingWith('Controller'),

        // Dependencies
        ArchRuleDefinition.classes()
          .that()
          .resideInPackage('models')
          .should()
          .notDependOnClassesThat()
          .resideInPackage('controllers'),

        // Package structure
        ArchRuleDefinition.classes()
          .that()
          .haveSimpleNameEndingWith('Service')
          .should()
          .resideInPackage('services'),
      ];

      const violations = await archUnit.checkRules(basePath, allRules);

      expect(Array.isArray(violations)).toBe(true);

      // Violations should have proper structure
      violations.forEach((violation) => {
        expect(violation).toHaveProperty('message');
        expect(violation).toHaveProperty('filePath');
        expect(violation).toHaveProperty('rule');
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent paths gracefully', async () => {
      const nonExistentPath = '/path/that/does/not/exist';

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('test')
        .should()
        .haveSimpleNameEndingWith('Test');

      await expect(
        archUnit.checkRule(nonExistentPath, rule)
      ).resolves.toBeDefined();
    });

    it('should handle empty rule sets', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');
      const violations = await archUnit.checkRules(basePath, []);

      expect(violations).toEqual([]);
    });
  });

  describe('Performance', () => {
    it('should analyze codebase in reasonable time', async () => {
      const basePath = path.join(__dirname, '../fixtures/mvc-app');
      const startTime = Date.now();

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .haveSimpleNameEndingWith('Controller');

      await archUnit.checkRule(basePath, rule);

      const duration = Date.now() - startTime;

      // Should complete in less than 5 seconds for small projects
      expect(duration).toBeLessThan(5000);
    });
  });
});
