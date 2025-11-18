/**
 * Enhanced Error Handler with suggestions
 *
 * @module cli/ErrorHandler
 */

import { ArchitectureViolation, Severity } from '../types';

/**
 * CLI Error types
 */
export enum ErrorType {
  CONFIGURATION = 'CONFIGURATION',
  ANALYSIS = 'ANALYSIS',
  VIOLATION = 'VIOLATION',
  FILE_SYSTEM = 'FILE_SYSTEM',
  GIT = 'GIT',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Enhanced error with suggestions
 */
export interface EnhancedError {
  type: ErrorType;
  message: string;
  details?: string;
  suggestions: string[];
  cause?: Error;
}

/**
 * Color codes for terminal output
 */
export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
};

/**
 * Enhanced Error Handler
 */
export class ErrorHandler {
  private useColors: boolean;

  constructor(useColors: boolean = true) {
    this.useColors = useColors;
  }

  /**
   * Parse error and provide suggestions
   */
  parseError(error: Error): EnhancedError {
    const message = error.message.toLowerCase();

    // Configuration errors
    if (message.includes('config') || message.includes('cannot find module')) {
      return {
        type: ErrorType.CONFIGURATION,
        message: error.message,
        suggestions: [
          'Check if archunit.config.js or archunit.config.ts exists',
          'Run "archunit init" to create a configuration file',
          'Verify the config file path is correct',
          'Ensure all required dependencies are installed',
        ],
        cause: error,
      };
    }

    // File system errors
    if (
      message.includes('enoent') ||
      message.includes('no such file') ||
      message.includes('cannot find')
    ) {
      return {
        type: ErrorType.FILE_SYSTEM,
        message: error.message,
        suggestions: [
          'Check if the specified path exists',
          'Verify file permissions',
          'Use absolute paths or ensure relative paths are correct',
          'Check if the working directory is correct',
        ],
        cause: error,
      };
    }

    // Git errors
    if (message.includes('git') || message.includes('not a git repository')) {
      return {
        type: ErrorType.GIT,
        message: error.message,
        suggestions: [
          'Initialize a git repository with "git init"',
          'Check if .git directory exists',
          'Ensure git is installed and in PATH',
          'Verify you are in the correct directory',
        ],
        cause: error,
      };
    }

    // Analysis errors
    if (message.includes('parse') || message.includes('syntax') || message.includes('analyze')) {
      return {
        type: ErrorType.ANALYSIS,
        message: error.message,
        suggestions: [
          'Check for syntax errors in TypeScript/JavaScript files',
          'Ensure all dependencies are installed',
          'Try updating to latest TypeScript version',
          'Check file encoding (should be UTF-8)',
          'Verify file patterns are correct',
        ],
        cause: error,
      };
    }

    // Validation errors
    if (message.includes('invalid') || message.includes('validation')) {
      return {
        type: ErrorType.VALIDATION,
        message: error.message,
        suggestions: [
          'Check the input parameters',
          'Verify the configuration format',
          'See documentation for correct usage',
        ],
        cause: error,
      };
    }

    // Unknown error
    return {
      type: ErrorType.UNKNOWN,
      message: error.message,
      suggestions: [
        'Check the error message for details',
        'Try running with --verbose flag for more information',
        'Report issue at https://github.com/manjericao/ArchUnitNode/issues',
      ],
      cause: error,
    };
  }

  /**
   * Format error for display
   */
  formatError(error: EnhancedError): string {
    const { red, yellow, cyan, bright, dim, reset } = this.useColors ? Colors : this.noColors();

    const lines: string[] = [];

    // Header
    lines.push('');
    lines.push(`${red}${bright}✖ Error: ${error.type}${reset}`);
    lines.push('');

    // Message
    lines.push(`${bright}${error.message}${reset}`);

    // Details
    if (error.details) {
      lines.push('');
      lines.push(`${dim}${error.details}${reset}`);
    }

    // Suggestions
    if (error.suggestions.length > 0) {
      lines.push('');
      lines.push(`${yellow}${bright}💡 Suggestions:${reset}`);
      for (const suggestion of error.suggestions) {
        lines.push(`  ${cyan}•${reset} ${suggestion}`);
      }
    }

    // Stack trace (if available and verbose)
    if (error.cause && process.env.VERBOSE) {
      lines.push('');
      lines.push(`${dim}Stack Trace:${reset}`);
      lines.push(`${dim}${error.cause.stack || error.cause.toString()}${reset}`);
    }

    lines.push('');

    return lines.join('\n');
  }

