import * as fs from 'fs';
import * as path from 'path';
import { ReportFormat, ReportOptions, ReportData, ReportMetadata, ReportGenerator } from './types';
import { HtmlReportGenerator } from './HtmlReportGenerator';
import { JsonReportGenerator } from './JsonReportGenerator';
import { JUnitReportGenerator } from './JUnitReportGenerator';
import { MarkdownReportGenerator } from './MarkdownReportGenerator';
import { ArchitectureViolation } from '../types';

/**
 * Manages report generation for architecture violations
 */
export class ReportManager {
  private generators: Map<ReportFormat, ReportGenerator>;

  constructor() {
    this.generators = new Map<ReportFormat, ReportGenerator>();
    this.generators.set(ReportFormat.HTML, new HtmlReportGenerator());
    this.generators.set(ReportFormat.JSON, new JsonReportGenerator());
    this.generators.set(ReportFormat.JUNIT, new JUnitReportGenerator());
    this.generators.set(ReportFormat.MARKDOWN, new MarkdownReportGenerator());
  }

  /**
   * Generate a report from violations
   */
  public async generateReport(
    violations: ArchitectureViolation[],
    options: Partial<ReportOptions> & { format: ReportFormat; outputPath: string }
  ): Promise<string> {
    const fullOptions: ReportOptions = {
      format: options.format,
      outputPath: options.outputPath,
      title: options.title || 'ArchUnit Architecture Report',
      includeTimestamp: options.includeTimestamp !== false,
      includeStats: options.includeStats !== false,
      includePassedRules: options.includePassedRules || false,
    };

    const data = this.prepareReportData(violations, fullOptions);
    const generator = this.generators.get(fullOptions.format);

    if (!generator) {
      throw new Error(`Unsupported report format: ${fullOptions.format}`);
    }

    const content = generator.generate(data, fullOptions);

    // Ensure output directory exists
    const dir = path.dirname(fullOptions.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write report to file
    await fs.promises.writeFile(fullOptions.outputPath, content, 'utf-8');

    return fullOptions.outputPath;
  }

  /**
   * Generate multiple reports at once
   */
  public async generateMultipleReports(
    violations: ArchitectureViolation[],
    formats: ReportFormat[],
    outputDir: string,
    options?: Partial<Omit<ReportOptions, 'format' | 'outputPath'>>
  ): Promise<string[]> {
    const results: string[] = [];

    for (const format of formats) {
      const ext = this.getFileExtension(format);
      const outputPath = path.join(outputDir, `archunit-report${ext}`);

      const reportPath = await this.generateReport(violations, {
        ...options,
        format,
        outputPath,
      });

      results.push(reportPath);
    }

    return results;
  }

  /**
   * Prepare report data from violations
   */
  private prepareReportData(
    violations: ArchitectureViolation[],
    options: ReportOptions
  ): ReportData {
    const uniqueFiles = new Set(violations.map((v) => v.filePath));
    const uniqueRules = new Set(violations.map((v) => v.rule));

    const metadata: ReportMetadata = {
      title: options.title || 'ArchUnit Architecture Report',
      timestamp: new Date().toISOString(),
      totalViolations: violations.length,
      totalFiles: uniqueFiles.size,
      rulesChecked: uniqueRules.size || 1, // At least 1 rule was checked
      rulesFailed: uniqueRules.size,
      rulesPassed: 0, // This would need to be tracked separately
    };

    const violationsByFile = new Map<string, ArchitectureViolation[]>();
    const violationsByRule = new Map<string, ArchitectureViolation[]>();

    for (const violation of violations) {
      // Group by file
      if (!violationsByFile.has(violation.filePath)) {
        violationsByFile.set(violation.filePath, []);
      }
      violationsByFile.get(violation.filePath)!.push(violation);

      // Group by rule
      if (!violationsByRule.has(violation.rule)) {
        violationsByRule.set(violation.rule, []);
      }
      violationsByRule.get(violation.rule)!.push(violation);
    }

    return {
      metadata,
      violations,
      violationsByFile,
      violationsByRule,
    };
  }

  /**
   * Get file extension for a format
   */
  private getFileExtension(format: ReportFormat): string {
    const generator = this.generators.get(format);
    return generator ? generator.getFileExtension() : '.txt';
  }
}

/**
 * Create a new report manager instance
 */
export function createReportManager(): ReportManager {
  return new ReportManager();
}
