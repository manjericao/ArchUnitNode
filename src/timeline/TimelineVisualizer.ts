/**
 * Architecture Timeline Visualizer
 *
 * Generates interactive HTML visualizations of architecture evolution
 *
 * @module timeline/TimelineVisualizer
 */

import * as fs from 'fs';
import { TimelineReport, TimelineSnapshot } from './ArchitectureTimeline';

/**
 * Options for timeline visualization
 */
export interface TimelineVisualizationOptions {
  /** Output file path */
  outputPath: string;
  /** Chart title */
  title?: string;
  /** Chart width in pixels */
  width?: number;
  /** Chart height in pixels */
  height?: number;
  /** Include violation details */
  includeViolationDetails?: boolean;
  /** Theme: light or dark */
  theme?: 'light' | 'dark';
}

/**
 * Timeline Visualizer
 *
 * Creates interactive HTML charts showing architecture evolution
 */
export class TimelineVisualizer {
  /**
   * Generate HTML visualization
   */
  static generateHtml(report: TimelineReport, options: TimelineVisualizationOptions): void {
    const title = options.title || 'Architecture Evolution Timeline';
    const width = options.width || 1200;
    // @ts-expect-error - Reserved for future chart rendering
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _height = options.height || 600;
    const theme = options.theme || 'light';
    const includeViolationDetails = options.includeViolationDetails !== false;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns@3.0.0/dist/chartjs-adapter-date-fns.bundle.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: ${theme === 'dark' ? '#1a1a1a' : '#f5f5f5'};
      color: ${theme === 'dark' ? '#e0e0e0' : '#333'};
      padding: 2rem;
    }

    .container {
      max-width: ${width}px;
      margin: 0 auto;
    }

    header {
      text-align: center;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: ${theme === 'dark' ? '#fff' : '#222'};
    }

