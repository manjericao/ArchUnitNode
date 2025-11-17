import { ReportGenerator, ReportData, ReportOptions } from './types';
import { ArchitectureViolation, SourceLocation } from '../types';

/**
 * Generates JSON reports for machine-readable output
 */
export class JsonReportGenerator implements ReportGenerator {
  public generate(data: ReportData, options: ReportOptions): string {
    const { metadata, violations } = data;

    const report = {
      metadata: {
        title: options.title || 'ArchUnit Architecture Report',
        timestamp: options.includeTimestamp ? metadata.timestamp : undefined,
        totalViolations: metadata.totalViolations,
        totalFiles: metadata.totalFiles,
        rulesChecked: metadata.rulesChecked,
        rulesPassed: metadata.rulesPassed,
        rulesFailed: metadata.rulesFailed,
        executionTime: metadata.executionTime,
      },
      violations: violations.map((v) => ({
        message: v.message,
        filePath: v.filePath,
        location: v.location
          ? {
              line: v.location.line,
              column: v.location.column,
            }
          : undefined,
        rule: v.rule,
      })),
      violationsByFile: this.groupByFile(violations),
      violationsByRule: this.groupByRule(violations),
    };

    // Remove undefined fields
    Object.keys(report.metadata).forEach(
      (key) =>
        report.metadata[key as keyof typeof report.metadata] === undefined &&
        delete report.metadata[key as keyof typeof report.metadata]
    );

    return JSON.stringify(report, null, 2);
  }

  public getFileExtension(): string {
    return '.json';
  }

  private groupByFile(
    violations: ArchitectureViolation[]
  ): Record<string, Array<{ message: string; rule: string; location?: SourceLocation }>> {
    const grouped: Record<
      string,
      Array<{ message: string; rule: string; location?: SourceLocation }>
    > = {};

    for (const violation of violations) {
      const file = violation.filePath;
      if (!grouped[file]) {
        grouped[file] = [];
      }
      grouped[file].push({
        message: violation.message,
        rule: violation.rule,
        location: violation.location,
      });
    }

    return grouped;
  }

  private groupByRule(
    violations: ArchitectureViolation[]
  ): Record<string, Array<{ message: string; filePath: string; location?: SourceLocation }>> {
    const grouped: Record<
      string,
      Array<{ message: string; filePath: string; location?: SourceLocation }>
    > = {};

    for (const violation of violations) {
      const rule = violation.rule;
      if (!grouped[rule]) {
        grouped[rule] = [];
      }
      grouped[rule].push({
        message: violation.message,
        filePath: violation.filePath,
        location: violation.location,
      });
    }

    return grouped;
  }
}
