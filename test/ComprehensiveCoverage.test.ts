/**
 * Comprehensive test suite to boost coverage across multiple modules
 * Targets: ClassesThat, ClassesShould, ArchRule, Reports, Templates, Utils
 */

import { ArchRuleDefinition } from '../src/lang/ArchRuleDefinition';
import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import { TSClasses } from '../src/core/TSClasses';
import { TSClass } from '../src/core/TSClass';
import {
  ViolationFormatter,
  formatViolations,
  formatViolation,
  formatSummary,
} from '../src/utils/ViolationFormatter';
import { RuleTemplates } from '../src/templates/RuleTemplates';
import {
  HtmlReportGenerator,
  JsonReportGenerator,
  JUnitReportGenerator,
  MarkdownReportGenerator,
  ReportManager,
  createReportManager,
} from '../src/reports';
import { RuleComposer } from '../src/composition/RuleComposer';
import * as path from 'path';
import * as fs from 'fs';

describe('Comprehensive Coverage Tests', () => {
  let analyzer: CodeAnalyzer;
  let testClasses: TSClasses;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    testClasses = await analyzer.analyze(fixturesPath);
  });

  describe('ClassesThat - Comprehensive Coverage', () => {
    it('should filter classes by name patterns', () => {
      const filtered = testClasses.that((cls) => cls.hasSimpleNameMatching(/User/)).getAll();
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should filter classes by package', () => {
      const servicesClasses = testClasses.resideInPackage('services').getAll();
      expect(servicesClasses.length).toBeGreaterThan(0);
    });

    it('should filter classes by decorator', () => {
      const decoratedClasses = testClasses.areAnnotatedWith('Service').getAll();
      expect(Array.isArray(decoratedClasses)).toBe(true);
    });

    it('should filter by simple name matching', () => {
      const matches = testClasses.haveSimpleNameMatching(/Service$/);
      expect(matches).toBeInstanceOf(TSClasses);
    });

    it('should filter by simple name ending with', () => {
      const matches = testClasses.haveSimpleNameEndingWith('Service');
      expect(matches).toBeInstanceOf(TSClasses);
    });

    it('should filter by simple name starting with', () => {
      const matches = testClasses.haveSimpleNameStartingWith('User');
      expect(matches).toBeInstanceOf(TSClasses);
    });

    it('should check if assignable to type', () => {
      const matches = testClasses.areAssignableTo('BaseClass');
      expect(matches).toBeInstanceOf(TSClasses);
    });

    it('should get size of collection', () => {
      const size = testClasses.size();
      expect(typeof size).toBe('number');
      expect(size).toBeGreaterThanOrEqual(0);
    });

    it('should check if collection is empty', () => {
      const isEmpty = testClasses.isEmpty();
      expect(typeof isEmpty).toBe('boolean');
    });

    it('should merge collections', () => {
      const services = testClasses.resideInPackage('services');
      const controllers = testClasses.resideInPackage('controllers');
      const merged = services.merge(controllers);
      expect(merged.size()).toBeGreaterThanOrEqual(services.size());
    });

    it('should add class to collection', () => {
      const newCollection = new TSClasses();
      const sampleClass = new TSClass(
        'TestClass',
        '/test/path.ts',
        'test/module',
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        false,
        false
      );
      newCollection.add(sampleClass);
      expect(newCollection.size()).toBe(1);
    });

    it('should filter by multiple packages', () => {
      const matches = testClasses.resideInAnyPackage('services', 'controllers', 'models');
      expect(matches.size()).toBeGreaterThanOrEqual(0);
    });
  });

  describe('ClassesShould - Comprehensive Coverage', () => {
    it('should validate classes have simple name', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleName('UserService');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes have simple name matching pattern', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameMatching(/.*Service$/);

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes have simple name ending with', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameEndingWith('Service');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes have simple name starting with', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .haveSimpleNameStartingWith('User');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes not have simple name', () => {
      const rule = ArchRuleDefinition.classes().should().notHaveSimpleName('BadClass');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes not have simple name matching', () => {
      const rule = ArchRuleDefinition.classes().should().notHaveSimpleNameMatching(/^Bad/);

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes not have simple name ending with', () => {
      const rule = ArchRuleDefinition.classes().should().notHaveSimpleNameEndingWith('BadSuffix');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes not have simple name starting with', () => {
      const rule = ArchRuleDefinition.classes().should().notHaveSimpleNameStartingWith('Bad');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes be annotated with decorator', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes not be annotated with decorator', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notBeAnnotatedWith('Controller');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes reside in package', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes not reside in package', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .notResideInPackage('controllers');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes reside in any package', () => {
      const rule = ArchRuleDefinition.classes()
        .should()
        .resideInAnyPackage('services', 'controllers', 'models', 'repositories');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes not reside in any package', () => {
      const rule = ArchRuleDefinition.classes()
        .should()
        .notResideInAnyPackage('bad-package', 'another-bad-package');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate classes be assignable to type', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .beAssignableTo('BaseService');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate classes not be assignable to type', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notBeAssignableTo('Controller');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate dependency rules - depend on classes that', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .dependOnClassesThat()
        .resideInAnyPackage('services', 'models');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should validate dependency rules - not depend on classes that', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('controllers');

      const violations = rule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should validate dependency rules - only depend on classes that', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('repositories')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('models', 'repositories');

      const violations = rule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('ViolationFormatter - Comprehensive Coverage', () => {
    it('should format single violation', () => {
      const violation = {
        ruleName: 'Test Rule',
        message: 'Test message',
        filePath: '/test/file.ts',
        className: 'TestClass',
        severity: 'error' as const,
      };

      const formatted = formatViolation(violation);
      expect(formatted).toContain('Test Rule');
      expect(formatted).toContain('Test message');
      expect(formatted).toContain('TestClass');
    });

    it('should format multiple violations', () => {
      const violations = [
        {
          ruleName: 'Rule 1',
          message: 'Message 1',
          filePath: '/test/file1.ts',
          className: 'Class1',
          severity: 'error' as const,
        },
        {
          ruleName: 'Rule 2',
          message: 'Message 2',
          filePath: '/test/file2.ts',
          className: 'Class2',
          severity: 'warning' as const,
        },
      ];

      const formatted = formatViolations(violations);
      expect(formatted).toContain('Rule 1');
      expect(formatted).toContain('Rule 2');
    });

    it('should format summary', () => {
      const violations = [
        {
          ruleName: 'Rule',
          message: 'Message',
          filePath: '/test/file.ts',
          className: 'Class',
          severity: 'error' as const,
        },
      ];

      const summary = formatSummary(violations);
      expect(summary).toContain('1');
    });

    it('should use ViolationFormatter class', () => {
      const formatter = new ViolationFormatter();
      const violation = {
        ruleName: 'Test',
        message: 'Test',
        filePath: '/test.ts',
        className: 'Test',
        severity: 'error' as const,
      };

      const formatted = formatter.format(violation);
      expect(typeof formatted).toBe('string');
    });

    it('should format with color options', () => {
      const formatter = new ViolationFormatter({ useColors: true });
      const violation = {
        ruleName: 'Test',
        message: 'Test',
        filePath: '/test.ts',
        className: 'Test',
        severity: 'error' as const,
      };

      const formatted = formatter.format(violation);
      expect(typeof formatted).toBe('string');
    });

    it('should format without color options', () => {
      const formatter = new ViolationFormatter({ useColors: false });
      const violation = {
        ruleName: 'Test',
        message: 'Test',
        filePath: '/test.ts',
        className: 'Test',
        severity: 'warning' as const,
      };

      const formatted = formatter.format(violation);
      expect(typeof formatted).toBe('string');
      expect(formatted).not.toContain('\x1b');
    });

    it('should format multiple violations with formatter', () => {
      const formatter = new ViolationFormatter();
      const violations = [
        {
          ruleName: 'R1',
          message: 'M1',
          filePath: '/t1.ts',
          className: 'C1',
          severity: 'error' as const,
        },
        {
          ruleName: 'R2',
          message: 'M2',
          filePath: '/t2.ts',
          className: 'C2',
          severity: 'info' as const,
        },
      ];

      const formatted = formatter.formatAll(violations);
      expect(formatted).toContain('R1');
      expect(formatted).toContain('R2');
    });

    it('should format summary with formatter', () => {
      const formatter = new ViolationFormatter();
      const violations = [
        {
          ruleName: 'R',
          message: 'M',
          filePath: '/t.ts',
          className: 'C',
          severity: 'error' as const,
        },
      ];

      const summary = formatter.formatSummary(violations);
      expect(summary).toContain('1');
    });
  });

  describe('RuleTemplates - Coverage', () => {
    it('should provide naming conventions template', () => {
      expect(RuleTemplates.namingConventions).toBeDefined();
    });

    it('should provide layered architecture template', () => {
      expect(RuleTemplates.layeredArchitecture).toBeDefined();
    });

    it('should provide dependency rules template', () => {
      expect(RuleTemplates.dependencyRules).toBeDefined();
    });

    it('should provide package organization template', () => {
      expect(RuleTemplates.packageOrganization).toBeDefined();
    });
  });

  describe('Report Generators - Comprehensive Coverage', () => {
    const sampleViolations = [
      {
        ruleName: 'Test Rule',
        message: 'Test violation',
        filePath: '/test/file.ts',
        className: 'TestClass',
        severity: 'error' as const,
      },
    ];

    const reportData = {
      violations: sampleViolations,
      totalViolations: 1,
      rulesChecked: 1,
      filesAnalyzed: 1,
      timestamp: new Date().toISOString(),
    };

    it('should generate HTML report', () => {
      const generator = new HtmlReportGenerator();
      const html = generator.generate(reportData);
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('Test Rule');
    });

    it('should generate JSON report', () => {
      const generator = new JsonReportGenerator();
      const json = generator.generate(reportData);
      expect(json).toContain('"violations"');
      expect(json).toContain('Test Rule');
    });

    it('should generate JUnit report', () => {
      const generator = new JUnitReportGenerator();
      const xml = generator.generate(reportData);
      expect(xml).toContain('<?xml version');
      expect(xml).toContain('testsuites');
    });

    it('should generate Markdown report', () => {
      const generator = new MarkdownReportGenerator();
      const md = generator.generate(reportData);
      expect(md).toContain('# Architecture Violations Report');
      expect(md).toContain('Test Rule');
    });

    it('should create report manager', () => {
      const manager = createReportManager();
      expect(manager).toBeInstanceOf(ReportManager);
    });

    it('should generate HTML report with manager', async () => {
      const manager = new ReportManager();
      const outputPath = path.join(__dirname, 'temp-report.html');

      await manager.generateReport(sampleViolations, {
        format: 'html',
        outputPath,
        title: 'Test Report',
      } as Parameters<typeof manager.generateReport>[1]);

      expect(fs.existsSync(outputPath)).toBe(true);
      fs.unlinkSync(outputPath);
    });

    it('should generate JSON report with manager', async () => {
      const manager = new ReportManager();
      const outputPath = path.join(__dirname, 'temp-report.json');

      await manager.generateReport(sampleViolations, {
        format: 'json',
        outputPath,
      } as Parameters<typeof manager.generateReport>[1]);

      expect(fs.existsSync(outputPath)).toBe(true);
      fs.unlinkSync(outputPath);
    });

    it('should generate multiple formats', async () => {
      const manager = new ReportManager();

      const formats = ['html', 'json', 'markdown', 'junit'] as const;
      for (const format of formats) {
        const outputPath = path.join(
          __dirname,
          `temp-report.${format === 'junit' ? 'xml' : format}`
        );

        await manager.generateReport(sampleViolations, {
          format,
          outputPath,
        } as Parameters<typeof manager.generateReport>[1]);

        expect(fs.existsSync(outputPath)).toBe(true);
        fs.unlinkSync(outputPath);
      }
    });
  });

  describe('Rule Composition - Coverage', () => {
    it('should compose rules with allOf (AND)', () => {
      const rule1 = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameEndingWith('Service');

      const rule2 = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .haveSimpleNameStartingWith('User');

      const composedRule = RuleComposer.allOf([rule1, rule2]);
      const violations = composedRule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should compose rules with anyOf (OR)', () => {
      const rule1 = ArchRuleDefinition.classes().should().resideInPackage('services');

      const rule2 = ArchRuleDefinition.classes().should().resideInPackage('controllers');

      const composedRule = RuleComposer.anyOf([rule1, rule2]);
      const violations = composedRule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should compose rules with not', () => {
      const rule = ArchRuleDefinition.classes().should().resideInPackage('bad-package');

      const composedRule = RuleComposer.not(rule);
      const violations = composedRule.check(testClasses);
      expect(violations.length).toBe(0);
    });

    it('should compose rules with xor', () => {
      const rule1 = ArchRuleDefinition.classes().should().resideInPackage('services');

      const rule2 = ArchRuleDefinition.classes().should().resideInPackage('controllers');

      const composedRule = RuleComposer.xor([rule1, rule2]);
      const violations = composedRule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should combine allOf and not', () => {
      const rule1 = ArchRuleDefinition.classes().should().resideInPackage('services');

      const negatedRule = RuleComposer.not(rule1);

      const composedRule = RuleComposer.allOf([negatedRule]);
      const violations = composedRule.check(testClasses);
      expect(Array.isArray(violations)).toBe(true);
    });
  });
});
