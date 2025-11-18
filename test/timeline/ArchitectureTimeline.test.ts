/**
 * Architecture Timeline Tests
 */

import * as fs from 'fs';
import * as path from 'path';
import { createTimeline, TimelineConfig } from '../../src/timeline/ArchitectureTimeline';
import { TimelineVisualizer } from '../../src/timeline/TimelineVisualizer';
import { ArchRuleDefinition } from '../../src/lang/ArchRuleDefinition';

describe('ArchitectureTimeline', () => {
  const testRepoPath = path.join(__dirname, '../fixtures/test-repo');
  const tempOutputDir = path.join(__dirname, '../temp-timeline-output');

  beforeAll(() => {
    // Create temp directory for outputs
    if (!fs.existsSync(tempOutputDir)) {
      fs.mkdirSync(tempOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up temp directory
    if (fs.existsSync(tempOutputDir)) {
      fs.rmSync(tempOutputDir, { recursive: true, force: true });
    }
  });

  describe('Timeline Configuration', () => {
    it('should create a timeline analyzer with valid config', () => {
      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['**/*.ts'],
        rules: [
          ArchRuleDefinition.classes()
            .should()
            .haveSimpleNameEndingWith('Service')
            .orShould()
            .haveSimpleNameEndingWith('Controller'),
        ],
      };

      const timeline = createTimeline(config);
      expect(timeline).toBeDefined();
    });

    it('should validate git repository requirement', async () => {
      const nonGitPath = tempOutputDir;
      const config: TimelineConfig = {
        basePath: nonGitPath,
        patterns: ['**/*.ts'],
        rules: [],
      };

      const timeline = createTimeline(config);

      // Should throw when trying to analyze non-git repo
      await expect(timeline.analyze()).rejects.toThrow('Not a git repository');
    });
  });

  describe('Timeline Analysis', () => {
    it('should handle empty commit list gracefully', async () => {
      // This test requires a git repo, so we skip if not available
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['**/*.ts'],
        rules: [],
        startCommit: 'HEAD',
        endCommit: 'HEAD',
      };

      const timeline = createTimeline(config);

      // This should work but might have 0 commits
      const report = await timeline.analyze();
      expect(report).toBeDefined();
      expect(report.snapshots).toBeDefined();
      expect(Array.isArray(report.snapshots)).toBe(true);
    });

    it('should track violations over time', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [
          ArchRuleDefinition.classes()
            .that()
            .resideInPackage('services')
            .should()
            .haveSimpleNameEndingWith('Service'),
        ],
        maxCommits: 2, // Analyze only 2 commits for speed
      };

      const timeline = createTimeline(config);
      const progressUpdates: string[] = [];

      const report = await timeline.analyze((current, total, commit) => {
        progressUpdates.push(`${current}/${total}: ${commit}`);
      });

      expect(report).toBeDefined();
      expect(report.snapshots.length).toBeGreaterThan(0);
      expect(progressUpdates.length).toBeGreaterThan(0);

      // Verify snapshot structure
      for (const snapshot of report.snapshots) {
        expect(snapshot.commit).toBeDefined();
        expect(snapshot.date).toBeInstanceOf(Date);
        expect(snapshot.message).toBeDefined();
        expect(snapshot.author).toBeDefined();
        expect(snapshot.violationCount).toBeGreaterThanOrEqual(0);
        expect(snapshot.violations.errors).toBeGreaterThanOrEqual(0);
        expect(snapshot.violations.warnings).toBeGreaterThanOrEqual(0);
        expect(snapshot.metrics).toBeDefined();
        expect(snapshot.metrics.fitnessScore).toBeGreaterThanOrEqual(0);
        expect(snapshot.metrics.fitnessScore).toBeLessThanOrEqual(100);
      }
    });

    it('should generate summary statistics correctly', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 3,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      expect(report.summary).toBeDefined();
      expect(report.summary.totalCommits).toBe(report.snapshots.length);
      expect(report.summary.dateRange).toBeDefined();
      expect(report.summary.dateRange.start).toBeInstanceOf(Date);
      expect(report.summary.dateRange.end).toBeInstanceOf(Date);
      expect(['improving', 'degrading', 'stable']).toContain(report.summary.violationTrend);
      expect(['improving', 'degrading', 'stable']).toContain(report.summary.metricsTrend);
      expect(report.summary.averageViolations).toBeGreaterThanOrEqual(0);
      expect(report.summary.averageFitnessScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Commit Comparison', () => {
    it('should compare two commits', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [
          ArchRuleDefinition.classes()
            .that()
            .resideInPackage('core')
            .should()
            .haveSimpleNameStartingWith('TS'),
        ],
      };

      const timeline = createTimeline(config);

      // Get HEAD and previous commit
      const { execSync } = require('child_process');
      const head = execSync('git rev-parse HEAD', {
        cwd: process.cwd(),
        encoding: 'utf-8',
      }).trim();
      const previous = execSync('git rev-parse HEAD~1', {
        cwd: process.cwd(),
        encoding: 'utf-8',
      }).trim();

      const comparison = await timeline.compare(previous, head);

      expect(comparison).toBeDefined();
      expect(comparison.before).toBeDefined();
      expect(comparison.after).toBeDefined();
      expect(comparison.changes).toBeDefined();
      expect(comparison.changes.violationDelta).toBeDefined();
      expect(comparison.changes.metricsDelta).toBeDefined();
      expect(comparison.changes.newViolations).toBeDefined();
      expect(comparison.changes.fixedViolations).toBeDefined();
    });
  });

  describe('Timeline Visualization', () => {
    it('should generate HTML visualization', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 2,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      const outputPath = path.join(tempOutputDir, 'timeline.html');
      TimelineVisualizer.generateHtml(report, {
        outputPath,
        title: 'Test Timeline',
        theme: 'light',
      });

      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('Test Timeline');
      expect(content).toContain('chart.js');
      expect(content).toContain('Violations Over Time');
    });

    it('should generate dark theme visualization', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 2,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      const outputPath = path.join(tempOutputDir, 'timeline-dark.html');
      TimelineVisualizer.generateHtml(report, {
        outputPath,
        theme: 'dark',
      });

      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('#1a1a1a'); // Dark background color
    });

    it('should generate JSON report', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 2,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      const outputPath = path.join(tempOutputDir, 'timeline.json');
      TimelineVisualizer.generateJson(report, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      const content = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      expect(content.snapshots).toBeDefined();
      expect(content.summary).toBeDefined();
    });

    it('should generate Markdown report', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 2,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      const outputPath = path.join(tempOutputDir, 'timeline.md');
      TimelineVisualizer.generateMarkdown(report, outputPath);

      expect(fs.existsSync(outputPath)).toBe(true);
      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('# Architecture Evolution Timeline');
      expect(content).toContain('## Summary');
      expect(content).toContain('## Timeline');
    });
  });

  describe('Progress Callback', () => {
    it('should call progress callback during analysis', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 2,
      };

      const timeline = createTimeline(config);
      const progressCalls: Array<{ current: number; total: number; commit: string }> = [];

      await timeline.analyze((current, total, commit) => {
        progressCalls.push({ current, total, commit });
      });

      expect(progressCalls.length).toBeGreaterThan(0);
      expect(progressCalls[0].current).toBe(1);
      expect(progressCalls[progressCalls.length - 1].current).toBe(
        progressCalls[progressCalls.length - 1].total
      );
    });
  });

  describe('Filtering Options', () => {
    it('should respect skipCommits option', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 10,
        skipCommits: 1, // Skip every other commit
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      // Should have approximately half the commits
      expect(report.snapshots.length).toBeLessThanOrEqual(5);
    });

    it('should respect maxCommits option', async () => {
      // Skip if not a git repo
      if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
        console.log('Skipping git-dependent test (not a git repository)');
        return;
      }

      const config: TimelineConfig = {
        basePath: process.cwd(),
        patterns: ['src/**/*.ts'],
        rules: [],
        maxCommits: 3,
      };

      const timeline = createTimeline(config);
      const report = await timeline.analyze();

      expect(report.snapshots.length).toBeLessThanOrEqual(3);
    });
  });
});
