import { ReportGenerator, ReportData, ReportOptions } from './types';
import { ArchitectureViolation } from '../types';

/**
 * Generates Markdown reports for documentation and PRs
 */
export class MarkdownReportGenerator implements ReportGenerator {
  public generate(data: ReportData, options: ReportOptions): string {
    const { metadata, violations } = data;
    const title = options.title || 'ArchUnit Architecture Report';

    let md = `# ${title}\n\n`;

    if (options.includeTimestamp) {
      md += `**Generated:** ${metadata.timestamp}\n\n`;
    }

    md += `---\n\n`;

    // Summary section
    if (violations.length === 0) {
      md += `## ✅ Summary\n\n`;
      md += `**All architecture rules passed!**\n\n`;
    } else {
      md += `## ❌ Summary\n\n`;
      md += `**${violations.length} violation(s) found**\n\n`;
    }

    // Stats section
    if (options.includeStats) {
      md += `## 📊 Statistics\n\n`;
      md += `| Metric | Value |\n`;
      md += `|--------|-------|\n`;
      md += `| Total Violations | ${metadata.totalViolations} |\n`;
      md += `| Files Checked | ${metadata.totalFiles} |\n`;
      md += `| Rules Checked | ${metadata.rulesChecked} |\n`;
      if (metadata.rulesPassed !== undefined) {
        md += `| Rules Passed | ${metadata.rulesPassed} |\n`;
      }
      if (metadata.rulesFailed !== undefined) {
        md += `| Rules Failed | ${metadata.rulesFailed} |\n`;
      }
      if (metadata.executionTime !== undefined) {
        md += `| Execution Time | ${(metadata.executionTime / 1000).toFixed(2)}s |\n`;
      }
      md += `\n`;
    }

    // Violations section
    if (violations.length > 0) {
      md += `## 🚨 Violations\n\n`;

      const violationsByFile = this.groupByFile(violations);

      for (const [file, fileViolations] of violationsByFile.entries()) {
        md += `### ${file}\n\n`;

        for (let i = 0; i < fileViolations.length; i++) {
          const violation = fileViolations[i];
          md += `**Violation ${i + 1}:**\n\n`;
          md += `- **Rule:** \`${violation.rule}\`\n`;
          md += `- **Message:** ${violation.message}\n`;
          if (violation.location) {
            md += `- **Location:** Line ${violation.location.line}, Column ${violation.location.column}\n`;
          }
          md += `\n`;
        }
      }
    }

    // Success message
    if (violations.length === 0) {
      md += `## 🎉 Result\n\n`;
      md += `Your codebase complies with all defined architecture rules.\n\n`;
      md += `Keep up the good work! 👏\n`;
    }

    return md;
  }

  public getFileExtension(): string {
    return '.md';
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
}
