/**
 * Comprehensive tests for ErrorHandler
 */

import {
  ErrorHandler,
  createErrorHandler,
  getErrorHandler,
  ErrorType,
  Colors,
} from '../../src/cli/ErrorHandler';
import { Severity } from '../../src/types';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler(false); // Disable colors for testing
  });

  describe('Error Parsing', () => {
    it('should detect configuration errors', () => {
      const error = new Error('Cannot find module archunit.config.js');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.CONFIGURATION);
      expect(enhanced.message).toContain('Cannot find module');
      expect(enhanced.suggestions).toContain(
        'Check if archunit.config.js or archunit.config.ts exists'
      );
      expect(enhanced.cause).toBe(error);
    });

    it('should detect configuration errors with config keyword', () => {
      const error = new Error('Invalid config format');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.CONFIGURATION);
      expect(enhanced.suggestions.length).toBeGreaterThan(0);
    });

    it('should detect file system errors with ENOENT', () => {
      const error = new Error('ENOENT: no such file or directory');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.FILE_SYSTEM);
      expect(enhanced.suggestions).toContain('Check if the specified path exists');
    });

    it('should detect file system errors with "no such file"', () => {
      const error = new Error('no such file: /path/to/file.ts');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.FILE_SYSTEM);
    });

    it('should detect file system errors with "cannot find"', () => {
      const error = new Error('cannot find the specified file');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.FILE_SYSTEM);
    });

    it('should detect git errors', () => {
      const error = new Error('fatal: not a git repository');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.GIT);
      expect(enhanced.suggestions).toContain('Initialize a git repository with "git init"');
    });

    it('should detect git errors with git keyword', () => {
      const error = new Error('git command failed');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.GIT);
    });

    it('should detect analysis errors with parse keyword', () => {
      const error = new Error('Failed to parse TypeScript file');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.ANALYSIS);
      expect(enhanced.suggestions).toContain(
        'Check for syntax errors in TypeScript/JavaScript files'
      );
    });

    it('should detect analysis errors with syntax keyword', () => {
      const error = new Error('Syntax error in file');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.ANALYSIS);
    });

    it('should detect analysis errors with analyze keyword', () => {
      const error = new Error('Cannot analyze code');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.ANALYSIS);
    });

    it('should detect validation errors with invalid keyword', () => {
      const error = new Error('Invalid input parameter');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.VALIDATION);
      expect(enhanced.suggestions).toContain('Check the input parameters');
    });

    it('should detect validation errors with validation keyword', () => {
      const error = new Error('Validation failed for rule');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.VALIDATION);
    });

    it('should handle unknown errors', () => {
      const error = new Error('Something unexpected happened');
      const enhanced = handler.parseError(error);

      expect(enhanced.type).toBe(ErrorType.UNKNOWN);
      expect(enhanced.suggestions).toContain('Check the error message for details');
    });

    it('should preserve original error as cause', () => {
      const originalError = new Error('Test error');
      const enhanced = handler.parseError(originalError);

      expect(enhanced.cause).toBe(originalError);
    });
  });

  describe('Error Formatting', () => {
    it('should format error with all components', () => {
      const enhancedError = {
        type: ErrorType.CONFIGURATION,
        message: 'Config file not found',
        details: 'Additional details here',
        suggestions: ['Suggestion 1', 'Suggestion 2'],
        cause: new Error('Original error'),
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).toContain('CONFIGURATION');
      expect(formatted).toContain('Config file not found');
      expect(formatted).toContain('Suggestion 1');
      expect(formatted).toContain('Suggestion 2');
    });

    it('should format error without details', () => {
      const enhancedError = {
        type: ErrorType.FILE_SYSTEM,
        message: 'File not found',
        suggestions: ['Check path'],
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).toContain('FILE_SYSTEM');
      expect(formatted).toContain('File not found');
      expect(formatted).not.toContain('undefined');
    });

    it('should format error with empty suggestions', () => {
      const enhancedError = {
        type: ErrorType.UNKNOWN,
        message: 'Unknown error',
        suggestions: [],
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).toContain('Unknown error');
    });

    it('should include stack trace when VERBOSE is set', () => {
      const originalEnv = process.env.VERBOSE;
      process.env.VERBOSE = 'true';

      const error = new Error('Test error');
      error.stack = 'Stack trace here';

      const enhancedError = {
        type: ErrorType.UNKNOWN,
        message: 'Test',
        suggestions: [],
        cause: error,
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).toContain('Stack Trace');
      expect(formatted).toContain('Stack trace here');

      process.env.VERBOSE = originalEnv;
    });

    it('should not include stack trace when VERBOSE is not set', () => {
      const originalEnv = process.env.VERBOSE;
      delete process.env.VERBOSE;

      const enhancedError = {
        type: ErrorType.UNKNOWN,
        message: 'Test',
        suggestions: [],
        cause: new Error('Original'),
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).not.toContain('Stack Trace');

      process.env.VERBOSE = originalEnv;
    });

    it('should handle error cause without stack', () => {
      process.env.VERBOSE = 'true';

      const error = new Error('Test error');
      delete error.stack;

      const enhancedError = {
        type: ErrorType.UNKNOWN,
        message: 'Test',
        suggestions: [],
        cause: error,
      };

      const formatted = handler.formatError(enhancedError);

      expect(formatted).toContain('Stack Trace');

      delete process.env.VERBOSE;
    });
  });

  describe('Violations Formatting', () => {
    it('should format empty violations as success', () => {
      const formatted = handler.formatViolationsSummary([]);

      expect(formatted).toContain('✓');
      expect(formatted).toContain('No architecture violations found');
    });

    it('should format violations summary with errors and warnings', () => {
      const violations = [
        {
          rule: 'Rule 1',
          message: 'Error violation',
          filePath: '/test/file1.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'Rule 2',
          message: 'Warning violation',
          filePath: '/test/file2.ts',
          severity: Severity.WARNING,
        },
        {
          rule: 'Rule 3',
          message: 'Another error',
          filePath: '/test/file1.ts',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          severity: 'error' as any, // Test string literal
        },
      ];

      const formatted = handler.formatViolationsSummary(violations);

      expect(formatted).toContain('Architecture Violations Found');
      expect(formatted).toContain('Errors:');
      expect(formatted).toContain('Warnings:');
      expect(formatted).toContain('Total:');
      expect(formatted).toContain('3');
    });

    it('should show top violating files', () => {
      const violations = [
        {
          rule: 'R1',
          message: 'V1',
          filePath: '/test/file1.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'R2',
          message: 'V2',
          filePath: '/test/file1.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'R3',
          message: 'V3',
          filePath: '/test/file2.ts',
          severity: Severity.ERROR,
        },
      ];

      const formatted = handler.formatViolationsSummary(violations);

      expect(formatted).toContain('Top violating files');
      expect(formatted).toContain('file1.ts');
      expect(formatted).toContain('2 violations');
    });

    it('should handle violations with shortened paths', () => {
      const cwd = process.cwd();
      const violations = [
        {
          rule: 'R1',
          message: 'Test',
          filePath: `${cwd}/test/file.ts`,
          severity: Severity.ERROR,
        },
      ];

      const formatted = handler.formatViolationsSummary(violations);

      expect(formatted).toContain('test/file.ts');
      expect(formatted).not.toContain(cwd);
    });
  });

  describe('Single Violation Formatting', () => {
    it('should format error violation', () => {
      const violation = {
        rule: 'Test Rule',
        message: "Class 'TestClass' violates rule",
        filePath: '/test/file.ts',
        severity: Severity.ERROR,
        location: { filePath: '/test/file.ts', line: 10, column: 5 },
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('ERROR');
      expect(formatted).toContain("Class 'TestClass' violates rule");
      expect(formatted).toContain('file.ts:10');
      expect(formatted).toContain('TestClass');
    });

    it('should format warning violation', () => {
      const violation = {
        rule: 'Test Rule',
        message: 'Warning message',
        filePath: '/test/file.ts',
        severity: Severity.WARNING,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('WARNING');
      expect(formatted).toContain('Warning message');
    });

    it('should handle violation without location', () => {
      const violation = {
        rule: 'Test Rule',
        message: 'Test message',
        filePath: '/test/file.ts',
        severity: Severity.ERROR,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('file.ts');
      expect(formatted).not.toContain(':');
    });

    it('should handle violation without file path', () => {
      const violation = {
        rule: 'Test Rule',
        message: 'Test message',
        filePath: '',
        severity: Severity.ERROR,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('Test message');
    });

    it('should extract class name from message (lowercase)', () => {
      const violation = {
        rule: 'Test',
        message: "class 'MyClass' should reside in package",
        filePath: '/test/file.ts',
        severity: Severity.ERROR,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('MyClass');
    });

    it('should handle violation without severity', () => {
      const violation = {
        rule: 'Test',
        message: 'Test',
        filePath: '/test.ts',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        severity: undefined as any,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('ERROR'); // Default to ERROR
    });
  });

  describe('Message Formatting', () => {
    it('should format success message', () => {
      const formatted = handler.formatSuccess('All tests passed');

      expect(formatted).toContain('✓');
      expect(formatted).toContain('All tests passed');
    });

    it('should format info message', () => {
      const formatted = handler.formatInfo('Processing files...');

      expect(formatted).toContain('ℹ');
      expect(formatted).toContain('Processing files...');
    });

    it('should format warning message', () => {
      const formatted = handler.formatWarning('This is deprecated');

      expect(formatted).toContain('⚠');
      expect(formatted).toContain('This is deprecated');
    });
  });

  describe('Color Support', () => {
    it('should use colors when enabled', () => {
      const colorHandler = new ErrorHandler(true);
      const formatted = colorHandler.formatSuccess('Success');

      // Should contain ANSI escape codes
      expect(formatted).toContain('\x1b[');
    });

    it('should not use colors when disabled', () => {
      const noColorHandler = new ErrorHandler(false);
      const formatted = noColorHandler.formatSuccess('Success');

      // Should not contain ANSI escape codes
      expect(formatted).not.toContain('\x1b[');
    });

    it('should export Colors constant', () => {
      expect(Colors.red).toBe('\x1b[31m');
      expect(Colors.green).toBe('\x1b[32m');
      expect(Colors.yellow).toBe('\x1b[33m');
      expect(Colors.reset).toBe('\x1b[0m');
    });
  });

  describe('Factory Functions', () => {
    it('should create error handler with createErrorHandler', () => {
      const handler = createErrorHandler();

      expect(handler).toBeInstanceOf(ErrorHandler);
    });

    it('should create error handler with colors disabled', () => {
      const handler = createErrorHandler(false);
      const formatted = handler.formatSuccess('Test');

      expect(formatted).not.toContain('\x1b[');
    });

    it('should return global error handler', () => {
      const handler1 = getErrorHandler();
      const handler2 = getErrorHandler();

      expect(handler1).toBe(handler2); // Same instance
    });

    it('should create global handler with specified colors', () => {
      const handler = getErrorHandler(false);

      expect(handler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('Path Shortening', () => {
    it('should shorten paths within current directory', () => {
      const cwd = process.cwd();
      const violation = {
        rule: 'Test',
        message: 'Test',
        filePath: `${cwd}/src/test.ts`,
        severity: Severity.ERROR,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('src/test.ts');
      expect(formatted).not.toContain(cwd);
    });

    it('should not shorten paths outside current directory', () => {
      const violation = {
        rule: 'Test',
        message: 'Test',
        filePath: '/absolute/path/to/file.ts',
        severity: Severity.ERROR,
      };

      const formatted = handler.formatViolation(violation, 0);

      expect(formatted).toContain('/absolute/path/to/file.ts');
    });
  });

  describe('Violation Grouping', () => {
    it('should group violations by file correctly', () => {
      const violations = [
        {
          rule: 'R1',
          message: 'M1',
          filePath: '/test/file1.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'R2',
          message: 'M2',
          filePath: '/test/file1.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'R3',
          message: 'M3',
          filePath: '/test/file2.ts',
          severity: Severity.ERROR,
        },
        {
          rule: 'R4',
          message: 'M4',
          filePath: '',
          severity: Severity.ERROR,
        },
      ];

      const formatted = handler.formatViolationsSummary(violations);

      // Should show file1.ts with 2 violations as top file
      expect(formatted).toContain('2 violations');
    });

    it('should handle violations without file paths', () => {
      const violations = [
        {
          rule: 'R1',
          message: 'M1',
          filePath: '',
          severity: Severity.ERROR,
        },
      ];

      const formatted = handler.formatViolationsSummary(violations);

      expect(formatted).toContain('Architecture Violations Found');
    });

    it('should limit to top 5 files', () => {
      const violations = [];
      for (let i = 1; i <= 10; i++) {
        violations.push({
          rule: `R${i}`,
          message: `M${i}`,
          filePath: `/test/file${i}.ts`,
          severity: Severity.ERROR,
        });
      }

      const formatted = handler.formatViolationsSummary(violations);

      // Should only show top 5 files
      const lines = formatted.split('\n');
      const fileLines = lines.filter((line) => line.includes('/test/file'));
      expect(fileLines.length).toBeLessThanOrEqual(5);
    });
  });
});
