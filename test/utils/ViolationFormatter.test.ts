import {
  ViolationFormatter,
  formatViolations,
  formatViolation,
  formatSummary,
} from '../../src/utils/ViolationFormatter';
import { ArchitectureViolation, Severity } from '../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('ViolationFormatter', () => {
  // Sample violations for testing
  const sampleViolation: ArchitectureViolation = {
    message: 'Class UserService should reside in package services',
    filePath: '/project/src/services/UserService.ts',
    severity: Severity.ERROR,
    rule: 'Classes that reside in package services should have name ending with Service',
    location: {
      filePath: '/project/src/services/UserService.ts',
      line: 10,
      column: 1,
    },
  };

  const warningViolation: ArchitectureViolation = {
    message: 'Consider using dependency injection',
    filePath: '/project/src/controllers/UserController.ts',
    severity: Severity.WARNING,
    rule: 'Controllers should use dependency injection pattern',
    location: {
      filePath: '/project/src/controllers/UserController.ts',
      line: 15,
      column: 5,
    },
  };

  const violationWithoutLocation: ArchitectureViolation = {
    message: 'Package structure violation',
    filePath: '/project/src/models/User.ts',
    severity: Severity.ERROR,
    rule: 'Models should follow naming convention',
  };

  describe('formatViolation()', () => {
    it('should format a single violation with default options', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation);

      expect(result).toContain('[ERROR]');
      expect(result).toContain('Class UserService should reside in package services');
      expect(result).toContain('UserService.ts:10:1');
      expect(result).toContain('Rule:');
    });

    it('should format violation without colors', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, { colors: false });

      expect(result).not.toContain('\x1b');
      expect(result).toContain('[ERROR]');
      expect(result).toContain('Class UserService should reside in package services');
    });

    it('should format violation with absolute paths', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, {
        relativePaths: false,
        colors: false,
      });

      expect(result).toContain('/project/src/services/UserService.ts');
    });

    it('should format violation with relative paths', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, {
        relativePaths: true,
        colors: false,
      });

      // Should contain some path that's relative
      expect(result).toBeTruthy();
      expect(result).toContain('.ts');
    });

    it('should format WARNING severity with correct badge', () => {
      const result = ViolationFormatter.formatViolation(warningViolation, { colors: false });

      expect(result).toContain('[WARNING]');
      expect(result).toContain('Consider using dependency injection');
    });

    it('should format ERROR severity with correct badge', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, { colors: false });

      expect(result).toContain('[ERROR]');
    });

    it('should handle violation without location', () => {
      const result = ViolationFormatter.formatViolation(violationWithoutLocation, {
        colors: false,
      });

      expect(result).toContain('[ERROR]');
      expect(result).toContain('Package structure violation');
      expect(result).toContain('User.ts');
      expect(result).not.toContain(':undefined:');
    });

    it('should not show context when showContext is false', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, {
        showContext: false,
        colors: false,
      });

      expect(result).not.toContain('│');
      expect(result).toContain('[ERROR]');
    });

    it('should handle missing file gracefully when trying to show context', () => {
      const violationWithMissingFile: ArchitectureViolation = {
        message: 'Test violation',
        filePath: '/nonexistent/file.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: '/nonexistent/file.ts', line: 10, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violationWithMissingFile, {
        showContext: true,
        colors: false,
      });

      expect(result).toContain('[ERROR]');
      expect(result).toContain('Test violation');
    });
  });

  describe('formatViolations()', () => {
    it('should return success message for empty violations array', () => {
      const result = ViolationFormatter.formatViolations([], { colors: false });

      expect(result).toContain('No architecture violations found');
      expect(result).toContain('✓');
    });

    it('should format multiple violations', () => {
      const violations = [sampleViolation, warningViolation];
      const result = ViolationFormatter.formatViolations(violations, { colors: false });

      expect(result).toContain('Found 2 architecture violation');
      expect(result).toContain('Violation 1:');
      expect(result).toContain('Violation 2:');
      expect(result).toContain('[ERROR]');
      expect(result).toContain('[WARNING]');
    });

    it('should separate violations with divider', () => {
      const violations = [sampleViolation, warningViolation, violationWithoutLocation];
      const result = ViolationFormatter.formatViolations(violations, { colors: false });

      expect(result).toContain('─');
      expect(result).toContain('Violation 1:');
      expect(result).toContain('Violation 2:');
      expect(result).toContain('Violation 3:');
    });

    it('should not add divider after last violation', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatViolations(violations, { colors: false });

      // Should not have trailing divider
      expect(result.trim()).not.toMatch(/─+$/);
    });

    it('should handle single violation', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatViolations(violations, { colors: false });

      expect(result).toContain('Found 1 architecture violation');
      expect(result).toContain('Violation 1:');
      expect(result).not.toContain('Violation 2:');
    });

    it('should format with colors enabled', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatViolations(violations, { colors: true });

      expect(result).toContain('\x1b[');
      expect(result).toContain('Found 1 architecture violation');
    });

    it('should pass options to individual violation formatting', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatViolations(violations, {
        colors: false,
        relativePaths: false,
        showContext: false,
      });

      expect(result).not.toContain('\x1b');
      expect(result).toBeTruthy();
    });
  });

  describe('formatSummary()', () => {
    it('should show success message for no violations', () => {
      const result = ViolationFormatter.formatSummary([], { colors: false });

      expect(result).toContain('All architecture rules passed!');
      expect(result).toContain('✓');
    });

    it('should show summary with violations count', () => {
      const violations = [sampleViolation, warningViolation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('Architecture Violations Summary');
      expect(result).toContain('Total violations: 2');
      expect(result).toContain('✗');
    });

    it('should separate errors and warnings', () => {
      const violations = [sampleViolation, warningViolation, violationWithoutLocation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('Errors: 2');
      expect(result).toContain('Warnings: 1');
    });

    it('should only show errors if no warnings', () => {
      const violations = [sampleViolation, violationWithoutLocation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('Errors: 2');
      expect(result).not.toContain('Warnings:');
    });

    it('should only show warnings if no errors', () => {
      const violations = [warningViolation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('Warnings: 1');
      expect(result).not.toContain('Errors:');
    });

    it('should group violations by file', () => {
      const violations = [sampleViolation, warningViolation, violationWithoutLocation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('across 3 file(s)');
      expect(result).toContain('Violations by file:');
      expect(result).toContain('UserService.ts: 1 violation(s)');
      expect(result).toContain('UserController.ts: 1 violation(s)');
      expect(result).toContain('User.ts: 1 violation(s)');
    });

    it('should show breakdown of errors and warnings per file', () => {
      const violations = [sampleViolation, { ...sampleViolation, severity: Severity.WARNING }];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('UserService.ts: 2 violation(s) (1 error(s), 1 warning(s))');
    });

    it('should use relative paths when requested', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatSummary(violations, {
        colors: false,
        relativePaths: true,
      });

      // Should not contain absolute path
      expect(result).toBeTruthy();
      expect(result).toContain('violation');
    });

    it('should use absolute paths when requested', () => {
      const violations = [sampleViolation];
      const result = ViolationFormatter.formatSummary(violations, {
        colors: false,
        relativePaths: false,
      });

      expect(result).toContain('/project/src/services/UserService.ts');
    });

    it('should handle multiple violations in same file', () => {
      const violations = [sampleViolation, sampleViolation, sampleViolation];
      const result = ViolationFormatter.formatSummary(violations, { colors: false });

      expect(result).toContain('Total violations: 3 across 1 file(s)');
      expect(result).toContain('UserService.ts: 3 violation(s)');
    });
  });

  describe('Color Options', () => {
    it('should apply colors when enabled', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, { colors: true });

      expect(result).toContain('\x1b[');
      expect(result).toContain('\x1b[0m'); // Reset code
    });

    it('should not apply colors when disabled', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, { colors: false });

      expect(result).not.toContain('\x1b[');
    });

    it('should apply colors by default', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation);

      expect(result).toContain('\x1b[');
    });

    it('should use red for ERROR severity', () => {
      const result = ViolationFormatter.formatViolation(sampleViolation, { colors: true });

      expect(result).toContain('[ERROR]');
      expect(result).toContain('\x1b[31m'); // Red color code
    });

    it('should use yellow for WARNING severity', () => {
      const result = ViolationFormatter.formatViolation(warningViolation, { colors: true });

      expect(result).toContain('[WARNING]');
      expect(result).toContain('\x1b[33m'); // Yellow color code
    });
  });

  describe('Code Context', () => {
    const testFilePath = path.join(__dirname, 'test-violation-file.ts');

    beforeAll(() => {
      // Create a test file with content
      const content = `import { Test } from 'test';

export class TestClass {
  private field: string;

  constructor() {
    this.field = 'value';
  }

  public method(): void {
    console.log('test');
  }
}`;
      fs.writeFileSync(testFilePath, content, 'utf-8');
    });

    afterAll(() => {
      // Clean up test file
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('should show code context when file exists', () => {
      const violation: ArchitectureViolation = {
        message: 'Test violation',
        filePath: testFilePath,
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: testFilePath, line: 10, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violation, {
        showContext: true,
        contextLines: 2,
        colors: false,
      });

      expect(result).toContain('│');
      expect(result).toContain('public method(): void {');
    });

    it('should highlight target line with marker', () => {
      const violation: ArchitectureViolation = {
        message: 'Test violation',
        filePath: testFilePath,
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: testFilePath, line: 6, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violation, {
        showContext: true,
        contextLines: 1,
        colors: false,
      });

      expect(result).toContain('>');
      expect(result).toContain('constructor()');
    });

    it('should respect contextLines option', () => {
      const violation: ArchitectureViolation = {
        message: 'Test violation',
        filePath: testFilePath,
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: testFilePath, line: 6, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violation, {
        showContext: true,
        contextLines: 1,
        colors: false,
      });

      // Should show target line + 1 before + 1 after = 3 lines
      const lines = result.split('\n').filter((line) => line.includes('│'));
      expect(lines.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle context at beginning of file', () => {
      const violation: ArchitectureViolation = {
        message: 'Test violation',
        filePath: testFilePath,
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: testFilePath, line: 1, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violation, {
        showContext: true,
        contextLines: 5,
        colors: false,
      });

      expect(result).toContain('│');
      expect(result).toContain("import { Test } from 'test'");
    });

    it('should handle context at end of file', () => {
      const violation: ArchitectureViolation = {
        message: 'Test violation',
        filePath: testFilePath,
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: testFilePath, line: 13, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(violation, {
        showContext: true,
        contextLines: 5,
        colors: false,
      });

      expect(result).toContain('│');
      expect(result).toContain('}');
    });
  });

  describe('Exported Functions', () => {
    it('formatViolation() should call ViolationFormatter.formatViolation()', () => {
      const result = formatViolation(sampleViolation, { colors: false });

      expect(result).toContain('[ERROR]');
      expect(result).toContain('Class UserService should reside in package services');
    });

    it('formatViolations() should call ViolationFormatter.formatViolations()', () => {
      const violations = [sampleViolation, warningViolation];
      const result = formatViolations(violations, { colors: false });

      expect(result).toContain('Found 2 architecture violation');
    });

    it('formatSummary() should call ViolationFormatter.formatSummary()', () => {
      const violations = [sampleViolation, warningViolation];
      const result = formatSummary(violations, { colors: false });

      expect(result).toContain('Architecture Violations Summary');
      expect(result).toContain('Errors: 1');
      expect(result).toContain('Warnings: 1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long file paths', () => {
      const longPathViolation: ArchitectureViolation = {
        message: 'Test',
        filePath: '/very/long/path/to/some/deeply/nested/directory/structure/file.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
      };

      const result = ViolationFormatter.formatViolation(longPathViolation, { colors: false });

      expect(result).toContain('file.ts');
    });

    it('should handle empty violation message', () => {
      const emptyMessageViolation: ArchitectureViolation = {
        message: '',
        filePath: '/project/test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
      };

      const result = ViolationFormatter.formatViolation(emptyMessageViolation, { colors: false });

      expect(result).toContain('[ERROR]');
      expect(result).toContain('test.ts');
    });

    it('should handle special characters in messages', () => {
      const specialViolation: ArchitectureViolation = {
        message: 'Class should not contain <special> & "characters"',
        filePath: '/project/test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
      };

      const result = ViolationFormatter.formatViolation(specialViolation, { colors: false });

      expect(result).toContain('<special>');
      expect(result).toContain('"characters"');
    });

    it('should handle line number 0', () => {
      const zeroLineViolation: ArchitectureViolation = {
        message: 'Test',
        filePath: '/project/test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: '/project/test.ts', line: 0, column: 0 },
      };

      const result = ViolationFormatter.formatViolation(zeroLineViolation, { colors: false });

      expect(result).toContain('test.ts:0:0');
    });

    it('should handle very large line numbers', () => {
      const largeLineViolation: ArchitectureViolation = {
        message: 'Test',
        filePath: '/project/test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
        location: { filePath: '/project/test.ts', line: 999999, column: 1 },
      };

      const result = ViolationFormatter.formatViolation(largeLineViolation, { colors: false });

      expect(result).toContain('test.ts:999999:1');
    });

    it('should handle Unicode in messages', () => {
      const unicodeViolation: ArchitectureViolation = {
        message: 'Class name should not contain émojis 🚀',
        filePath: '/project/test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
      };

      const result = ViolationFormatter.formatViolation(unicodeViolation, { colors: false });

      expect(result).toContain('émojis');
      expect(result).toContain('🚀');
    });

    it('should handle Windows-style paths', () => {
      const windowsPathViolation: ArchitectureViolation = {
        message: 'Test',
        filePath: 'C:\\Users\\Project\\src\\test.ts',
        severity: Severity.ERROR,
        rule: 'Test rule',
      };

      const result = ViolationFormatter.formatViolation(windowsPathViolation, { colors: false });

      expect(result).toContain('test.ts');
    });
  });
});
