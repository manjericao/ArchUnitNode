/**
 * Test suite builder for common architectural test patterns
 */

import { ArchRule } from '../core/ArchRule';
import { CodeAnalyzer } from '../analyzer/CodeAnalyzer';
import { ArchitectureViolation } from '../types';

/**
 * Test suite configuration
 */
export interface TestSuiteConfig {
  /** Base path to analyze */
  basePath: string;

  /** File patterns to include */
  patterns?: string[];

  /** Whether to fail on warnings */
  failOnWarnings?: boolean;

  /** Custom setup function */
  beforeEach?: () => void | Promise<void>;

  /** Custom teardown function */
  afterEach?: () => void | Promise<void>;
}

/**
 * Rule test case
 */
export interface RuleTestCase {
  /** Test description */
  description: string;

  /** Rule to test */
  rule: ArchRule;

  /** Expected violation count (undefined = no violations expected) */
  expectedViolations?: number;

  /** Expected messages (partial match) */
  expectedMessages?: string[];

  /** Files that should have violations */
  expectedFiles?: string[];

  /** Whether this test should pass */
  shouldPass?: boolean;
}

/**
 * Builder for creating architectural test suites
 */
export class TestSuiteBuilder {
  private config: TestSuiteConfig;
  private testCases: RuleTestCase[] = [];
  private analyzer: CodeAnalyzer;

  constructor(config: TestSuiteConfig) {
    this.config = config;
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Add a test case that should pass (no violations)
   */
  public shouldPassRule(description: string, rule: ArchRule): this {
    this.testCases.push({
      description,
      rule,
      expectedViolations: 0,
      shouldPass: true,
    });
    return this;
  }

  /**
   * Add a test case that should fail with violations
   */
  public shouldFailRule(
    description: string,
    rule: ArchRule,
    options?: {
      expectedCount?: number;
      expectedMessages?: string[];
      expectedFiles?: string[];
    }
  ): this {
    this.testCases.push({
      description,
      rule,
      expectedViolations: options?.expectedCount,
      expectedMessages: options?.expectedMessages,
      expectedFiles: options?.expectedFiles,
      shouldPass: false,
    });
    return this;
  }

  /**
   * Add multiple rules that should all pass
   */
  public shouldPassAllRules(rules: Array<{ description: string; rule: ArchRule }>): this {
    rules.forEach(({ description, rule }) => {
      this.shouldPassRule(description, rule);
    });
    return this;
  }

  /**
   * Generate Jest test suite
   */
  public generateJestSuite(suiteName: string = 'Architecture Tests'): void {
    // Get Jest globals safely
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalAny = global as any;
    const jestDescribe = globalAny.describe;
    const jestBeforeAll = globalAny.beforeAll;
    const jestBeforeEach = globalAny.beforeEach;
    const jestAfterEach = globalAny.afterEach;
    const jestIt = globalAny.it;
    const jestExpect = globalAny.expect;

    if (!jestDescribe || !jestIt) {
      throw new Error('Jest not found. Make sure you are running in a Jest environment.');
    }

    jestDescribe(suiteName, () => {
      let violations: Map<string, ArchitectureViolation[]>;

      jestBeforeAll(async () => {
        // Run analysis once for all tests
        const classes = await this.analyzer.analyze(this.config.basePath, this.config.patterns);

        // Execute all rules and cache results
        violations = new Map();
        for (const testCase of this.testCases) {
          const result = testCase.rule.check(classes);
          violations.set(testCase.description, result);
        }
      });

      if (this.config.beforeEach && jestBeforeEach) {
        jestBeforeEach(this.config.beforeEach);
      }

      if (this.config.afterEach && jestAfterEach) {
        jestAfterEach(this.config.afterEach);
      }

      // Generate test for each rule
      for (const testCase of this.testCases) {
        jestIt(testCase.description, () => {
          const result = violations.get(testCase.description)!;

          // Check violation count
          if (testCase.expectedViolations !== undefined && jestExpect) {
            jestExpect(result).toHaveLength(testCase.expectedViolations);
          }

          // Check that test should pass/fail
          if (testCase.shouldPass && jestExpect) {
            jestExpect(result).toHaveLength(0);
          } else if (testCase.shouldPass === false && result.length === 0) {
            throw new Error('Expected rule to fail but it passed');
          }

          // Check expected messages
          if (testCase.expectedMessages) {
            for (const message of testCase.expectedMessages) {
              const found = result.some((v) => v.message.includes(message));
              if (!found) {
                throw new Error(`Expected violation message containing "${message}" but not found`);
              }
            }
          }

          // Check expected files
          if (testCase.expectedFiles) {
            for (const file of testCase.expectedFiles) {
              const found = result.some((v) => v.filePath.includes(file));
              if (!found) {
                throw new Error(`Expected violation in file "${file}" but not found`);
              }
            }
          }

          // Fail on warnings if configured
          if (this.config.failOnWarnings) {
            const warnings = result.filter((v) => v.severity === 'warning');
            if (warnings.length > 0) {
              throw new Error(`Found ${warnings.length} warning(s) (failOnWarnings is enabled)`);
            }
          }
        });
      }
    });
  }

  /**
   * Generate a report of all test results
   */
  public async generateReport(): Promise<string> {
    const classes = await this.analyzer.analyze(this.config.basePath, this.config.patterns);

    const results: Array<{
      description: string;
      passed: boolean;
      violations: ArchitectureViolation[];
    }> = [];

    for (const testCase of this.testCases) {
      const violations = testCase.rule.check(classes);
      const passed = testCase.shouldPass ? violations.length === 0 : violations.length > 0;

      results.push({
        description: testCase.description,
        passed,
        violations,
      });
    }

    const passedCount = results.filter((r) => r.passed).length;
    const failedCount = results.filter((r) => !r.passed).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);

    let report = '# Architectural Test Report\n\n';
    report += `**Summary**: ${passedCount} passed, ${failedCount} failed, ${totalViolations} total violations\n\n`;

    report += '## Results\n\n';
    for (const result of results) {
      const icon = result.passed ? '✅' : '❌';
      report += `${icon} **${result.description}**\n`;

      if (result.violations.length > 0) {
        report += `   - ${result.violations.length} violation(s):\n`;
        for (const violation of result.violations.slice(0, 5)) {
          report += `     - ${violation.message} (${violation.filePath})\n`;
        }
        if (result.violations.length > 5) {
          report += `     - ... and ${result.violations.length - 5} more\n`;
        }
      }
      report += '\n';
    }

    return report;
  }
}

/**
 * Convenience function to create a test suite builder
 */
export function createTestSuite(config: TestSuiteConfig): TestSuiteBuilder {
  return new TestSuiteBuilder(config);
}

/**
 * Quick test helper for single rule
 */
export async function testRule(
  rule: ArchRule,
  basePath: string,
  options?: {
    patterns?: string[];
    expectedViolations?: number;
  }
): Promise<ArchitectureViolation[]> {
  const analyzer = new CodeAnalyzer();
  const classes = await analyzer.analyze(basePath, options?.patterns);
  const violations = rule.check(classes);

  if (options?.expectedViolations !== undefined) {
    if (violations.length !== options.expectedViolations) {
      throw new Error(
        `Expected ${options.expectedViolations} violations but found ${violations.length}`
      );
    }
  }

  return violations;
}
