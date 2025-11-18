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
import { DependencyGraph, GraphBuilder, DotGenerator, HtmlGraphGenerator } from './graph';
import * as fs from 'fs';
import * as path from 'path';

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
export type { ParseError, AnalysisResult } from './analyzer/CodeAnalyzer';

// Fluent API
export {
  ArchRuleDefinition,
  StaticArchRule,
  ClassesSelector,
  NoClassesSelector,
  ClassesThatStatic,
  ClassesShouldStatic,
  StaticClassesDependencyShould,
} from './lang/ArchRuleDefinition';
export { ClassesThat } from './lang/syntax/ClassesThat';
export { ClassesShould } from './lang/syntax/ClassesShould';

// Rule Composition
export { RuleComposer, CompositeRule, type LogicalOperator } from './composition';

// Violation Analysis
export {
  ViolationAnalyzer,
  type EnhancedViolation,
  type ViolationGroup,
  type ViolationAnalysis,
  SuggestionEngine,
  type SuggestedFix,
} from './analysis';

// Architectural Metrics
export {
  ArchitecturalMetricsAnalyzer,
  type CouplingMetrics,
  type CohesionMetrics,
  type ComplexityMetrics,
  type TechnicalDebt,
  type DebtItem,
  type ArchitectureFitness,
  type ArchitecturalMetricsResult,
} from './metrics';

// Library (architectural patterns)
export * from './library';

// Testing Utilities
export * from './testing';

// Cache
export {
  CacheManager,
  getGlobalCache,
  resetGlobalCache,
  type CacheOptions,
  type CacheStats,
  type CacheTierStats,
} from './cache/CacheManager';

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

// Graph Visualization
export {
  DependencyGraph,
  DependencyType,
  GraphNode,
  GraphEdge,
  GraphFilter,
  GraphBuilder,
  GraphBuilderOptions,
  DotGenerator,
  DotGeneratorOptions,
  HtmlGraphGenerator,
  HtmlGraphOptions,
} from './graph';

// Framework Detection
export {
  FrameworkDetector,
  type DetectedFramework,
  type RuleSuggestion,
  type FrameworkDetectionResult,
} from './framework';

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

  /**
   * Generate a dependency graph from analyzed code
   */
  public async createDependencyGraph(
    basePath: string,
    patterns?: string[],
    options?: {
      includeInterfaces?: boolean;
      includeFunctions?: boolean;
      includeModules?: boolean;
    }
  ): Promise<DependencyGraph> {
    const classes = await this.analyzeCode(basePath, patterns);
    const builder = new GraphBuilder(options);
    return builder.build(classes);
  }

  /**
   * Generate a DOT format graph (for Graphviz)
   */
  public async generateDotGraph(
    basePath: string,
    outputPath: string,
    options?: {
      patterns?: string[];
      graphOptions?: {
        direction?: 'LR' | 'TB' | 'RL' | 'BT';
        title?: string;
        showMetadata?: boolean;
        useColors?: boolean;
        clusterByModule?: boolean;
      };
      builderOptions?: {
        includeInterfaces?: boolean;
        includeFunctions?: boolean;
        includeModules?: boolean;
      };
      violations?: ArchitectureViolation[];
    }
  ): Promise<string> {
    const graph = await this.createDependencyGraph(
      basePath,
      options?.patterns,
      options?.builderOptions
    );

    const generator = new DotGenerator({
      ...options?.graphOptions,
      violations: options?.violations,
    });

    const dotContent = generator.generate(graph);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write DOT file
    fs.writeFileSync(outputPath, dotContent, 'utf-8');

    return outputPath;
  }

  /**
   * Generate an interactive HTML graph
   */
  public async generateHtmlGraph(
    basePath: string,
    outputPath: string,
    options?: {
      patterns?: string[];
      graphOptions?: {
        title?: string;
        width?: number;
        height?: number;
        showLegend?: boolean;
        enablePhysics?: boolean;
      };
      builderOptions?: {
        includeInterfaces?: boolean;
        includeFunctions?: boolean;
        includeModules?: boolean;
      };
      violations?: ArchitectureViolation[];
    }
  ): Promise<string> {
    const graph = await this.createDependencyGraph(
      basePath,
      options?.patterns,
      options?.builderOptions
    );

    const generator = new HtmlGraphGenerator({
      ...options?.graphOptions,
      violations: options?.violations,
    });

    const htmlContent = generator.generate(graph);

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    fs.writeFileSync(outputPath, htmlContent, 'utf-8');

    return outputPath;
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
