import { ArchitectureViolation } from '../types';
import { SuggestionEngine } from './SuggestionEngine';

/**
 * Enhanced violation with intelligence features
 */
export interface EnhancedViolation extends ArchitectureViolation {
  /** Suggested fix with actionable steps */
  suggestedFix?: {
    description: string;
    autoFixable: boolean;
    expectedPattern?: string;
    codeAction?: string;
  };

  /** IDs of related violations (same root cause) */
  relatedViolations?: string[];

  /** Root cause identifier for grouping */
  rootCause?: string;

  /** Impact score (0-100) for prioritization */
  impactScore?: number;

  /** Category for better organization */
  category?: 'layering' | 'naming' | 'dependency' | 'security' | 'organization';

  /** Alternative suggestions ("did you mean?") */
  suggestions?: string[];

  /** Unique identifier for this violation */
  id?: string;
}

/**
 * Grouped violations by root cause
 */
export interface ViolationGroup {
  /** Root cause description */
  rootCause: string;

  /** Number of violations in this group */
  count: number;

  /** All violations in this group */
  violations: EnhancedViolation[];

  /** Suggested fix that applies to all */
  groupFix?: string;

  /** Impact score for the entire group */
  groupImpactScore: number;
}

/**
 * Analysis result with insights
 */
export interface ViolationAnalysis {
  /** Total number of violations */
  total: number;

  /** Number of unique root causes */
  uniqueRootCauses: number;

  /** Violations grouped by root cause */
  groups: ViolationGroup[];

  /** Top 5 most impactful violations */
  topPriority: EnhancedViolation[];

  /** Violations by category */
  byCategory: Map<string, EnhancedViolation[]>;

  /** Files with most violations */
  hotspotFiles: Array<{ file: string; count: number }>;
}

/**
 * Intelligent violation analyzer that provides insights,
 * root cause analysis, and actionable suggestions
 *
 * @example
 * ```typescript
 * const analyzer = new ViolationAnalyzer(violations);
 * const enhanced = analyzer.enhance();
 * const grouped = analyzer.groupByRootCause();
 *
 * console.log(`${grouped.length} root causes found`);
 * for (const group of grouped) {
 *   console.log(`${group.rootCause}: ${group.count} violations`);
 * }
 * ```
 */
export class ViolationAnalyzer {
  private violations: ArchitectureViolation[];
  private suggestionEngine: SuggestionEngine;

  constructor(violations: ArchitectureViolation[]) {
    this.violations = violations;
    this.suggestionEngine = new SuggestionEngine();
  }

  /**
   * Enhance violations with intelligence features
   */
  public enhance(): EnhancedViolation[] {
    return this.violations.map((violation, index) => {
      const enhanced: EnhancedViolation = {
        ...violation,
        id: this.generateId(violation, index),
        category: this.categorizeViolation(violation),
        impactScore: this.calculateImpactScore(violation),
        suggestedFix: this.suggestionEngine.generateFix(violation),
        suggestions: this.suggestionEngine.generateAlternatives(violation),
      };

      return enhanced;
    });
  }

  /**
   * Group violations by root cause
   */
  public groupByRootCause(): ViolationGroup[] {
    const enhanced = this.enhance();

    // Assign root causes
    const withRootCauses = this.assignRootCauses(enhanced);

    // Group by root cause
    const groups = new Map<string, EnhancedViolation[]>();

    for (const violation of withRootCauses) {
      const rootCause = violation.rootCause || 'unknown';

      if (!groups.has(rootCause)) {
        groups.set(rootCause, []);
      }
      groups.get(rootCause)!.push(violation);
    }

    // Convert to ViolationGroup array
    const result: ViolationGroup[] = [];

    for (const [rootCause, violations] of groups) {
      const groupImpactScore =
        violations.reduce((sum, v) => sum + (v.impactScore || 0), 0) / violations.length;

      result.push({
        rootCause,
        count: violations.length,
        violations,
        groupFix: this.generateGroupFix(violations),
        groupImpactScore,
      });
    }

    // Sort by impact score (descending)
    result.sort((a, b) => b.groupImpactScore - a.groupImpactScore);

    return result;
  }