    .subtitle {
      color: ${theme === 'dark' ? '#999' : '#666'};
      font-size: 1rem;
    }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.1'});
    }

    .card-title {
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: ${theme === 'dark' ? '#999' : '#666'};
      margin-bottom: 0.5rem;
    }

    .card-value {
      font-size: 2rem;
      font-weight: bold;
      color: ${theme === 'dark' ? '#fff' : '#222'};
    }

    .card-trend {
      font-size: 0.875rem;
      margin-top: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .trend-improving {
      color: #10b981;
    }

    .trend-degrading {
      color: #ef4444;
    }

    .trend-stable {
      color: ${theme === 'dark' ? '#999' : '#666'};
    }

    .chart-container {
      background: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.1'});
    }

    .chart-title {
      font-size: 1.25rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: ${theme === 'dark' ? '#fff' : '#222'};
    }

    canvas {
      max-width: 100%;
    }

    .timeline-table {
      background: ${theme === 'dark' ? '#2a2a2a' : '#fff'};
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, ${theme === 'dark' ? '0.3' : '0.1'});
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'};
    }

    th {
      font-weight: 600;
      color: ${theme === 'dark' ? '#fff' : '#222'};
      background: ${theme === 'dark' ? '#1a1a1a' : '#f9f9f9'};
    }

    tr:hover {
      background: ${theme === 'dark' ? '#333' : '#f9f9f9'};
    }

    .commit-hash {
      font-family: monospace;
      font-size: 0.875rem;
      color: ${theme === 'dark' ? '#60a5fa' : '#3b82f6'};
    }

    .metric-positive {
      color: #10b981;
    }

    .metric-negative {
      color: #ef4444;
    }

    .footer {
      text-align: center;
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid ${theme === 'dark' ? '#333' : '#e5e5e5'};
      color: ${theme === 'dark' ? '#999' : '#666'};
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>${this.escapeHtml(title)}</h1>
      <div class="subtitle">
        Generated on ${new Date().toLocaleString()} |
        ${report.snapshots.length} commits analyzed |
        ${report.summary.dateRange.start.toLocaleDateString()} - ${report.summary.dateRange.end.toLocaleDateString()}
      </div>
    </header>

    <div class="summary-cards">
      <div class="card">
        <div class="card-title">Total Commits</div>
        <div class="card-value">${report.summary.totalCommits}</div>
      </div>

      <div class="card">
        <div class="card-title">Avg Violations</div>
        <div class="card-value">${report.summary.averageViolations.toFixed(1)}</div>
        <div class="card-trend trend-${report.summary.violationTrend}">
          ${this.getTrendIcon(report.summary.violationTrend)}
          ${this.getTrendText(report.summary.violationTrend)}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Avg Fitness Score</div>
        <div class="card-value">${report.summary.averageFitnessScore.toFixed(1)}</div>
        <div class="card-trend trend-${report.summary.metricsTrend}">
          ${this.getTrendIcon(report.summary.metricsTrend)}
          ${this.getTrendText(report.summary.metricsTrend)}
        </div>
      </div>

      <div class="card">
        <div class="card-title">Current Status</div>
        <div class="card-value">${report.snapshots[report.snapshots.length - 1].violationCount}</div>
        <div class="card-trend">violations</div>
      </div>
    </div>

    <div class="chart-container">
      <div class="chart-title">Violations Over Time</div>
      <canvas id="violationsChart"></canvas>
    </div>

    <div class="chart-container">
      <div class="chart-title">Architecture Fitness Score Over Time</div>
      <canvas id="fitnessChart"></canvas>
    </div>

    <div class="chart-container">
      <div class="chart-title">Technical Debt Over Time</div>
      <canvas id="debtChart"></canvas>
    </div>

    <div class="chart-container">
      <div class="chart-title">Complexity Metrics Over Time</div>
      <canvas id="complexityChart"></canvas>
    </div>

    ${includeViolationDetails ? this.generateTimelineTable(report.snapshots, theme) : ''}

    <div class="footer">
      Generated by ArchUnitNode Timeline Analyzer
    </div>
  </div>

  <script>
    const snapshots = ${JSON.stringify(report.snapshots)};
    const isDark = ${theme === 'dark'};

    const chartColors = {
      violations: isDark ? '#ef4444' : '#dc2626',
      fitness: isDark ? '#10b981' : '#059669',
      debt: isDark ? '#f59e0b' : '#d97706',
      complexity: isDark ? '#6366f1' : '#4f46e5',
      grid: isDark ? '#333' : '#e5e5e5',
      text: isDark ? '#e0e0e0' : '#666',
    };

    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2.5,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: chartColors.text,
            usePointStyle: true,
            padding: 15,
          },
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(42, 42, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)',
          titleColor: chartColors.text,
          bodyColor: chartColors.text,
          borderColor: chartColors.grid,
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            title: function(context) {
              const snapshot = snapshots[context[0].dataIndex];
              return snapshot.commit.substring(0, 7) + ' - ' + snapshot.message;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d',
            },
          },
          grid: {
            color: chartColors.grid,
          },
          ticks: {
            color: chartColors.text,
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: chartColors.grid,
          },
          ticks: {
            color: chartColors.text,
          },
        },
      },
    };

    // Violations Chart
    new Chart(document.getElementById('violationsChart'), {
      type: 'line',
      data: {
        labels: snapshots.map(s => new Date(s.date)),
        datasets: [
          {
            label: 'Total Violations',
            data: snapshots.map(s => s.violationCount),
            borderColor: chartColors.violations,
            backgroundColor: chartColors.violations + '20',
            fill: true,
            tension: 0.4,
          },
          {
            label: 'Errors',
            data: snapshots.map(s => s.violations.errors),
            borderColor: '#dc2626',
            backgroundColor: '#dc262620',
            fill: false,
            borderDash: [5, 5],
          },
          {
            label: 'Warnings',
            data: snapshots.map(s => s.violations.warnings),
            borderColor: '#f59e0b',
            backgroundColor: '#f59e0b20',
            fill: false,
            borderDash: [5, 5],
          },
        ],
      },
      options: commonOptions,
    });

    // Fitness Score Chart
    new Chart(document.getElementById('fitnessChart'), {
      type: 'line',
      data: {
        labels: snapshots.map(s => new Date(s.date)),
        datasets: [{
          label: 'Fitness Score',
          data: snapshots.map(s => s.metrics.fitnessScore),
          borderColor: chartColors.fitness,
          backgroundColor: chartColors.fitness + '20',
          fill: true,
          tension: 0.4,
        }],
      },
      options: {
        ...commonOptions,
        scales: {
          ...commonOptions.scales,
          y: {
            ...commonOptions.scales.y,
            max: 100,
          },
        },
      },
    });

    // Technical Debt Chart
    new Chart(document.getElementById('debtChart'), {
      type: 'bar',
      data: {
        labels: snapshots.map(s => new Date(s.date)),
        datasets: [{
          label: 'Technical Debt (hours)',
          data: snapshots.map(s => s.metrics.technicalDebt.totalHours),
          backgroundColor: chartColors.debt + '80',
          borderColor: chartColors.debt,
          borderWidth: 1,
        }],
      },
      options: commonOptions,
    });

    // Complexity Chart
    new Chart(document.getElementById('complexityChart'), {
      type: 'line',
      data: {
        labels: snapshots.map(s => new Date(s.date)),
        datasets: [
          {
            label: 'Avg Complexity',
            data: snapshots.map(s => s.metrics.averageComplexity),
            borderColor: chartColors.complexity,
            backgroundColor: chartColors.complexity + '20',
            fill: false,
            yAxisID: 'y',
          },
          {
            label: 'Cyclic Dependencies',
            data: snapshots.map(s => s.metrics.cyclicDependencies),
            borderColor: chartColors.violations,
            backgroundColor: chartColors.violations + '20',
            fill: false,
            yAxisID: 'y1',
          },
        ],
      },
      options: {
        ...commonOptions,
        scales: {
          x: commonOptions.scales.x,
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            grid: {
              color: chartColors.grid,
            },
            ticks: {
              color: chartColors.text,
            },
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            grid: {
              drawOnChartArea: false,
            },
            ticks: {
              color: chartColors.text,
            },
          },
        },
      },
    });
  </script>