  /**
   * Format violations summary
   */
  formatViolationsSummary(violations: ArchitectureViolation[]): string {
    const { red, yellow, green, bright, dim, reset } = this.useColors ? Colors : this.noColors();

    if (violations.length === 0) {
      return `\n${green}${bright}✓ No architecture violations found!${reset}\n`;
    }

    const errors = violations.filter((v) => v.severity === 'error').length;
    const warnings = violations.filter((v) => v.severity === 'warning').length;

    const lines: string[] = [];
    lines.push('');
    lines.push(`${red}${bright}✖ Architecture Violations Found${reset}`);
    lines.push('');
    lines.push(`  ${red}Errors:${reset}   ${bright}${errors}${reset}`);
    lines.push(`  ${yellow}Warnings:${reset} ${bright}${warnings}${reset}`);
    lines.push(`  ${dim}Total:${reset}    ${bright}${violations.length}${reset}`);
    lines.push('');

    // Group by file
    const byFile = this.groupByFile(violations);
    const topFiles = Array.from(byFile.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 5);

    if (topFiles.length > 0) {
      lines.push(`${dim}Top violating files:${reset}`);
      for (const [file, fileViolations] of topFiles) {
        const shortFile = this.shortenPath(file);
        lines.push(
          `  ${dim}•${reset} ${shortFile} ${dim}(${fileViolations.length} violations)${reset}`
        );
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format a single violation
   */
  formatViolation(violation: ArchitectureViolation, _index: number): string {
    const { red, yellow, cyan, bright, dim, reset } = this.useColors ? Colors : this.noColors();

    const severityColor = violation.severity === Severity.ERROR ? red : yellow;
    const severityIcon = violation.severity === Severity.ERROR ? '✖' : '⚠';

    const lines: string[] = [];
    lines.push(
      `${severityColor}${bright}${severityIcon} ${violation.severity?.toUpperCase() || 'ERROR'}${reset}`
    );
    lines.push(`  ${bright}${violation.message}${reset}`);

    if (violation.filePath) {
      const location = violation.location
        ? `${this.shortenPath(violation.filePath)}:${violation.location.line}`
        : this.shortenPath(violation.filePath);
      lines.push(`  ${dim}at ${location}${reset}`);
    }

    // Extract class name from message if available
    const classNameMatch =
      violation.message.match(/class '([^']+)'/i) || violation.message.match(/Class '([^']+)'/);
    if (classNameMatch) {
      lines.push(`  ${dim}class: ${cyan}${classNameMatch[1]}${reset}`);
    }

    return lines.join('\n');
  }

  /**
   * Format success message
   */
  formatSuccess(message: string): string {
    const { green, bright, reset } = this.useColors ? Colors : this.noColors();
    return `\n${green}${bright}✓ ${message}${reset}\n`;
  }

  /**
   * Format info message
   */
  formatInfo(message: string): string {
    const { cyan, reset } = this.useColors ? Colors : this.noColors();
    return `${cyan}ℹ ${message}${reset}`;
  }

  /**
   * Format warning message
   */
  formatWarning(message: string): string {
    const { yellow, bright, reset } = this.useColors ? Colors : this.noColors();
    return `${yellow}${bright}⚠ ${message}${reset}`;
  }

  /**
   * Group violations by file
   */
  private groupByFile(violations: ArchitectureViolation[]): Map<string, ArchitectureViolation[]> {
    const map = new Map<string, ArchitectureViolation[]>();

    for (const violation of violations) {
      const file = violation.filePath || 'unknown';
      if (!map.has(file)) {
        map.set(file, []);
      }
      map.get(file)!.push(violation);
    }

    return map;
  }

  /**
   * Shorten file path for display
   */
  private shortenPath(filePath: string): string {
    const cwd = process.cwd();
    if (filePath.startsWith(cwd)) {
      return filePath.slice(cwd.length + 1);
    }
    return filePath;
  }

  /**
   * Get no-color versions
   */
  private noColors(): typeof Colors {
    return Object.keys(Colors).reduce(
      (acc, key) => {
        acc[key as keyof typeof Colors] = '';
        return acc;
      },
      {} as typeof Colors
    );
  }
}

/**
 * Create a new error handler
 */
export function createErrorHandler(useColors: boolean = true): ErrorHandler {
  return new ErrorHandler(useColors);
}

/**
 * Global error handler instance
 */
let globalHandler: ErrorHandler | null = null;

/**
 * Get global error handler
 */
export function getErrorHandler(useColors: boolean = true): ErrorHandler {
  if (!globalHandler) {
    globalHandler = new ErrorHandler(useColors);
  }
  return globalHandler;
}
