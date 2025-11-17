import ArchUnitTS, { createArchUnit, ArchRuleDefinition, Severity } from '../src/index';
import * as path from 'path';

describe('ArchUnitTS', () => {
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  describe('Main API', () => {
    it('should create an instance', () => {
      const archUnit = new ArchUnitTS();
      expect(archUnit).toBeDefined();
    });

    it('should create an instance via factory', () => {
      const archUnit = createArchUnit();
      expect(archUnit).toBeDefined();
    });

    it('should analyze code', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      expect(classes).toBeDefined();
      expect(classes.size()).toBeGreaterThan(0);
    });

    it('should check a single rule', async () => {
      const archUnit = createArchUnit();

      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(fixturesPath, rule);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check multiple rules', async () => {
      const archUnit = createArchUnit();

      const rules = [
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

      const violations = await archUnit.checkRules(fixturesPath, rules);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Violation assertions', () => {
    it('should not throw when there are no violations', () => {
      expect(() => {
        ArchUnitTS.assertNoViolations([]);
      }).not.toThrow();
    });

    it('should throw when there are violations', () => {
      const violations = [
        {
          message: 'Test violation',
          filePath: '/test/file.ts',
          rule: 'Test rule',
          severity: Severity.ERROR,
        },
      ];

      expect(() => {
        ArchUnitTS.assertNoViolations(violations);
      }).toThrow('Architecture violations found');
    });

    it('should include violation details in error message', () => {
      const violations = [
        {
          message: 'Class Foo violates rule',
          filePath: '/test/Foo.ts',
          rule: 'Test rule',
          severity: Severity.ERROR,
        },
      ];

      try {
        ArchUnitTS.assertNoViolations(violations);
        fail('Should have thrown');
      } catch (error) {
        expect((error as Error).message).toContain('Foo');
        expect((error as Error).message).toContain('/test/Foo.ts');
        expect((error as Error).message).toContain('1 violation');
      }
    });
  });
});
