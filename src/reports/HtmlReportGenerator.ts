import { ReportGenerator, ReportData, ReportOptions, ReportMetadata } from './types';
import { ArchitectureViolation } from '../types';

/**
 * Generates HTML reports with styling and charts
 */
export class HtmlReportGenerator implements ReportGenerator {
  public generate(data: ReportData, options: ReportOptions): string {
    const { metadata, violations } = data;
    const title = options.title || 'ArchUnit Architecture Report';

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>
        ${this.getStyles()}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>${this.escapeHtml(title)}</h1>
            ${options.includeTimestamp ? `<p class="timestamp">Generated: ${metadata.timestamp}</p>` : ''}
        </header>

        ${options.includeStats ? this.generateStats(metadata) : ''}

        <div class="summary ${violations.length === 0 ? 'success' : 'failure'}">
            <h2>Summary</h2>
            <p class="result-badge">
                ${violations.length === 0 ? '✓ All checks passed' : `✗ ${violations.length} violation(s) found`}
            </p>
        </div>

        ${violations.length > 0 ? this.generateViolations(violations) : this.generateSuccess()}
    </div>
</body>
</html>`;
  }

  public getFileExtension(): string {
    return '.html';
  }

  private generateStats(metadata: ReportMetadata): string {
    return `
        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${metadata.totalViolations}</div>
                <div class="stat-label">Violations</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metadata.totalFiles}</div>
                <div class="stat-label">Files Checked</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${metadata.rulesChecked}</div>
                <div class="stat-label">Rules Checked</div>
            </div>
            ${
              metadata.rulesPassed !== undefined
                ? `
            <div class="stat-card success-card">
                <div class="stat-value">${metadata.rulesPassed}</div>
                <div class="stat-label">Rules Passed</div>
            </div>
            `
                : ''
            }
            ${
              metadata.rulesFailed !== undefined
                ? `
            <div class="stat-card failure-card">
                <div class="stat-value">${metadata.rulesFailed}</div>
                <div class="stat-label">Rules Failed</div>
            </div>
            `
                : ''
            }
        </div>`;
  }

  private generateViolations(violations: ArchitectureViolation[]): string {
    const violationsByFile = this.groupByFile(violations);

    let html = '<div class="violations">';
    html += '<h2>Violations</h2>';

    for (const [file, fileViolations] of violationsByFile.entries()) {
      html += `<div class="violation-file">`;
      html += `<h3 class="file-name">${this.escapeHtml(file)}</h3>`;

      for (let i = 0; i < fileViolations.length; i++) {
        const violation = fileViolations[i];
        html += `<div class="violation">`;
        html += `<div class="violation-header">`;
        html += `<span class="violation-number">#${i + 1}</span>`;
        html += `<span class="violation-rule">${this.escapeHtml(violation.rule)}</span>`;
        html += `</div>`;
        html += `<div class="violation-message">${this.escapeHtml(violation.message)}</div>`;
        if (violation.location) {
          html += `<div class="violation-location">Line ${violation.location.line}, Column ${violation.location.column}</div>`;
        }
        html += `</div>`;
      }

      html += `</div>`;
    }

    html += '</div>';
    return html;
  }

  private generateSuccess(): string {
    return `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>All Architecture Rules Passed!</h2>
            <p>Your codebase complies with all defined architecture rules.</p>
        </div>`;
  }

  private groupByFile(violations: ArchitectureViolation[]): Map<string, ArchitectureViolation[]> {
    const grouped = new Map<string, ArchitectureViolation[]>();

    for (const violation of violations) {
      const file = violation.filePath;
      if (!grouped.has(file)) {
        grouped.set(file, []);
      }
      grouped.get(file)!.push(violation);
    }

    return grouped;
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  private getStyles(): string {
    return `
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        header {
            border-bottom: 3px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }

        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }

        .timestamp {
            color: #7f8c8d;
            font-size: 0.9em;
        }

        .stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }

        .stat-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            color: white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .stat-card.success-card {
            background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
        }

        .stat-card.failure-card {
            background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
        }

        .stat-value {
            font-size: 2.5em;
            font-weight: bold;
            margin-bottom: 5px;
        }

        .stat-label {
            font-size: 0.9em;
            opacity: 0.9;
        }

        .summary {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .summary.success {
            background: #e8f5e9;
            border-left: 4px solid #4CAF50;
        }

        .summary.failure {
            background: #ffebee;
            border-left: 4px solid #f44336;
        }

        .summary h2 {
            margin-bottom: 10px;
            color: #2c3e50;
        }

        .result-badge {
            font-size: 1.2em;
            font-weight: 600;
        }

        .success-message {
            text-align: center;
            padding: 60px 20px;
        }

        .success-icon {
            font-size: 5em;
            color: #4CAF50;
            margin-bottom: 20px;
        }

        .success-message h2 {
            color: #4CAF50;
            margin-bottom: 10px;
        }

        .success-message p {
            color: #7f8c8d;
            font-size: 1.1em;
        }

        .violations {
            margin-top: 30px;
        }

        .violations h2 {
            color: #2c3e50;
            margin-bottom: 20px;
        }

        .violation-file {
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }

        .file-name {
            background: #f8f9fa;
            padding: 15px 20px;
            color: #2c3e50;
            font-size: 1.1em;
            border-bottom: 1px solid #e0e0e0;
        }

        .violation {
            padding: 20px;
            border-bottom: 1px solid #f0f0f0;
        }

        .violation:last-child {
            border-bottom: none;
        }

        .violation-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .violation-number {
            background: #f44336;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.9em;
            font-weight: bold;
            margin-right: 15px;
        }

        .violation-rule {
            color: #7f8c8d;
            font-size: 0.9em;
            font-family: 'Courier New', monospace;
        }

        .violation-message {
            color: #2c3e50;
            font-size: 1.05em;
            margin-bottom: 8px;
            padding-left: 15px;
        }

        .violation-location {
            color: #7f8c8d;
            font-size: 0.85em;
            font-family: 'Courier New', monospace;
            padding-left: 15px;
        }

        @media (max-width: 768px) {
            .container {
                padding: 20px;
            }

            h1 {
                font-size: 2em;
            }

            .stats {
                grid-template-columns: 1fr 1fr;
            }
        }
    `;
  }
}
