/**
 * Test helpers for writing architectural tests
 */

import { ArchRule } from '../core/ArchRule';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation } from '../types';
import { CodeAnalyzer } from '../analyzer/CodeAnalyzer';

/**
 * Test fixture builder for creating test classes
 */
export class TestFixtureBuilder {
  private classes: TSClasses = new TSClasses();

  /**
   * Add a class to the fixture
   */
  public addClass(classData: {
    name: string;
    filePath: string;
    module?: string;
    methods?: Array<{ name: string; returnType?: string }>;
    properties?: Array<{ name: string; type?: string; isReadonly?: boolean }>;
    decorators?: Array<{ name: string; arguments?: unknown[] }>;
    dependencies?: string[];
    isAbstract?: boolean;
  }): this {
    const tsClass = {
      name: classData.name,
      filePath: classData.filePath,
      module: classData.module || classData.filePath.split('/')[0] || '',
      methods:
        classData.methods?.map((m) => ({
          name: m.name,
          returnType: m.returnType,
          parameters: [],
          isPublic: true,
          isPrivate: false,
          isProtected: false,
          isStatic: false,
          isAsync: false,
          decorators: [],
          location: { line: 1, column: 1 },
        })) || [],
      properties:
        classData.properties?.map((p) => ({
          name: p.name,
          type: p.type,
          isPublic: true,
          isPrivate: false,
          isProtected: false,
          isStatic: false,
          isReadonly: p.isReadonly !== undefined ? p.isReadonly : false,
          decorators: [],
          location: { line: 1, column: 1 },
        })) || [],
      decorators:
        classData.decorators?.map((d) => ({
          name: d.name,
          arguments: d.arguments || [],
          location: { line: 1, column: 1 },
        })) || [],
      extends: undefined,
      implements: [],
      isAbstract: classData.isAbstract || false,
      location: { line: 1, column: 1 },
      dependencies: classData.dependencies || [],
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.classes.add(tsClass as any); // Type cast for testing
    return this;
  }

  /**
   * Build the test fixture
   */
  public build(): TSClasses {
    return this.classes;
  }

  /**
   * Reset the fixture
   */
  public reset(): this {
    this.classes = new TSClasses();
    return this;
  }
}

/**
 * Helper for asserting violations
 */
export class ViolationAssertions {
  /**
   * Assert no violations
   */
  public static assertNoViolations(violations: ArchitectureViolation[]): void {
    if (violations.length > 0) {
      const messages = violations.map((v) => `  - ${v.message} (${v.filePath})`);
      throw new Error(
        `Expected no violations but found ${violations.length}:\n${messages.join('\n')}`
      );
    }
  }

  /**
   * Assert specific number of violations
   */
  public static assertViolationCount(
    violations: ArchitectureViolation[],
    expectedCount: number
  ): void {
    if (violations.length !== expectedCount) {
      const messages = violations.map((v) => `  - ${v.message} (${v.filePath})`);
      throw new Error(
        `Expected ${expectedCount} violations but found ${violations.length}:\n${messages.join('\n')}`
      );
    }
  }

  /**
   * Assert violation contains specific message
   */
  public static assertViolationMessage(
    violations: ArchitectureViolation[],
    expectedMessage: string | RegExp
  ): void {
    const found = violations.some((v) => {
      if (typeof expectedMessage === 'string') {
        return v.message.includes(expectedMessage);
      }
      return expectedMessage.test(v.message);
    });

    if (!found) {
      const messages = violations.map((v) => `  - ${v.message}`);
      throw new Error(
        `Expected violation message matching "${expectedMessage}" but found:\n${messages.join('\n')}`
      );
    }
  }

  /**
   * Assert violation in specific file
   */
  public static assertViolationInFile(violations: ArchitectureViolation[], filePath: string): void {
    const found = violations.some((v) => v.filePath.includes(filePath));

    if (!found) {
      const files = violations.map((v) => `  - ${v.filePath}`);
      throw new Error(
        `Expected violation in file "${filePath}" but found violations in:\n${files.join('\n')}`
      );
    }
  }
}

/**
 * Helper for running rules against fixtures
 */
export class RuleTestHelper {
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Check a rule against a fixture
   */
  public checkRule(rule: ArchRule, fixture: TSClasses): ArchitectureViolation[] {
    return rule.check(fixture);
  }

  /**
   * Check a rule against actual code
   */
  public async checkRuleAgainstCode(
    rule: ArchRule,
    basePath: string,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]> {
    const classes = await this.analyzer.analyze(basePath, patterns);
    return rule.check(classes);
  }

  /**
   * Expect no violations from rule
   */
  public expectNoViolations(rule: ArchRule, fixture: TSClasses): void {
    const violations = this.checkRule(rule, fixture);
    ViolationAssertions.assertNoViolations(violations);
  }

  /**
   * Expect specific number of violations
   */
  public expectViolationCount(rule: ArchRule, fixture: TSClasses, count: number): void {
    const violations = this.checkRule(rule, fixture);
    ViolationAssertions.assertViolationCount(violations, count);
  }

  /**
   * Expect violations containing message
   */
  public expectViolationMessage(
    rule: ArchRule,
    fixture: TSClasses,
    message: string | RegExp
  ): void {
    const violations = this.checkRule(rule, fixture);
    ViolationAssertions.assertViolationMessage(violations, message);
  }
}

/**
 * Convenience function to create a test fixture
 */
export function createTestFixture(): TestFixtureBuilder {
  return new TestFixtureBuilder();
}

/**
 * Convenience function to create a rule test helper
 */
export function createRuleTestHelper(): RuleTestHelper {
  return new RuleTestHelper();
}
