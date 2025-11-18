import { TSClasses } from './TSClasses';
import { ArchitectureViolation, Severity } from '../types';

// Re-export types for convenience
export { ArchitectureViolation, Severity };

/**
 * Interface for architecture rules
 */
export interface ArchRule {
  check(classes: TSClasses): ArchitectureViolation[];
  getDescription(): string;
  asWarning(): ArchRule;
  asError(): ArchRule;
  getSeverity(): Severity;
}

/**
 * Base class for architecture rules
 */
export abstract class BaseArchRule implements ArchRule {
  protected description: string;
  protected severity: Severity;

  constructor(description: string, severity: Severity = Severity.ERROR) {
    this.description = description;
    this.severity = severity;
  }

  abstract check(classes: TSClasses): ArchitectureViolation[];

  getDescription(): string {
    return this.description;
  }

  /**
   * Set this rule to warning severity (won't fail build)
   */
  public asWarning(): ArchRule {
    this.severity = Severity.WARNING;
    return this;
  }

  /**
   * Set this rule to error severity (will fail build)
   */
  public asError(): ArchRule {
    this.severity = Severity.ERROR;
    return this;
  }

  /**
   * Get the severity level of this rule
   */
  public getSeverity(): Severity {
    return this.severity;
  }

  /**
   * Create a violation with the rule's severity
   */
  protected createViolation(
    message: string,
    filePath: string,
    rule: string
  ): ArchitectureViolation {
    return {
      message,
      filePath,
      rule,
      severity: this.severity,
    };
  }
}
