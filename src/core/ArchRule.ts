import { TSClasses } from './TSClasses';
import { ArchitectureViolation } from '../types';

/**
 * Interface for architecture rules
 */
export interface ArchRule {
  check(classes: TSClasses): ArchitectureViolation[];
  getDescription(): string;
}

/**
 * Base class for architecture rules
 */
export abstract class BaseArchRule implements ArchRule {
  protected description: string;

  constructor(description: string) {
    this.description = description;
  }

  abstract check(classes: TSClasses): ArchitectureViolation[];

  getDescription(): string {
    return this.description;
  }

  /**
   * Create a violation
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
    };
  }
}
