/**
 * Architecture Timeline - Track architecture evolution over time using git history
 *
 * This module allows you to:
 * - Analyze architecture at different points in git history
 * - Track metrics evolution over time
 * - Compare architecture between commits/branches
 * - Visualize architecture trends
 * - Generate evolution reports
 *
 * @module timeline/ArchitectureTimeline
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { ArchRule, ArchitectureViolation } from '../core/ArchRule';
import { CodeAnalyzer } from '../analyzer/CodeAnalyzer';
import { ArchitecturalMetricsAnalyzer } from '../metrics/ArchitecturalMetrics';

/**
 * Represents a point in time in the architecture timeline
 */
export interface TimelineSnapshot {
  /** Git commit SHA */
  commit: string;
  /** Commit date */
  date: Date;
  /** Commit message */
  message: string;
  /** Commit author */
  author: string;
  /** Number of violations */
  violationCount: number;
  /** Violations by severity */
  violations: {
    errors: number;
    warnings: number;
  };
  /** Architectural metrics at this point */
  metrics: {
    totalClasses: number;
    totalDependencies: number;
    averageComplexity: number;
    cyclicDependencies: number;
    instability: number;
    fitnessScore: number;
    technicalDebt: {
      totalHours: number;
      debtRatio: number;
    };
  };
  /** All violations */
  allViolations: ArchitectureViolation[];
}

/**
 * Configuration for timeline analysis
 */
export interface TimelineConfig {
  /** Base path of the repository */
  basePath: string;
  /** File patterns to analyze */
  patterns: string[];
  /** Rules to check */
  rules: ArchRule[];
  /** Start commit (default: first commit) */
  startCommit?: string;
  /** End commit (default: HEAD) */
  endCommit?: string;
  /** Branch to analyze (default: current branch) */
  branch?: string;
  /** Number of commits to skip between samples (default: 0) */
  skipCommits?: number;
  /** Maximum number of commits to analyze (default: all) */
  maxCommits?: number;
  /** Include uncommitted changes (default: false) */
  includeUncommitted?: boolean;
}

/**
 * Timeline evolution report
 */
export interface TimelineReport {
  /** Timeline configuration */
  config: TimelineConfig;
  /** All snapshots in chronological order */
  snapshots: TimelineSnapshot[];
  /** Summary statistics */
  summary: {
    totalCommits: number;
    dateRange: {
      start: Date;
      end: Date;
    };
    violationTrend: 'improving' | 'degrading' | 'stable';
    metricsTrend: 'improving' | 'degrading' | 'stable';
    averageViolations: number;
    averageFitnessScore: number;
  };
  /** Generated at timestamp */
  generatedAt: Date;
}

/**
 * Architecture Timeline Analyzer
 *
 * Analyzes architecture evolution over git history
 */
export class ArchitectureTimeline {
  private config: TimelineConfig;
  private _tempDir: string; // Reserved for temporary file operations

  constructor(config: TimelineConfig) {
    this.config = config;
    this._tempDir = path.join(this.config.basePath, '.archunit-timeline-temp');
    void this._tempDir; // Mark as intentionally unused for now
  }

