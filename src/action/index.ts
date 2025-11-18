/**
 * GitHub Action entry point
 *
 * @module action
 */

import * as core from '@actions/core';
import * as github from '@actions/github';
import * as fs from 'fs';
import { createArchUnit } from '../index';
import { loadConfig } from '../config/ConfigLoader';
import { createReportManager } from '../reports/ReportManager';
import { MetricsDashboard } from '../dashboard/MetricsDashboard';
import { ArchitecturalMetricsAnalyzer } from '../metrics/ArchitecturalMetrics';

/**
 * Main action function
 */
async function run(): Promise<void> {
  try {
    // Get inputs
    const configPath = core.getInput('config-path') || 'archunit.config.js';
    const basePath = core.getInput('base-path') || '.';
    const patternsInput =
      core.getInput('patterns') || 'src/**/*.ts,src/**/*.tsx,src/**/*.js,src/**/*.jsx';
    const failOnViolations = core.getInput('fail-on-violations') === 'true';
    const reportFormat = core.getInput('report-format') || 'html';
    const reportOutput = core.getInput('report-output') || 'archunit-report.html';
    const generateDashboard = core.getInput('generate-dashboard') === 'true';
    const dashboardOutput = core.getInput('dashboard-output') || 'archunit-dashboard.html';
    const commentPR = core.getInput('comment-pr') === 'true';
    const maxViolations = parseInt(core.getInput('max-violations') || '0', 10);

    // Parse patterns
    const patterns = patternsInput.split(',').map((p) => p.trim());

    core.info('🏗️  ArchUnitNode Architecture Check');
    core.info(`Base Path: ${basePath}`);
    core.info(`Patterns: ${patterns.join(', ')}`);

    // Load configuration
    let config: any;
    let rules: any[] = [];

    if (fs.existsSync(configPath)) {
      core.info(`Loading configuration from ${configPath}`);
      config = await loadConfig(configPath);
      rules = config.rules || [];
    } else {
      core.warning(`Configuration file not found: ${configPath}`);
      core.info('Running with default rules');
    }

    // Create analyzer
    const analyzer = createArchUnit();

    // Analyze code
    core.info('🔍 Analyzing code...');
    const classes = await analyzer.analyzeCode(basePath, patterns);
    core.info(`Found ${classes.size()} classes`);

    // Run rules
    core.info('📋 Checking architecture rules...');
    const violations = await analyzer.checkRules(basePath, rules, patterns);

    // Count violations by severity
    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;

    // Calculate metrics
    const metricsCalculator = new ArchitecturalMetricsAnalyzer(classes);
    const metricsResult = metricsCalculator.calculateMetrics();
    const fitness = metricsResult.fitness;

    // Output results
    core.info('');
    core.info('📊 Results:');
    core.info(`  Total Violations: ${violations.length}`);
    core.info(`  Errors: ${errors}`);
    core.info(`  Warnings: ${warnings}`);
    core.info(`  Fitness Score: ${fitness.overallScore}/100`);
    core.info('');

    // Set outputs
    core.setOutput('violations-count', violations.length.toString());
    core.setOutput('errors-count', errors.toString());
    core.setOutput('warnings-count', warnings.toString());
    core.setOutput('fitness-score', fitness.overallScore.toString());

    // Generate report
    if (reportFormat) {
      core.info(`📄 Generating ${reportFormat} report...`);
      const reportManager = createReportManager();

      const reportPath = await reportManager.generateReport(violations, {
        format: reportFormat as any,
        outputPath: reportOutput,
      });

      core.info(`Report saved to: ${reportPath}`);
      core.setOutput('report-path', reportPath);

      // Upload report as artifact
      if (process.env.GITHUB_ACTIONS) {
        core.info('📤 Uploading report as artifact...');
        // Note: Artifact upload requires @actions/artifact package
        // We'll just output the path for now
        core.notice(`Report available at: ${reportPath}`);
      }
    }

    // Generate dashboard
    if (generateDashboard) {
      core.info('📊 Generating metrics dashboard...');

      const dashboardData = MetricsDashboard.generateData(classes, violations, {
        projectName: github.context.repo.repo,
        description: 'Architecture Quality Dashboard',
        theme: 'light',
      });

      MetricsDashboard.generateHtml(dashboardData, dashboardOutput);
      core.info(`Dashboard saved to: ${dashboardOutput}`);
    }

    // Comment on PR if requested
    if (commentPR && process.env.GITHUB_TOKEN) {
      const prNumber = github.context.payload.pull_request?.number;

      if (prNumber) {
        core.info('💬 Commenting on pull request...');
        await commentOnPR(prNumber, violations, fitness.overallScore);
      } else {
        core.warning('Not a pull request, skipping PR comment');
      }
    }

    // Determine if action should fail
    const shouldFail =
      failOnViolations && (errors > 0 || (maxViolations > 0 && violations.length > maxViolations));

    if (shouldFail) {
      if (errors > 0) {
        core.setFailed(`❌ Architecture check failed with ${errors} error(s)`);
      } else if (violations.length > maxViolations) {
        core.setFailed(
          `❌ Architecture check failed: ${violations.length} violations exceed maximum of ${maxViolations}`
        );
      }
    } else if (violations.length > 0) {
      core.warning(
        `⚠️  Found ${violations.length} violation(s) (${errors} errors, ${warnings} warnings)`
      );
    } else {
      core.info('✅ No architecture violations found!');
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`❌ Action failed: ${error.message}`);
      if (error.stack) {
        core.debug(error.stack);
      }
    } else {
      core.setFailed('❌ Action failed with unknown error');
    }
  }
}

