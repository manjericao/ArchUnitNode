import * as fs from 'fs';
import * as path from 'path';
import { ArchitectureViolation } from '../types';

/**
 * Options for formatting violations
 */
export interface FormatOptions {
  /**
   * Show code context around violations
   */
  showContext?: boolean;

  /**
   * Number of lines to show before and after the violation
   */
  contextLines?: number;

  /**
   * Use colors in output (for terminal)
   */
  colors?: boolean;

  /**
   * Show relative paths instead of absolute
   */
  relativePaths?: boolean;
}

/**
 * ANSI color codes for terminal output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

/**
 * Enhanced violation formatter with code context
 */
export class ViolationFormatter {
  /**
   * Format a single violation with optional code context
   */
  public static formatViolation(
    violation: ArchitectureViolation,
    options: FormatOptions = {}
  ): string {
    const opts = {
      showContext: true,
      contextLines: 2,
      colors: true,
      relativePaths: true,
      ...options,
    };

    let output = '';

    // Format the violation header
    output += this.formatHeader(violation, opts);
    output += '\n';

    // Show code context if available and requested
    if (opts.showContext && violation.location) {
      const context = this.getCodeContext(
        violation.filePath,
        violation.location.line,
        opts.contextLines
      );
      if (context) {
        output += '\n' + this.formatCodeContext(context, violation.location.line, opts);
        output += '\n';
      }
    }

    // Show the rule description
    output += this.formatRule(violation.rule, opts);

    return output;
  }

  /**
   * Format multiple violations
   */
  public static formatViolations(
    violations: ArchitectureViolation[],
    options: FormatOptions = {}
  ): string {
    if (violations.length === 0) {
      return this.colorize('✓ No architecture violations found', colors.green, options.colors);
    }

    let output = this.colorize(
      `\n✗ Found ${violations.length} architecture violation(s):\n`,
      colors.red + colors.bright,
      options.colors
    );

    for (let i = 0; i < violations.length; i++) {
      output += '\n';
      output += this.colorize(`Violation ${i + 1}:`, colors.bright, options.colors);
      output += '\n';
      output += this.formatViolation(violations[i], options);
      if (i < violations.length - 1) {
        output += '\n' + this.colorize('─'.repeat(80), colors.gray, options.colors) + '\n';
      }
    }

    return output;
  }

  /**
   * Format violation header
   */
  private static formatHeader(violation: ArchitectureViolation, options: FormatOptions): string {
    const filePath = options.relativePaths
      ? path.relative(process.cwd(), violation.filePath)
      : violation.filePath;

    const location = violation.location
      ? `:${violation.location.line}:${violation.location.column}`
      : '';

    const fileLocation = this.colorize(`  ${filePath}${location}`, colors.cyan, options.colors);

    const message = this.colorize(`  ${violation.message}`, colors.red, options.colors);

    return `${message}\n${fileLocation}`;
  }

  /**
   * Get code context around a specific line
   */
  private static getCodeContext(
    filePath: string,
    targetLine: number,
    contextLines: number
  ): { lines: string[]; startLine: number } | null {
    try {
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      const startLine = Math.max(1, targetLine - contextLines);
      const endLine = Math.min(lines.length, targetLine + contextLines);

      const contextLineArray = lines.slice(startLine - 1, endLine);

      return {
        lines: contextLineArray,
        startLine,
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Format code context with line numbers and highlighting
   */
  private static formatCodeContext(
    context: { lines: string[]; startLine: number },
    targetLine: number,
    options: FormatOptions
  ): string {
    const maxLineNumWidth = String(context.startLine + context.lines.length).length;
    let output = '';

    for (let i = 0; i < context.lines.length; i++) {
      const lineNum = context.startLine + i;
      const isTargetLine = lineNum === targetLine;
      const lineNumStr = String(lineNum).padStart(maxLineNumWidth, ' ');

      if (isTargetLine) {
        // Highlight the target line
        const marker = this.colorize('>', colors.red + colors.bright, options.colors);
        const lineNumber = this.colorize(lineNumStr, colors.red + colors.bright, options.colors);
        const lineContent = this.colorize(context.lines[i], colors.red, options.colors);
        output += `  ${marker} ${lineNumber} │ ${lineContent}\n`;
      } else {
        // Regular context line
        const lineNumber = this.colorize(lineNumStr, colors.gray, options.colors);
        const lineContent = this.colorize(context.lines[i], colors.gray, options.colors);
        output += `    ${lineNumber} │ ${lineContent}\n`;
      }
    }

    return output.trimEnd();
  }

  /**
   * Format rule description
   */
  private static formatRule(rule: string, options: FormatOptions): string {
    return '\n  ' + this.colorize(`Rule: ${rule}`, colors.dim, options.colors);
  }

  /**
   * Apply color if enabled
   */
  private static colorize(text: string, color: string, enabled?: boolean): string {
    if (enabled === false) {
      return text;
    }
    return `${color}${text}${colors.reset}`;
  }

  /**
   * Create a summary of violations
   */
  public static formatSummary(
    violations: ArchitectureViolation[],
    options: FormatOptions = {}
  ): string {
    if (violations.length === 0) {
      return this.colorize(
        '\n✓ All architecture rules passed!\n',
        colors.green + colors.bright,
        options.colors
      );
    }

    // Group violations by file
    const violationsByFile = new Map<string, ArchitectureViolation[]>();
    for (const violation of violations) {
      const existing = violationsByFile.get(violation.filePath) || [];
      existing.push(violation);
      violationsByFile.set(violation.filePath, existing);
    }

    let output = this.colorize(
      `\n✗ Architecture Violations Summary\n`,
      colors.red + colors.bright,
      options.colors
    );

    output += this.colorize(
      `  Total violations: ${violations.length} across ${violationsByFile.size} file(s)\n`,
      colors.red,
      options.colors
    );

    output += '\n';
    output += this.colorize('  Violations by file:\n', colors.bright, options.colors);

    for (const [filePath, fileViolations] of violationsByFile) {
      const relativePath = options.relativePaths
        ? path.relative(process.cwd(), filePath)
        : filePath;

      output += this.colorize(
        `    ${relativePath}: ${fileViolations.length} violation(s)\n`,
        colors.cyan,
        options.colors
      );
    }

    return output;
  }
}

/**
 * Format violations with enhanced error messages
 */
export function formatViolations(
  violations: ArchitectureViolation[],
  options: FormatOptions = {}
): string {
  return ViolationFormatter.formatViolations(violations, options);
}

/**
 * Format a single violation
 */
export function formatViolation(
  violation: ArchitectureViolation,
  options: FormatOptions = {}
): string {
  return ViolationFormatter.formatViolation(violation, options);
}

/**
 * Format a summary of violations
 */
export function formatSummary(
  violations: ArchitectureViolation[],
  options: FormatOptions = {}
): string {
  return ViolationFormatter.formatSummary(violations, options);
}
