import { ArchitectureViolation } from '../types';

/**
 * Supported report formats
 */
export enum ReportFormat {
  HTML = 'html',
  JSON = 'json',
  JUNIT = 'junit',
  MARKDOWN = 'markdown',
}

/**
 * Report generation options
 */
export interface ReportOptions {
  format: ReportFormat;
  outputPath: string;
  title?: string;
  includeTimestamp?: boolean;
  includeStats?: boolean;
  includePassedRules?: boolean;
}

/**
 * Report metadata
 */
export interface ReportMetadata {
  title: string;
  timestamp: string;
  totalViolations: number;
  totalFiles: number;
  rulesChecked: number;
  rulesPassed?: number;
  rulesFailed?: number;
  executionTime?: number;
}

/**
 * Report data structure
 */
export interface ReportData {
  metadata: ReportMetadata;
  violations: ArchitectureViolation[];
  violationsByFile?: Map<string, ArchitectureViolation[]>;
  violationsByRule?: Map<string, ArchitectureViolation[]>;
}

/**
 * Base interface for report generators
 */
export interface ReportGenerator {
  generate(data: ReportData, options: ReportOptions): string;
  getFileExtension(): string;
}