  /**
   * Perform full analysis with all insights
   */
  public analyze(): ViolationAnalysis {
    const enhanced = this.enhance();
    const groups = this.groupByRootCause();

    // Group by category
    const byCategory = new Map<string, EnhancedViolation[]>();
    for (const violation of enhanced) {
      const category = violation.category || 'unknown';
      if (!byCategory.has(category)) {
        byCategory.set(category, []);
      }
      byCategory.get(category)!.push(violation);
    }

    // Find top priority violations
    const topPriority = [...enhanced]
      .sort((a, b) => (b.impactScore || 0) - (a.impactScore || 0))
      .slice(0, 5);

    // Find hotspot files
    const fileCounts = new Map<string, number>();
    for (const violation of enhanced) {
      const file = violation.filePath || 'unknown';
      fileCounts.set(file, (fileCounts.get(file) || 0) + 1);
    }

    const hotspotFiles = Array.from(fileCounts.entries())
      .map(([file, count]) => ({ file, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total: enhanced.length,
      uniqueRootCauses: groups.length,
      groups,
      topPriority,
      byCategory,
      hotspotFiles,
    };
  }

  /**
   * Generate a unique ID for a violation
   */
  private generateId(violation: ArchitectureViolation, index: number): string {
    const fileHash = violation.filePath ? violation.filePath.substring(0, 8) : 'unknown';
    const ruleHash = violation.rule.substring(0, 8);
    return `${fileHash}-${ruleHash}-${index}`;
  }

  /**
   * Categorize a violation
   */
  private categorizeViolation(violation: ArchitectureViolation): EnhancedViolation['category'] {
    const message = violation.message.toLowerCase();
    const rule = violation.rule.toLowerCase();

    // Check for security violations
    if (
      message.includes('path traversal') ||
      message.includes('security') ||
      message.includes('injection')
    ) {
      return 'security';
    }

    // Check for layering violations
    if (
      message.includes('layer') ||
      message.includes('depend on') ||
      rule.includes('layer') ||
      message.includes('access')
    ) {
      return 'layering';
    }

    // Check for naming violations
    if (
      message.includes('name') ||
      message.includes('should end with') ||
      message.includes('should start with') ||
      rule.includes('naming')
    ) {
      return 'naming';
    }

    // Check for dependency violations
    if (message.includes('dependency') || message.includes('depend') || rule.includes('depend')) {
      return 'dependency';
    }

    // Check for organization violations
    if (
      message.includes('package') ||
      message.includes('reside') ||
      message.includes('directory') ||
      rule.includes('package')
    ) {
      return 'organization';
    }

    return 'organization'; // default
  }

  /**
   * Calculate impact score (0-100)
   */
  private calculateImpactScore(violation: ArchitectureViolation): number {
    let score = 50; // base score

    // Severity impact
    if (violation.severity === 'error') {
      score += 30;
    } else {
      score += 10;
    }

    // Category impact
    const category = this.categorizeViolation(violation);
    if (category === 'security') {
      score += 20;
    } else if (category === 'layering') {
      score += 15;
    } else if (category === 'dependency') {
      score += 10;
    } else if (category === 'naming') {
      score += 5;
    }

    return Math.min(100, score);
  }

  /**
   * Assign root causes to violations
   */
  private assignRootCauses(violations: EnhancedViolation[]): EnhancedViolation[] {
    const withRootCauses: EnhancedViolation[] = [];

    for (const violation of violations) {
      const rootCause = this.identifyRootCause(violation);
      withRootCauses.push({
        ...violation,
        rootCause,
        relatedViolations: this.findRelatedViolations(violation, violations),
      });
    }

    return withRootCauses;
  }

  /**
   * Identify the root cause of a violation
   */
  private identifyRootCause(violation: EnhancedViolation): string {
    const category = violation.category || 'unknown';
    const rule = violation.rule;

    // For naming violations
    if (category === 'naming') {
      if (rule.includes('end with')) {
        return 'Incorrect naming suffix';
      }
      if (rule.includes('start with')) {
        return 'Incorrect naming prefix';
      }
      if (rule.includes('match')) {
        return 'Naming pattern mismatch';
      }
      return 'Naming convention violation';
    }

    // For layering violations
    if (category === 'layering') {
      if (rule.includes('depend on')) {
        return 'Forbidden layer dependency';
      }
      if (rule.includes('access')) {
        return 'Unauthorized layer access';
      }
      return 'Layering principle violation';
    }

    // For dependency violations
    if (category === 'dependency') {
      if (rule.includes('repository')) {
        return 'Direct repository access';
      }
      if (rule.includes('controller')) {
        return 'Controller dependency issue';
      }
      return 'Dependency rule violation';
    }

    // For organization violations
    if (category === 'organization') {
      if (rule.includes('package')) {
        return 'Incorrect package structure';
      }
      if (rule.includes('directory')) {
        return 'Incorrect directory organization';
      }
      return 'Organization rule violation';
    }

    // For security violations
    if (category === 'security') {
      return 'Security constraint violation';
    }

    return `${category} violation`;
  }

  /**
   * Find violations related to this one
   */
  private findRelatedViolations(
    violation: EnhancedViolation,
    allViolations: EnhancedViolation[]
  ): string[] {
    const related: string[] = [];

    const violationRule = violation.rule.toLowerCase();
    const violationCategory = violation.category;

    for (const other of allViolations) {
      if (other.id === violation.id) continue;

      // Same category and similar rule
      if (
        other.category === violationCategory &&
        other.rule.toLowerCase().includes(violationRule.split(' ')[0])
      ) {
        if (other.id) {
          related.push(other.id);
        }
      }
    }

    return related.slice(0, 5); // Limit to 5 related violations
  }

  /**
   * Generate a fix that applies to all violations in a group
   */
  private generateGroupFix(violations: EnhancedViolation[]): string {
    if (violations.length === 0) return '';

    const firstViolation = violations[0];
    const count = violations.length;

    const fixes = violations.filter((v) => v.suggestedFix).map((v) => v.suggestedFix!.description);

    if (fixes.length > 0 && fixes.every((f) => f === fixes[0])) {
      return `Apply the same fix to all ${count} violations: ${fixes[0]}`;
    }

    return `Review and fix ${count} related ${firstViolation.category} violations`;
  }

  /**
   * Format analysis for console output
   */
  public static formatAnalysis(analysis: ViolationAnalysis): string {
    const lines: string[] = [];

    lines.push('Architecture Violation Analysis');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Total Violations: ${analysis.total}`);
    lines.push(`Unique Root Causes: ${analysis.uniqueRootCauses}`);
    lines.push('');

    if (analysis.groups.length > 0) {
      lines.push('Root Causes (by impact):');
      lines.push('-'.repeat(60));

      for (const group of analysis.groups.slice(0, 10)) {
        const impact = `Impact: ${group.groupImpactScore.toFixed(0)}`;
        lines.push(`  • ${group.rootCause} (${group.count} violations) - ${impact}`);

        if (group.groupFix) {
          lines.push(`    Fix: ${group.groupFix}`);
        }
      }
      lines.push('');
    }

    if (analysis.topPriority.length > 0) {
      lines.push('Top Priority Violations:');
      lines.push('-'.repeat(60));

      for (const violation of analysis.topPriority) {
        const impact = violation.impactScore?.toFixed(0) || '0';
        lines.push(`  • [Impact: ${impact}] ${violation.message}`);
        lines.push(`    File: ${violation.filePath}`);

        if (violation.suggestedFix) {
          lines.push(`    Fix: ${violation.suggestedFix.description}`);
        }
        lines.push('');
      }
    }

    if (analysis.hotspotFiles.length > 0) {
      lines.push('Hotspot Files (most violations):');
      lines.push('-'.repeat(60));

      for (const hotspot of analysis.hotspotFiles.slice(0, 5)) {
        lines.push(`  • ${hotspot.file}: ${hotspot.count} violations`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
