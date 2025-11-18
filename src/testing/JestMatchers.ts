/**
 * Custom Jest matchers for architectural testing
 */

import { ArchitectureViolation } from '../types';

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveNoViolations(): R;
      toHaveViolationCount(count: number): R;
      toHaveViolationMatching(message: string | RegExp): R;
      toHaveViolationInFile(filePath: string): R;
      toHaveOnlyWarnings(): R;
      toHaveOnlyErrors(): R;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

/**
 * Custom Jest matchers for ArchUnit violations
 */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
export const archUnitMatchers = {
  /**
   * Asserts that there are no architectural violations
   *
   * @example
   * expect(violations).toHaveNoViolations();
   */
  toHaveNoViolations(received: ArchitectureViolation[]) {
    const pass = received.length === 0;

    if (pass) {
      return {
        message: () => 'expected violations but found none',
        pass: true,
      };
    }

    const violationMessages = received
      .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
      .join('\n');

    return {
      message: () => `expected no violations but found ${received.length}:\n${violationMessages}`,
      pass: false,
    };
  },

  /**
   * Asserts that there are exactly N violations
   *
   * @example
   * expect(violations).toHaveViolationCount(3);
   */
  toHaveViolationCount(received: ArchitectureViolation[], expectedCount: number) {
    const pass = received.length === expectedCount;

    if (pass) {
      return {
        message: () =>
          `expected not to have ${expectedCount} violations but found ${received.length}`,
        pass: true,
      };
    }

    const violationMessages = received
      .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
      .join('\n');

    return {
      message: () =>
        `expected ${expectedCount} violations but found ${received.length}:\n${violationMessages}`,
      pass: false,
    };
  },

  /**
   * Asserts that at least one violation matches the given message
   *
   * @example
   * expect(violations).toHaveViolationMatching('should not depend on');
   * expect(violations).toHaveViolationMatching(/Controller.*Service/);
   */
  toHaveViolationMatching(received: ArchitectureViolation[], expectedMessage: string | RegExp) {
    const matches = received.filter((v) => {
      if (typeof expectedMessage === 'string') {
        return v.message.includes(expectedMessage);
      }
      return expectedMessage.test(v.message);
    });

    const pass = matches.length > 0;

    if (pass) {
      const matchedMessages = matches
        .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
        .join('\n');

      return {
        message: () =>
          `expected no violation matching "${expectedMessage}" but found ${matches.length}:\n${matchedMessages}`,
        pass: true,
      };
    }

    const allMessages = received.map((v, index) => `  ${index + 1}. ${v.message}`).join('\n');

    return {
      message: () =>
        `expected violation matching "${expectedMessage}" but found:\n${allMessages || '  (no violations)'}`,
      pass: false,
    };
  },

  /**
   * Asserts that at least one violation is in the specified file
   *
   * @example
   * expect(violations).toHaveViolationInFile('UserController.ts');
   */
  toHaveViolationInFile(received: ArchitectureViolation[], filePath: string) {
    const matches = received.filter((v) => v.filePath.includes(filePath));

    const pass = matches.length > 0;

    if (pass) {
      const matchedMessages = matches
        .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
        .join('\n');

      return {
        message: () =>
          `expected no violations in "${filePath}" but found ${matches.length}:\n${matchedMessages}`,
        pass: true,
      };
    }

    const allFiles = received.map((v) => `  - ${v.filePath}`).join('\n');

    return {
      message: () =>
        `expected violation in file "${filePath}" but found violations in:\n${allFiles || '  (no violations)'}`,
      pass: false,
    };
  },

  /**
   * Asserts that all violations are warnings (no errors)
   *
   * @example
   * expect(violations).toHaveOnlyWarnings();
   */
  toHaveOnlyWarnings(received: ArchitectureViolation[]) {
    const errors = received.filter((v) => v.severity === 'error');
    const pass = errors.length === 0 && received.length > 0;

    if (received.length === 0) {
      return {
        message: () => 'expected warnings but found no violations',
        pass: false,
      };
    }

    if (pass) {
      return {
        message: () => `expected errors but found only warnings (${received.length})`,
        pass: true,
      };
    }

    const errorMessages = errors
      .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
      .join('\n');

    return {
      message: () => `expected only warnings but found ${errors.length} errors:\n${errorMessages}`,
      pass: false,
    };
  },

  /**
   * Asserts that all violations are errors (no warnings)
   *
   * @example
   * expect(violations).toHaveOnlyErrors();
   */
  toHaveOnlyErrors(received: ArchitectureViolation[]) {
    const warnings = received.filter((v) => v.severity === 'warning');
    const pass = warnings.length === 0 && received.length > 0;

    if (received.length === 0) {
      return {
        message: () => 'expected errors but found no violations',
        pass: false,
      };
    }

    if (pass) {
      return {
        message: () => `expected warnings but found only errors (${received.length})`,
        pass: true,
      };
    }

    const warningMessages = warnings
      .map((v, index) => `  ${index + 1}. ${v.message}\n     at ${v.filePath}`)
      .join('\n');

    return {
      message: () =>
        `expected only errors but found ${warnings.length} warnings:\n${warningMessages}`,
      pass: false,
    };
  },
};
/* eslint-enable @typescript-eslint/explicit-function-return-type */

/**
 * Extend Jest with custom matchers
 *
 * Add this to your Jest setup file:
 * ```typescript
 * import { extendJestMatchers } from 'archunit-ts/testing';
 * extendJestMatchers();
 * ```
 */
export function extendJestMatchers(): void {
  // Check if running in Jest environment
  if (typeof global !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const globalAny = global as any;
    if (globalAny.expect && globalAny.expect.extend) {
      globalAny.expect.extend(archUnitMatchers);
      return;
    }
  }

  console.warn('Jest "expect" not found. Custom matchers not registered.');
}
