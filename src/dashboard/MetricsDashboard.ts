/**
 * Metrics Dashboard
 *
 * Interactive HTML dashboard for architecture metrics and scoring
 *
 * @module dashboard/MetricsDashboard
 */

import * as fs from 'fs';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation } from '../types';
import {
  ArchitecturalMetricsAnalyzer,
  CouplingMetrics,
  CohesionMetrics,
  ComplexityMetrics,
  TechnicalDebt,
  ArchitectureFitness,
} from '../metrics/ArchitecturalMetrics';
import { ViolationAnalyzer } from '../analysis/ViolationAnalyzer';

/**
 * Dashboard configuration
 */
export interface DashboardConfig {
  /** Project name */
  projectName: string;
  /** Description */
  description?: string;
  /** Theme: light or dark */
  theme?: 'light' | 'dark';
  /** Include detailed violation breakdown */
  includeViolationBreakdown?: boolean;
  /** Include historical data */
  historicalData?: HistoricalMetrics[];
}

/**
 * Historical metrics for trend analysis
 */
export interface HistoricalMetrics {
  /** Timestamp */
  timestamp: Date;
  /** Metrics snapshot */
  fitnessScore: number;
  violationCount: number;
  technicalDebt: number;
  complexity: number;
}

/**
 * Dashboard data model
 */
export interface DashboardData {
  /** Configuration */
  config: DashboardConfig;
  /** Current metrics */
  metrics: {
    coupling: Map<string, CouplingMetrics>;
    cohesion: CohesionMetrics;
    complexity: ComplexityMetrics;
    debt: TechnicalDebt;
    fitness: ArchitectureFitness;
  };
  /** Violations */
  violations: {
    total: number;
    errors: number;
    warnings: number;
    byRule: Array<{ ruleName: string; count: number; severity: string }>;
    byFile: Array<{ filePath: string; count: number }>;
    topViolations: ArchitectureViolation[];
  };
  /** Classes analyzed */
  classesAnalyzed: number;
  /** Generated timestamp */
  generatedAt: Date;
}

/**
 * Metrics Dashboard Generator
 */
