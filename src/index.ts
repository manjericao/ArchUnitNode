/**
 * ArchUnit for TypeScript/JavaScript
 * A library for checking and testing architecture in TypeScript/JavaScript applications
 */

// Core classes
export { TSClass } from './core/TSClass';
export { TSClasses } from './core/TSClasses';
export { ArchRule, BaseArchRule } from './core/ArchRule';

// Types
export * from './types';

// Parser and Analyzer
export { TypeScriptParser } from './parser/TypeScriptParser';
export { CodeAnalyzer } from './analyzer/CodeAnalyzer';

// Fluent API
export { ArchRuleDefinition } from './lang/ArchRuleDefinition';
export { ClassesThat } from './lang/syntax/ClassesThat';
export { ClassesShould } from './lang/syntax/ClassesShould';

// Library (predefined patterns)
export {
  Architectures,
  CleanArchitecture,
  DDDArchitecture,
  cleanArchitecture,
  dddArchitecture
} from './library/Architectures';
export { LayeredArchitecture, layeredArchitecture } from './library/LayeredArchitecture';

// Cache
export { CacheManager, getGlobalCache, resetGlobalCache } from './cache/CacheManager';

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
  public async analyzeCode(
    basePath: string,
    patterns?: string[]
  ): Promise<TSClasses> {
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
    rule: ArchRule | import('./lang/ArchRuleDefinition').StaticArchRule,
    patterns?: string[]
  ): Promise<import('./types').ArchitectureViolation[]> {
    const classes = await this.analyzeCode(basePath, patterns);
    return rule.check(classes);
  }

  /**
   * Check multiple rules
   */
  public async checkRules(
    basePath: string,
    rules: Array<ArchRule | import('./lang/ArchRuleDefinition').StaticArchRule>,
    patterns?: string[]
  ): Promise<import('./types').ArchitectureViolation[]> {
    const classes = await this.analyzeCode(basePath, patterns);
    const allViolations: import('./types').ArchitectureViolation[] = [];

    for (const rule of rules) {
      const violations = rule.check(classes);
      allViolations.push(...violations);
    }

    return allViolations;
  }

  /**
   * Assert that there are no violations (throws if there are)
   */
  public static assertNoViolations(
    violations: import('./types').ArchitectureViolation[]
  ): void {
    if (violations.length > 0) {
      const messages = violations.map((v) => `  - ${v.message} (${v.filePath})`);
      throw new Error(
        `Architecture violations found:\n${messages.join('\n')}\n\nTotal: ${violations.length} violation(s)`
      );
    }
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
