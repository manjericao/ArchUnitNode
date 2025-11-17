/**
 * ArchUnit for TypeScript/JavaScript
 * A library for checking and testing architecture in TypeScript/JavaScript applications
 */

// Core classes
export { TSClass } from './core/TSClass';
export { TSClasses } from './core/TSClasses';
export { ArchRule, BaseArchRule } from './core/ArchRule';

// Import types for internal use
import { TSClasses } from './core/TSClasses';
import { ArchRule } from './core/ArchRule';
import { CodeAnalyzer } from './analyzer/CodeAnalyzer';
import { ArchRuleDefinition, StaticArchRule } from './lang/ArchRuleDefinition';
import { ArchitectureViolation } from './types';

// Types
export * from './types';
export type { ClassPredicate } from './types';

// Reports
export * from './reports';
export { ReportManager, createReportManager } from './reports';
export { ReportFormat, ReportOptions, ReportData, ReportMetadata } from './reports/types';

// Parser and Analyzer
export { TypeScriptParser } from './parser/TypeScriptParser';
export { CodeAnalyzer } from './analyzer/CodeAnalyzer';

// Fluent API
export { ArchRuleDefinition, StaticArchRule } from './lang/ArchRuleDefinition';
export { ClassesThat } from './lang/syntax/ClassesThat';
export { ClassesShould } from './lang/syntax/ClassesShould';

// Library (predefined patterns)
export {
  Architectures,
  CleanArchitecture,
  DDDArchitecture,
  MicroservicesArchitecture,
  cleanArchitecture,
  dddArchitecture,
  microservicesArchitecture,
} from './library/Architectures';
export { LayeredArchitecture, layeredArchitecture } from './library/LayeredArchitecture';

// Cache
export { CacheManager, getGlobalCache, resetGlobalCache } from './cache/CacheManager';

// Configuration
export {
  ConfigLoader,
  loadConfig,
  createDefaultConfig,
  ArchUnitConfig,
} from './config/ConfigLoader';

// Utilities
export {
  ViolationFormatter,
  formatViolations,
  formatViolation,
  formatSummary,
  FormatOptions,
} from './utils/ViolationFormatter';

// Convenience exports for common patterns
export const { classes, noClasses, allClasses } = ArchRuleDefinition;

/**
 * Main entry point for analyzing code and checking rules
 */
export class ArchUnitTS {
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  /**
   * Analyze code in a directory
   */
  public async analyzeCode(basePath: string, patterns?: string[]): Promise<TSClasses> {
    return this.analyzer.analyze(basePath, patterns);
  }

  /**
   * Get the code analyzer instance
   */
  public getAnalyzer(): CodeAnalyzer {
    return this.analyzer;
  }

  /**
   * Check a rule against analyzed code
   */
  public async checkRule(
    basePath: string,
    rule: ArchRule | StaticArchRule,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]> {
    const classes = await this.analyzeCode(basePath, patterns);
    return rule.check(classes);
  }

  /**
   * Check multiple rules
   */
  public async checkRules(
    basePath: string,
    rules: Array<ArchRule | StaticArchRule>,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]> {
    const classes = await this.analyzeCode(basePath, patterns);
    const allViolations: ArchitectureViolation[] = [];

    for (const rule of rules) {
      const violations = rule.check(classes);
      allViolations.push(...violations);
    }

    return allViolations;
  }

  /**
   * Assert that there are no violations (throws if there are)
   */
  public static assertNoViolations(violations: ArchitectureViolation[]): void {
    if (violations.length > 0) {
      const messages = violations.map((v) => `  - ${v.message} (${v.filePath})`);
      throw new Error(
        `Architecture violations found:\n${messages.join('\n')}\n\nTotal: ${violations.length} violation(s)`
      );
    }
  }

  /**
   * Check rules from a configuration file
   */
  public async checkConfig(configPath?: string): Promise<ArchitectureViolation[]> {
    const { loadConfig } = await import('./config/ConfigLoader');
    const config = await loadConfig(configPath);

    const basePath = config.basePath || process.cwd();
    const patterns = config.patterns;

    const violations = await this.checkRules(basePath, config.rules, patterns);

    // Call custom violation handler if provided
    if (config.onViolation) {
      config.onViolation(violations);
    }

    // Throw if failOnViolation is true
    if (config.failOnViolation && violations.length > 0) {
      ArchUnitTS.assertNoViolations(violations);
    }

    return violations;
  }
}

/**
 * Create a new ArchUnitTS instance
 */
export function createArchUnit(): ArchUnitTS {
  return new ArchUnitTS();
}

// Default export
export default ArchUnitTS;