  /**
   * Check if the directory is a git repository
   */
  private isGitRepository(): boolean {
    try {
      const gitDir = path.join(this.config.basePath, '.git');
      return fs.existsSync(gitDir);
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute a git command
   */
  private execGit(command: string): string {
    try {
      return execSync(`git ${command}`, {
        cwd: this.config.basePath,
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();
    } catch (error) {
      throw new Error(`Git command failed: ${command}\n${error}`);
    }
  }

  /**
   * Get list of commits to analyze
   */
  private getCommitList(): Array<{ sha: string; date: Date; message: string; author: string }> {
    if (!this.isGitRepository()) {
      throw new Error('Not a git repository. Architecture timeline requires git.');
    }

    const _branch = this.config.branch || this.execGit('branch --show-current'); // Reserved for branch-specific analysis
    void _branch; // Mark as intentionally unused for now
    const startCommit = this.config.startCommit || this.execGit('rev-list --max-parents=0 HEAD');
    const endCommit = this.config.endCommit || 'HEAD';

    // Get commit log
    const format = '%H%n%ai%n%an%n%s%n---COMMIT-END---';
    const logOutput = this.execGit(
      `log ${startCommit}..${endCommit} --format="${format}" --reverse`
    );

    const commits: Array<{ sha: string; date: Date; message: string; author: string }> = [];
    const commitBlocks = logOutput.split('---COMMIT-END---\n').filter(Boolean);

    for (const block of commitBlocks) {
      const lines = block.trim().split('\n');
      if (lines.length >= 4) {
        commits.push({
          sha: lines[0],
          date: new Date(lines[1]),
          author: lines[2],
          message: lines[3],
        });
      }
    }

    // Apply filtering
    let filteredCommits = commits;

    if (this.config.skipCommits && this.config.skipCommits > 0) {
      filteredCommits = commits.filter((_, index) => index % (this.config.skipCommits! + 1) === 0);
    }

    if (this.config.maxCommits && this.config.maxCommits > 0) {
      filteredCommits = filteredCommits.slice(0, this.config.maxCommits);
    }

    return filteredCommits;
  }

  /**
   * Stash current changes
   */
  private stashChanges(): boolean {
    try {
      const status = this.execGit('status --porcelain');
      if (status) {
        this.execGit('stash push -u -m "archunit-timeline-temp"');
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Pop stashed changes
   */
  private popStash(): void {
    try {
      this.execGit('stash pop');
    } catch (error) {
      // Ignore errors when popping stash
    }
  }

  /**
   * Checkout a specific commit
   */
  private checkoutCommit(sha: string): void {
    this.execGit(`checkout ${sha} --quiet`);
  }

  /**
   * Return to original branch
   */
  private returnToOriginalBranch(branch: string): void {
    this.execGit(`checkout ${branch} --quiet`);
  }

  /**
   * Analyze architecture at a specific commit
   */
  private async analyzeCommit(
    sha: string,
    date: Date,
    message: string,
    author: string
  ): Promise<TimelineSnapshot> {
    // Analyze code at this commit
    const analyzer = new CodeAnalyzer();
    const classes = await analyzer.analyze(this.config.basePath, this.config.patterns);

    // Run all rules
    let allViolations: ArchitectureViolation[] = [];
    for (const rule of this.config.rules) {
      const violations = rule.check(classes);
      allViolations = allViolations.concat(violations);
    }

    // Count violations by severity
    const errors = allViolations.filter((v) => v.severity === 'error').length;
    const warnings = allViolations.filter((v) => v.severity === 'warning').length;

    // Calculate metrics
    const metricsCalculator = new ArchitecturalMetricsAnalyzer(classes);
    const metricsResult = metricsCalculator.calculateMetrics();

    return {
      commit: sha,
      date,
      message,
      author,
      violationCount: allViolations.length,
      violations: {
        errors,
        warnings,
      },
      metrics: {
        totalClasses: metricsResult.summary.totalClasses,
        totalDependencies: metricsResult.complexity.maxDependencies,
        averageComplexity: metricsResult.complexity.averageDependencies,
        cyclicDependencies: 0, // Cyclic dependencies are checked separately
        instability: metricsResult.summary.averageInstability,
        fitnessScore: metricsResult.fitness.overallScore,
        technicalDebt: {
          totalHours: metricsResult.technicalDebt.estimatedHoursToFix,
          debtRatio: metricsResult.technicalDebt.totalDebtScore / 100,
        },
      },
      allViolations,
    };
  }

  /**
   * Analyze architecture timeline
   *
   * This will checkout different commits and analyze the architecture at each point.
   * WARNING: This will modify your working directory!
   */
  async analyze(
    progressCallback?: (current: number, total: number, commit: string) => void
  ): Promise<TimelineReport> {
    if (!this.isGitRepository()) {
      throw new Error('Not a git repository. Architecture timeline requires git.');
    }

    const commits = this.getCommitList();
    if (commits.length === 0) {
      throw new Error('No commits found in the specified range');
    }

    // Save current state
    const currentBranch = this.execGit('branch --show-current') || this.execGit('rev-parse HEAD');
    const hasStash = this.stashChanges();

    const snapshots: TimelineSnapshot[] = [];

    try {
      // Analyze each commit
      for (let i = 0; i < commits.length; i++) {
        const commit = commits[i];

        if (progressCallback) {
          progressCallback(i + 1, commits.length, commit.sha.substring(0, 7));
        }

        // Checkout commit
        this.checkoutCommit(commit.sha);

        // Analyze at this point
        const snapshot = await this.analyzeCommit(
          commit.sha,
          commit.date,
          commit.message,
          commit.author
        );

        snapshots.push(snapshot);
      }

      // Analyze current state if requested
      if (this.config.includeUncommitted) {
        this.returnToOriginalBranch(currentBranch);
        if (hasStash) {
          this.popStash();
        }

        if (progressCallback) {
          progressCallback(commits.length + 1, commits.length + 1, 'uncommitted');
        }

        const snapshot = await this.analyzeCommit(
          'uncommitted',
          new Date(),
          'Uncommitted changes',
          'local'
        );
        snapshots.push(snapshot);
      }
    } finally {
      // Always return to original state
      this.returnToOriginalBranch(currentBranch);
      if (hasStash) {
        this.popStash();
      }
    }

    // Generate summary
    const summary = this.generateSummary(snapshots);

    return {
      config: this.config,
      snapshots,
      summary,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate summary statistics
   */
  private generateSummary(snapshots: TimelineSnapshot[]): TimelineReport['summary'] {
    if (snapshots.length === 0) {
      throw new Error('No snapshots to summarize');
    }

    const first = snapshots[0];
    const last = snapshots[snapshots.length - 1];

    // Calculate trends
    const violationTrend = this.calculateTrend(snapshots.map((s) => s.violationCount));
    const metricsTrend = this.calculateTrend(snapshots.map((s) => s.metrics.fitnessScore));

    const avgViolations =
      snapshots.reduce((sum, s) => sum + s.violationCount, 0) / snapshots.length;
    const avgFitness =
      snapshots.reduce((sum, s) => sum + s.metrics.fitnessScore, 0) / snapshots.length;

    return {
      totalCommits: snapshots.length,
      dateRange: {
        start: first.date,
        end: last.date,
      },
      violationTrend,
      metricsTrend,
      averageViolations: Math.round(avgViolations * 100) / 100,
      averageFitnessScore: Math.round(avgFitness * 100) / 100,
    };
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(values: number[]): 'improving' | 'degrading' | 'stable' {
    if (values.length < 2) {
      return 'stable';
    }

    // Simple linear regression
    const n = values.length;
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, v) => sum + v, 0) / n;

    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < n; i++) {
      numerator += (i - xMean) * (values[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }

    const slope = numerator / denominator;

    // For violations: negative slope is improving
    // For fitness score: positive slope is improving
    // We'll use a threshold of 0.1 to determine significance
    if (Math.abs(slope) < 0.1) {
      return 'stable';
    }

    return slope < 0 ? 'improving' : 'degrading';
  }

  /**
   * Compare two commits
   */
  async compare(
    commit1: string,
    commit2: string
  ): Promise<{
    before: TimelineSnapshot;
    after: TimelineSnapshot;
    changes: {
      violationDelta: number;
      metricsDelta: {
        classesDelta: number;
        fitnessScoreDelta: number;
        debtDelta: number;
      };
      newViolations: ArchitectureViolation[];
      fixedViolations: ArchitectureViolation[];
    };
  }> {
    const currentBranch = this.execGit('branch --show-current') || this.execGit('rev-parse HEAD');
    const hasStash = this.stashChanges();

    try {
      // Analyze first commit
      this.checkoutCommit(commit1);
      const info1 = this.execGit(`log -1 --format="%ai%n%an%n%s" ${commit1}`).split('\n');
      const before = await this.analyzeCommit(commit1, new Date(info1[0]), info1[2], info1[1]);

      // Analyze second commit
      this.checkoutCommit(commit2);
      const info2 = this.execGit(`log -1 --format="%ai%n%an%n%s" ${commit2}`).split('\n');
      const after = await this.analyzeCommit(commit2, new Date(info2[0]), info2[2], info2[1]);

      // Calculate changes
      const violationDelta = after.violationCount - before.violationCount;
      const metricsDelta = {
        classesDelta: after.metrics.totalClasses - before.metrics.totalClasses,
        fitnessScoreDelta: after.metrics.fitnessScore - before.metrics.fitnessScore,
        debtDelta: after.metrics.technicalDebt.totalHours - before.metrics.technicalDebt.totalHours,
      };

      // Find new and fixed violations
      const beforeViolationKeys = new Set(
        before.allViolations.map((v) => `${v.filePath}:${v.rule}:${v.message}`)
      );
      const afterViolationKeys = new Set(
        after.allViolations.map((v) => `${v.filePath}:${v.rule}:${v.message}`)
      );

      const newViolations = after.allViolations.filter(
        (v) => !beforeViolationKeys.has(`${v.filePath}:${v.rule}:${v.message}`)
      );
      const fixedViolations = before.allViolations.filter(
        (v) => !afterViolationKeys.has(`${v.filePath}:${v.rule}:${v.message}`)
      );

      return {
        before,
        after,
        changes: {
          violationDelta,
          metricsDelta,
          newViolations,
          fixedViolations,
        },
      };
    } finally {
      this.returnToOriginalBranch(currentBranch);
      if (hasStash) {
        this.popStash();
      }
    }
  }
}

/**
 * Create an architecture timeline analyzer
 */
export function createTimeline(config: TimelineConfig): ArchitectureTimeline {
  return new ArchitectureTimeline(config);
}
