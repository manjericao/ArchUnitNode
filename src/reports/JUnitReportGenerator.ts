import { ReportGenerator, ReportData, ReportOptions } from './types';
import { ArchitectureViolation } from '../types';

/**
 * Generates JUnit XML reports for CI/CD integration
 */
export class JUnitReportGenerator implements ReportGenerator {
  public generate(data: ReportData, options: ReportOptions): string {
    const { metadata, violations } = data;
    const testSuiteName = this.escapeXml(options.title || 'ArchUnit Tests');
    const timestamp = new Date(metadata.timestamp).toISOString();
    const time = metadata.executionTime ? (metadata.executionTime / 1000).toFixed(3) : '0.000';

    const violationsByFile = this.groupByFile(violations);

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += `<testsuites name="${testSuiteName}" tests="${metadata.rulesChecked}" failures="${metadata.totalViolations}" time="${time}" timestamp="${timestamp}">\n`;

    // Create a test suite for each file
    for (const [file, fileViolations] of violationsByFile.entries()) {
      const suiteName = this.escapeXml(file);
      xml += `  <testsuite name="${suiteName}" tests="${fileViolations.length}" failures="${fileViolations.length}" time="${time}">\n`;

      for (let i = 0; i < fileViolations.length; i++) {
        const violation = fileViolations[i];
        const testName = this.escapeXml(`Rule: ${violation.rule}`);
        const message = this.escapeXml(violation.message);
        const location = violation.location
          ? `${file}:${violation.location.line}:${violation.location.column}`
          : file;

        xml += `    <testcase name="${testName}" classname="${suiteName}" time="0">\n`;
        xml += `      <failure message="${message}" type="ArchitectureViolation">\n`;
        xml += `${this.escapeXml(`Location: ${location}\n${violation.message}`)}\n`;
        xml += `      </failure>\n`;
        xml += `    </testcase>\n`;
      }

      xml += `  </testsuite>\n`;
    }

    // Add a passing test suite if no violations
    if (violations.length === 0) {
      xml += `  <testsuite name="All Rules" tests="${metadata.rulesChecked}" failures="0" time="${time}">\n`;
      xml += `    <testcase name="All architecture rules passed" classname="ArchUnit" time="0"/>\n`;
      xml += `  </testsuite>\n`;
    }

    xml += '</testsuites>\n';

    return xml;
  }

  public getFileExtension(): string {
    return '.xml';
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

  private escapeXml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&apos;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