</body>
</html>`;

    fs.writeFileSync(options.outputPath, html, 'utf-8');
  }

  /**
   * Generate timeline table HTML
   */
  private static generateTimelineTable(snapshots: TimelineSnapshot[], _theme: string): string {
    const rows = snapshots
      .map(
        (snapshot) => `
      <tr>
        <td><span class="commit-hash">${this.escapeHtml(snapshot.commit.substring(0, 7))}</span></td>
        <td>${new Date(snapshot.date).toLocaleDateString()}</td>
        <td>${this.escapeHtml(snapshot.message.substring(0, 50))}${snapshot.message.length > 50 ? '...' : ''}</td>
        <td>${this.escapeHtml(snapshot.author)}</td>
        <td class="${snapshot.violationCount > 0 ? 'metric-negative' : 'metric-positive'}">${snapshot.violationCount}</td>
        <td>${snapshot.violations.errors}</td>
        <td>${snapshot.violations.warnings}</td>
        <td class="${snapshot.metrics.fitnessScore >= 70 ? 'metric-positive' : 'metric-negative'}">${snapshot.metrics.fitnessScore.toFixed(1)}</td>
        <td>${snapshot.metrics.totalClasses}</td>
        <td>${snapshot.metrics.technicalDebt.totalHours.toFixed(1)}h</td>
      </tr>
    `
      )
      .join('');

    return `
      <div class="timeline-table">
        <div class="chart-title">Detailed Timeline</div>
        <table>
          <thead>
            <tr>
              <th>Commit</th>
              <th>Date</th>
              <th>Message</th>
              <th>Author</th>
              <th>Violations</th>
              <th>Errors</th>
              <th>Warnings</th>
              <th>Fitness</th>
              <th>Classes</th>
              <th>Debt</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Get trend icon
   */
  private static getTrendIcon(trend: string): string {
    switch (trend) {
      case 'improving':
        return '↑';
      case 'degrading':
        return '↓';
      default:
        return '→';
    }
  }

  /**
   * Get trend text
   */
  private static getTrendText(trend: string): string {
    switch (trend) {
      case 'improving':
        return 'Improving';
      case 'degrading':
        return 'Degrading';
      default:
        return 'Stable';
    }
  }

  /**
   * Escape HTML special characters
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
   * Generate JSON report
   */
  static generateJson(report: TimelineReport, outputPath: string): void {
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf-8');
  }

  /**
   * Generate Markdown report
   */
  static generateMarkdown(report: TimelineReport, outputPath: string): void {
    const md = `# Architecture Evolution Timeline

**Generated:** ${report.generatedAt.toLocaleString()}
**Period:** ${report.summary.dateRange.start.toLocaleDateString()} - ${report.summary.dateRange.end.toLocaleDateString()}
**Commits Analyzed:** ${report.summary.totalCommits}

## Summary

| Metric | Value | Trend |
|--------|-------|-------|
| Average Violations | ${report.summary.averageViolations.toFixed(1)} | ${report.summary.violationTrend} ${this.getTrendIcon(report.summary.violationTrend)} |
| Average Fitness Score | ${report.summary.averageFitnessScore.toFixed(1)} | ${report.summary.metricsTrend} ${this.getTrendIcon(report.summary.metricsTrend)} |

## Timeline

| Commit | Date | Message | Violations | Fitness | Technical Debt |
|--------|------|---------|------------|---------|----------------|
${report.snapshots.map((s) => `| \`${s.commit.substring(0, 7)}\` | ${new Date(s.date).toLocaleDateString()} | ${s.message.substring(0, 40)} | ${s.violationCount} (${s.violations.errors}E/${s.violations.warnings}W) | ${s.metrics.fitnessScore.toFixed(1)} | ${s.metrics.technicalDebt.totalHours.toFixed(1)}h |`).join('\n')}

## Trends

### Violations Trend: ${report.summary.violationTrend} ${this.getTrendIcon(report.summary.violationTrend)}

The number of architecture violations is **${report.summary.violationTrend}** over the analyzed period.

### Metrics Trend: ${report.summary.metricsTrend} ${this.getTrendIcon(report.summary.metricsTrend)}

The overall architecture fitness score is **${report.summary.metricsTrend}** over the analyzed period.

---

*Generated by ArchUnitNode Timeline Analyzer*
`;

    fs.writeFileSync(outputPath, md, 'utf-8');
  }
}
