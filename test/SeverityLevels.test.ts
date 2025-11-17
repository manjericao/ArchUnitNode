import { createArchUnit, ArchRuleDefinition, Severity } from '../src/index';
import * as path from 'path';

describe('Severity Levels', () => {
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  describe('Rule Severity', () => {
    it('should default to error severity', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      expect(rule.getSeverity()).toBe(Severity.ERROR);
    });

    it('should support setting warning severity', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asWarning();

      expect(rule.getSeverity()).toBe(Severity.WARNING);
    });

    it('should support setting error severity explicitly', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asError();

      expect(rule.getSeverity()).toBe(Severity.ERROR);
    });

    it('should allow chaining severity modifiers', async () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asWarning()
        .asError();

      expect(rule.getSeverity()).toBe(Severity.ERROR);
    });
  });

  describe('Violation Severity', () => {
    it('should create ERROR violations by default', async () => {
      const archUnit = createArchUnit();

      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const violations = await archUnit.checkRule(fixturesPath, rule);

      // Check that all violations are errors
      violations.forEach((violation) => {
        expect(violation.severity).toBe(Severity.ERROR);
      });
    });

    it('should create WARNING violations when rule is set to warning', async () => {
      const archUnit = createArchUnit();

      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asWarning();

      const violations = await archUnit.checkRule(fixturesPath, rule);

      // Check that all violations are warnings
      violations.forEach((violation) => {
        expect(violation.severity).toBe(Severity.WARNING);
      });
    });

    it('should support mixed severity levels in multiple rules', async () => {
      const archUnit = createArchUnit();

      const errorRule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const warningRule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('wrong-package')
        .asWarning();

      const violations = await archUnit.checkRules(fixturesPath, [errorRule, warningRule]);

      // All violations should have a severity
      violations.forEach((violation) => {
        expect(violation.severity).toBeDefined();
        expect([Severity.ERROR, Severity.WARNING]).toContain(violation.severity);
      });
    });
  });

  describe('Real-world Usage', () => {
    it('should allow gradual adoption with warnings for legacy code', async () => {
      const archUnit = createArchUnit();

      // Strict rule for new code (errors)
      const strictRule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      // Lenient rule for legacy code (warnings)
      const lenientRule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Repository')
        .should()
        .resideInPackage('repositories')
        .asWarning();

      const violations = await archUnit.checkRules(fixturesPath, [strictRule, lenientRule]);

      // Count errors vs warnings
      const errors = violations.filter((v) => v.severity === Severity.ERROR);
      const warnings = violations.filter((v) => v.severity === Severity.WARNING);

      // Log the breakdown
      console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);

      // In a real scenario, we would fail the build only on errors
      // but warnings would still be visible for developers to fix
    });

    it('should support progressive rule enforcement', async () => {
      const archUnit = createArchUnit();

      // Phase 1: Start with warnings
      const phase1Rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asWarning();

      const phase1Violations = await archUnit.checkRule(fixturesPath, phase1Rule);

      // Phase 2: After team has addressed warnings, promote to errors
      const phase2Rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services')
        .asError();

      const phase2Violations = await archUnit.checkRule(fixturesPath, phase2Rule);

      // Both should have same violations, just different severity
      expect(phase1Violations.length).toBe(phase2Violations.length);

      // But severity should be different
      if (phase1Violations.length > 0 && phase2Violations.length > 0) {
        expect(phase1Violations[0].severity).toBe(Severity.WARNING);
        expect(phase2Violations[0].severity).toBe(Severity.ERROR);
      }
    });
  });
});