/**
 * Comment on pull request with results
 */
async function commentOnPR(
  prNumber: number,
  violations: any[],
  fitnessScore: number
): Promise<void> {
  try {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
      core.warning('GITHUB_TOKEN not available, skipping PR comment');
      return;
    }

    const octokit = github.getOctokit(token);
    const { owner, repo } = github.context.repo;

    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;

    // Build comment body
    let body = '## 🏗️ ArchUnitNode Architecture Check\n\n';

    if (violations.length === 0) {
      body += '✅ **No architecture violations found!**\n\n';
      body += `**Fitness Score:** ${fitnessScore}/100 🎉\n`;
    } else {
      body += '### 📊 Results\n\n';
      body += `| Metric | Value |\n`;
      body += `|--------|-------|\n`;
      body += `| **Total Violations** | ${violations.length} |\n`;
      body += `| **Errors** | ${errors} |\n`;
      body += `| **Warnings** | ${warnings} |\n`;
      body += `| **Fitness Score** | ${fitnessScore}/100 |\n\n`;

      if (violations.length > 0 && violations.length <= 10) {
        body += '### 🔍 Violations\n\n';

        for (const violation of violations.slice(0, 10)) {
          const icon = violation.severity === 'error' ? '❌' : '⚠️';
          body += `${icon} **${violation.message}**\n`;
          if (violation.filePath) {
            body += `   - File: \`${violation.filePath}\`\n`;
          }
          if (violation.className) {
            body += `   - Class: \`${violation.className}\`\n`;
          }
          body += '\n';
        }
      } else if (violations.length > 10) {
        body += `### 🔍 Top 10 Violations (of ${violations.length})\n\n`;

        for (const violation of violations.slice(0, 10)) {
          const icon = violation.severity === 'error' ? '❌' : '⚠️';
          body += `${icon} ${violation.message}\n`;
        }

        body += `\n_...and ${violations.length - 10} more violations_\n`;
      }
    }

    body += '\n---\n';
    body += '_Generated by [ArchUnitNode](https://github.com/manjericao/ArchUnitNode)_';

    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: prNumber,
      body,
    });

    core.info('✅ PR comment created successfully');
  } catch (error) {
    core.warning(`Failed to comment on PR: ${error}`);
  }
}

// Run the action
run();