export class MetricsDashboard {
  /**
   * Generate dashboard data
   */
  static generateData(
    classes: TSClasses,
    violations: ArchitectureViolation[],
    config: DashboardConfig
  ): DashboardData {
    const metricsCalculator = new ArchitecturalMetricsAnalyzer(classes);

    // Calculate all metrics
    const metricsResult = metricsCalculator.calculateMetrics();
    const coupling = metricsResult.coupling;
    const cohesion = metricsResult.cohesion;
    const complexity = metricsResult.complexity;
    const debt = metricsResult.technicalDebt;
    const fitness = metricsResult.fitness;

    // Analyze violations
    const analyzer = new ViolationAnalyzer(violations);
    const _analysis = analyzer.analyze(); // Reserved for detailed violation analysis
    const _grouped = analyzer.groupByRootCause(); // Reserved for root cause grouping
    void _analysis; // Mark as intentionally unused for now
    void _grouped; // Mark as intentionally unused for now

    // Group violations by rule
    const violationsByRule = new Map<string, { count: number; severity: string }>();
    for (const violation of violations) {
      const key = violation.message;
      if (!violationsByRule.has(key)) {
        violationsByRule.set(key, { count: 0, severity: violation.severity || 'error' });
      }
      violationsByRule.get(key)!.count++;
    }

    const byRule = Array.from(violationsByRule.entries())
      .map(([ruleName, { count, severity }]) => ({ ruleName, count, severity }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Group violations by file
    const violationsByFile = new Map<string, number>();
    for (const violation of violations) {
      const file = violation.filePath || 'unknown';
      violationsByFile.set(file, (violationsByFile.get(file) || 0) + 1);
    }

    const byFile = Array.from(violationsByFile.entries())
      .map(([filePath, count]) => ({ filePath, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      config,
      metrics: {
        coupling,
        cohesion,
        complexity,
        debt,
        fitness,
      },
      violations: {
        total: violations.length,
        errors: violations.filter((v) => v.severity === 'error').length,
        warnings: violations.filter((v) => v.severity === 'warning').length,
        byRule,
        byFile,
        topViolations: violations.slice(0, 20),
      },
      classesAnalyzed: classes.size(),
      generatedAt: new Date(),
    };
  }

  /**
   * Generate interactive HTML dashboard
   */
  static generateHtml(data: DashboardData, outputPath: string): void {
    const theme = data.config.theme || 'light';
    const projectName = data.config.projectName;
    const description = data.config.description || 'Architecture Quality Dashboard';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(projectName)} - Architecture Dashboard</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: ${theme === 'dark' ? '#0d1117' : '#f6f8fa'};
      color: ${theme === 'dark' ? '#c9d1d9' : '#24292f'};
      line-height: 1.6;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    header {
      text-align: center;
      padding: 2rem 0;
      border-bottom: 2px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
      font-size: 1.125rem;
    }

    .timestamp {
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
      margin-top: 0.5rem;
    }

    .score-section {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .fitness-card {
      background: ${theme === 'dark' ? '#161b22' : '#ffffff'};
      border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 12px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.05'});
    }

    .fitness-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'};
    }

    .score-display {
      text-align: center;
      padding: 2rem;
    }

    .score-value {
      font-size: 5rem;
      font-weight: 700;
      line-height: 1;
      margin-bottom: 0.5rem;
    }

    .score-label {
      font-size: 1.125rem;
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .score-grade {
      display: inline-block;
      padding: 0.5rem 1.5rem;
      border-radius: 24px;
      font-size: 1.5rem;
      font-weight: 700;
      margin-top: 1rem;
    }

    .grade-a { background: #10b981; color: white; }
    .grade-b { background: #3b82f6; color: white; }
    .grade-c { background: #f59e0b; color: white; }
    .grade-d { background: #ef4444; color: white; }
    .grade-f { background: #991b1b; color: white; }

    .score-breakdown {
      margin-top: 2rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
    }

    .breakdown-label {
      font-weight: 500;
    }

    .breakdown-score {
      font-weight: 700;
      font-size: 1.125rem;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .metric-card {
      background: ${theme === 'dark' ? '#161b22' : '#ffffff'};
      border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.2' : '0.04'});
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .metric-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.08'});
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .icon-violations { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); }
    .icon-debt { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .icon-complexity { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); }
    .icon-coupling { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
    .icon-cohesion { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .icon-classes { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }

    .metric-title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
      margin-bottom: 0.5rem;
    }

    .metric-value {
      font-size: 2rem;
      font-weight: 700;
      color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'};
      margin-bottom: 0.25rem;
    }

    .metric-detail {
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
    }

    .section {
      background: ${theme === 'dark' ? '#161b22' : '#ffffff'};
      border: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      border-radius: 8px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.2' : '0.04'});
    }

    .section-title {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'};
    }

    .chart-container {
      position: relative;
      height: 300px;
      margin-bottom: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
    }

    th {
      font-weight: 600;
      color: ${theme === 'dark' ? '#f0f6fc' : '#24292f'};
      background: ${theme === 'dark' ? '#0d1117' : '#f6f8fa'};
    }

    tr:hover {
      background: ${theme === 'dark' ? '#1c2128' : '#f6f8fa'};
    }

    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .badge-error {
      background: #fecaca;
      color: #991b1b;
    }

    .badge-warning {
      background: #fef3c7;
      color: #92400e;
    }

    ${
      theme === 'dark'
        ? `
      .badge-error { background: #7f1d1d; color: #fecaca; }
      .badge-warning { background: #78350f; color: #fef3c7; }
    `
        : ''
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      border-radius: 4px;
      overflow: hidden;
      margin-top: 0.5rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .footer {
      text-align: center;
      padding: 2rem 0;
      margin-top: 3rem;
      border-top: 2px solid ${theme === 'dark' ? '#30363d' : '#d0d7de'};
      color: ${theme === 'dark' ? '#8b949e' : '#57606a'};
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .score-section {
        grid-template-columns: 1fr;
      }

      .metrics-grid {
        grid-template-columns: 1fr;
      }

      h1 {
        font-size: 2rem;
      }

      .score-value {
        font-size: 3.5rem;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${this.escapeHtml(projectName)}</h1>
      <div class="subtitle">${this.escapeHtml(description)}</div>
      <div class="timestamp">Generated on ${data.generatedAt.toLocaleString()}</div>
    </header>

    ${this.generateScoreSection(data)}
    ${this.generateMetricsGrid(data)}
    ${this.generateChartsSection(data, theme)}
    ${this.generateViolationsSection(data)}
    ${this.generateHistoricalSection(data, theme)}

    <div class="footer">
      Generated by ArchUnitNode Metrics Dashboard | ${data.classesAnalyzed} classes analyzed
    </div>
  </div>

  ${this.generateChartScripts(data, theme)}
</body>
</html>`;

    fs.writeFileSync(outputPath, html, 'utf-8');
  }

  /**
   * Generate score section HTML
   */
  private static generateScoreSection(data: DashboardData): string {
    const score = data.metrics.fitness.overallScore;
    const grade = this.getGrade(score);
    const gradeClass = `grade-${grade.toLowerCase()}`;

    return `
    <div class="score-section">
      <div class="fitness-card">
        <div class="fitness-title">Architecture Fitness Score</div>
        <div class="score-display">
          <div class="score-value" style="color: ${this.getScoreColor(score)};">${score}</div>
          <div class="score-label">out of 100</div>
          <div class="score-grade ${gradeClass}">${grade}</div>
        </div>
        <div class="score-breakdown">
          <div class="breakdown-item">
            <span class="breakdown-label">Layering Score</span>
            <span class="breakdown-score">${data.metrics.fitness.layeringScore}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Naming Score</span>
            <span class="breakdown-score">${data.metrics.fitness.namingScore}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Dependency Score</span>
            <span class="breakdown-score">${data.metrics.fitness.dependencyScore}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Maintainability Score</span>
            <span class="breakdown-score">${data.metrics.fitness.maintainabilityIndex}</span>
          </div>
        </div>
      </div>

      <div class="fitness-card">
        <div class="fitness-title">Quick Stats</div>
        <div style="padding: 1rem 0;">
          <div class="breakdown-item">
            <span class="breakdown-label">Classes</span>
            <span class="breakdown-score">${data.classesAnalyzed}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Total Violations</span>
            <span class="breakdown-score" style="color: ${data.violations.total > 0 ? '#ef4444' : '#10b981'};">${data.violations.total}</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Technical Debt</span>
            <span class="breakdown-score">${data.metrics.debt.estimatedHoursToFix.toFixed(1)}h</span>
          </div>
          <div class="breakdown-item">
            <span class="breakdown-label">Avg Complexity</span>
            <span class="breakdown-score">${data.metrics.complexity.averageDependencies.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Generate metrics grid HTML
   */
  private static generateMetricsGrid(data: DashboardData): string {
    return `
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-icon icon-violations">⚠️</div>
        <div class="metric-title">Violations</div>
        <div class="metric-value">${data.violations.total}</div>
        <div class="metric-detail">${data.violations.errors} errors, ${data.violations.warnings} warnings</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-debt">💰</div>
        <div class="metric-title">Technical Debt</div>
        <div class="metric-value">${data.metrics.debt.estimatedHoursToFix.toFixed(1)}h</div>
        <div class="metric-detail">Score: ${data.metrics.debt.totalDebtScore.toFixed(1)}/100</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-complexity">🔀</div>
        <div class="metric-title">Complexity</div>
        <div class="metric-value">${data.metrics.complexity.averageDependencies.toFixed(1)}</div>
        <div class="metric-detail">${data.metrics.complexity.circularDependencies} circular dependencies</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-coupling">🔗</div>
        <div class="metric-title">Coupling</div>
        <div class="metric-value">${Array.from(data.metrics.coupling.values()).length}</div>
        <div class="metric-detail">Packages analyzed</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-cohesion">🎯</div>
        <div class="metric-title">Cohesion</div>
        <div class="metric-value">${data.metrics.cohesion.lcom.toFixed(2)}</div>
        <div class="metric-detail">LCOM Score</div>
      </div>

      <div class="metric-card">
        <div class="metric-icon icon-classes">📦</div>
        <div class="metric-title">Classes</div>
        <div class="metric-value">${data.classesAnalyzed}</div>
        <div class="metric-detail">${data.metrics.complexity.maxDependencies} max dependencies</div>
      </div>
    </div>`;
  }

  /**
   * Generate charts section HTML
   */
  private static generateChartsSection(_data: DashboardData, _theme: string): string {
    return `
    <div class="section">
      <div class="section-title">Metrics Visualization</div>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem;">
        <div>
          <h3 style="margin-bottom: 1rem;">Fitness Score Breakdown</h3>
          <div class="chart-container">
            <canvas id="fitnessChart"></canvas>
          </div>
        </div>
        <div>
          <h3 style="margin-bottom: 1rem;">Violation Distribution</h3>
          <div class="chart-container">
            <canvas id="violationChart"></canvas>
          </div>
        </div>
      </div>
    </div>`;
  }

  /**
   * Generate violations section HTML
   */
  private static generateViolationsSection(data: DashboardData): string {
    if (data.violations.total === 0) {
      return `
      <div class="section">
        <div class="section-title">Violations</div>
        <div style="text-align: center; padding: 2rem; color: #10b981;">
          <div style="font-size: 3rem;">✅</div>
          <div style="font-size: 1.25rem; margin-top: 1rem;">No violations found!</div>
          <div style="margin-top: 0.5rem; opacity: 0.8;">Your architecture is in excellent shape.</div>
        </div>
      </div>`;
    }

    const topRulesHtml = data.violations.byRule
      .map(
        (rule) => `
      <tr>
        <td>${this.escapeHtml(rule.ruleName)}</td>
        <td><span class="badge badge-${rule.severity}">${rule.severity}</span></td>
        <td>${rule.count}</td>
      </tr>
    `
      )
      .join('');

    const topFilesHtml = data.violations.byFile
      .map(
        (file) => `
      <tr>
        <td style="font-family: monospace; font-size: 0.875rem;">${this.escapeHtml(file.filePath)}</td>
        <td>${file.count}</td>
      </tr>
    `
      )
      .join('');

    return `
    <div class="section">
      <div class="section-title">Top Violations by Rule</div>
      <table>
        <thead>
          <tr>
            <th>Rule</th>
            <th>Severity</th>
            <th>Count</th>
          </tr>
        </thead>
        <tbody>
          ${topRulesHtml}
        </tbody>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Top Violating Files</div>
      <table>
        <thead>
          <tr>
            <th>File Path</th>
            <th>Violations</th>
          </tr>
        </thead>
        <tbody>
          ${topFilesHtml}
        </tbody>
      </table>
    </div>`;
  }

  /**
   * Generate historical section HTML
   */
  private static generateHistoricalSection(data: DashboardData, _theme: string): string {
    if (!data.config.historicalData || data.config.historicalData.length === 0) {
      return '';
    }

    return `
    <div class="section">
      <div class="section-title">Trend Analysis</div>
      <div class="chart-container" style="height: 400px;">
        <canvas id="trendChart"></canvas>
      </div>
    </div>`;
  }

  /**
   * Generate chart scripts
   */
  private static generateChartScripts(data: DashboardData, theme: string): string {
    const isDark = theme === 'dark';
    const textColor = isDark ? '#8b949e' : '#57606a';
    const gridColor = isDark ? '#30363d' : '#d0d7de';

    return `
  <script>
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: '${textColor}',
            font: { size: 12 },
          },
        },
      },
      scales: {
        y: {
          grid: { color: '${gridColor}' },
          ticks: { color: '${textColor}' },
        },
        x: {
          grid: { color: '${gridColor}' },
          ticks: { color: '${textColor}' },
        },
      },
    };

    // Fitness Score Breakdown
    new Chart(document.getElementById('fitnessChart'), {
      type: 'radar',
      data: {
        labels: ['Layering', 'Naming', 'Dependencies', 'Maintainability'],
        datasets: [{
          label: 'Current Score',
          data: [
            ${data.metrics.fitness.layeringScore},
            ${data.metrics.fitness.namingScore},
            ${data.metrics.fitness.dependencyScore},
            ${data.metrics.fitness.maintainabilityIndex}
          ],
          fill: true,
          backgroundColor: 'rgba(102, 126, 234, 0.2)',
          borderColor: 'rgb(102, 126, 234)',
          pointBackgroundColor: 'rgb(102, 126, 234)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(102, 126, 234)',
        }],
      },
      options: {
        ...chartOptions,
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { color: '${textColor}' },
            grid: { color: '${gridColor}' },
            pointLabels: { color: '${textColor}' },
          },
        },
      },
    });

    // Violation Distribution
    new Chart(document.getElementById('violationChart'), {
      type: 'doughnut',
      data: {
        labels: ['Errors', 'Warnings'],
        datasets: [{
          data: [${data.violations.errors}, ${data.violations.warnings}],
          backgroundColor: ['#ef4444', '#f59e0b'],
          borderColor: '${isDark ? '#161b22' : '#ffffff'}',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: '${textColor}',
              padding: 20,
            },
          },
        },
      },
    });

    ${
      data.config.historicalData && data.config.historicalData.length > 0
        ? `
    // Trend Chart
    new Chart(document.getElementById('trendChart'), {
      type: 'line',
      data: {
        labels: ${JSON.stringify(data.config.historicalData.map((h) => new Date(h.timestamp).toLocaleDateString()))},
        datasets: [
          {
            label: 'Fitness Score',
            data: ${JSON.stringify(data.config.historicalData.map((h) => h.fitnessScore))},
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y',
          },
          {
            label: 'Violations',
            data: ${JSON.stringify(data.config.historicalData.map((h) => h.violationCount))},
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '${textColor}',
              usePointStyle: true,
            },
          },
        },
        scales: {
          x: {
            grid: { color: '${gridColor}' },
            ticks: { color: '${textColor}' },
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            grid: { color: '${gridColor}' },
            ticks: { color: '${textColor}' },
            title: {
              display: true,
              text: 'Fitness Score',
              color: '${textColor}',
            },
          },
          y1: {
            type: 'linear',
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { color: '${textColor}' },
            title: {
              display: true,
              text: 'Violations',
              color: '${textColor}',
            },
          },
        },
      },
    });
    `
        : ''
    }
  </script>`;
  }

  /**
   * Get grade from score
   */
  private static getGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  /**
   * Get color for score
   */
  private static getScoreColor(score: number): string {
    if (score >= 90) return '#10b981';
    if (score >= 80) return '#3b82f6';
    if (score >= 70) return '#f59e0b';
    if (score >= 60) return '#ef4444';
    return '#991b1b';
  }

  /**
   * Escape HTML
   */
  private static escapeHtml(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Save historical data to file
   */
  static saveHistoricalData(data: DashboardData, historyFilePath: string): void {
    let history: HistoricalMetrics[] = [];

    // Load existing history
    if (fs.existsSync(historyFilePath)) {
      const content = fs.readFileSync(historyFilePath, 'utf-8');
      history = JSON.parse(content);
    }

    // Add current snapshot
    history.push({
      timestamp: data.generatedAt,
      fitnessScore: data.metrics.fitness.overallScore,
      violationCount: data.violations.total,
      technicalDebt: data.metrics.debt.estimatedHoursToFix,
      complexity: data.metrics.complexity.averageDependencies,
    });

    // Keep only last 30 entries
    if (history.length > 30) {
      history = history.slice(-30);
    }

    fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2), 'utf-8');
  }

  /**
   * Load historical data from file
   */
  static loadHistoricalData(historyFilePath: string): HistoricalMetrics[] {
    if (!fs.existsSync(historyFilePath)) {
      return [];
    }

    const content = fs.readFileSync(historyFilePath, 'utf-8');
    return JSON.parse(content);
  }
}
