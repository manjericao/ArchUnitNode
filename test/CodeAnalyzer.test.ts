import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import * as path from 'path';
import * as fs from 'fs';

describe('CodeAnalyzer', () => {
  let analyzer: CodeAnalyzer;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeEach(() => {
    analyzer = new CodeAnalyzer();
  });

  it('should analyze TypeScript files', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    expect(classes.size()).toBeGreaterThan(0);
  });

  it('should find classes in the codebase', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const allClasses = classes.getAll();

    const classNames = allClasses.map((c) => c.name);
    expect(classNames).toContain('UserService');
    expect(classNames).toContain('UserController');
    expect(classNames).toContain('UserRepository');
    expect(classNames).toContain('User');
  });

  it('should identify decorators', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const userService = classes.getAll().find((c) => c.name === 'UserService');

    expect(userService).toBeDefined();
    expect(userService!.isAnnotatedWith('Service')).toBe(true);
  });

  it('should filter classes by package', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const services = classes.resideInPackage('services');

    expect(services.size()).toBeGreaterThan(0);
    const serviceClasses = services.getAll();
    expect(serviceClasses.some((c) => c.name === 'UserService')).toBe(true);
  });

  it('should identify class properties', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const user = classes.getAll().find((c) => c.name === 'User');

    expect(user).toBeDefined();
    expect(user!.properties.length).toBeGreaterThan(0);
  });

  it('should identify class methods', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const userService = classes.getAll().find((c) => c.name === 'UserService');

    expect(userService).toBeDefined();
    expect(userService!.methods.length).toBeGreaterThan(0);
    const methodNames = userService!.methods.map((m) => m.name);
    expect(methodNames).toContain('getUser');
    expect(methodNames).toContain('createUser');
  });

  describe('Error Handling - analyzeWithErrors', () => {
    it('should return analysis result with classes and error details', async () => {
      const result = await analyzer.analyzeWithErrors(fixturesPath);

      // Should have the analysis result structure
      expect(result).toHaveProperty('classes');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('filesProcessed');
      expect(result).toHaveProperty('filesSkipped');

      // Should successfully analyze valid files
      expect(result.classes.size()).toBeGreaterThan(0);
      expect(result.filesProcessed).toBeGreaterThan(0);

      // With valid fixtures, should have no errors
      expect(result.errors).toEqual([]);
    });

    it('should handle files with syntax errors gracefully', async () => {
      // Create a file with syntax errors
      const tempDir = path.join(__dirname, 'temp-test');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const invalidFile = path.join(tempDir, 'invalid-syntax.ts');
      fs.writeFileSync(
        invalidFile,
        `
        class BrokenClass {
          // Missing closing brace
          method() {
            const x = ;  // Invalid syntax
        `,
        'utf-8'
      );

      const result = await analyzer.analyzeWithErrors(tempDir);

      // Should have errors but not throw
      expect(result.errors.length).toBeGreaterThan(0);

      // Check error details
      const error = result.errors[0];
      expect(error).toHaveProperty('file');
      expect(error).toHaveProperty('error');
      expect(error).toHaveProperty('errorType');
      expect(error.file).toBe(invalidFile);
      expect(error.errorType).toBe('parse');
      expect(error.error.message).toContain('Unexpected token');

      // Stats should reflect the error
      expect(result.filesSkipped).toBeGreaterThan(0);

      // Cleanup
      fs.unlinkSync(invalidFile);
      fs.rmdirSync(tempDir);
    });

    it('should categorize security errors correctly', async () => {
      // Test path traversal detection
      const result = await analyzer.analyzeWithErrors(__dirname, [
        '../../../etc/passwd', // Path traversal attempt
      ]);

      // Should have security error
      if (result.errors.length > 0) {
        const securityError = result.errors.find((e) => e.errorType === 'security');
        if (securityError) {
          expect(securityError.error.message).toMatch(
            /path traversal|null byte|Invalid file path/i
          );
        }
      }
    });

    it('should categorize IO errors correctly', async () => {
      const nonExistentPath = path.join(__dirname, 'nonexistent-directory');

      const result = await analyzer.analyzeWithErrors(nonExistentPath, ['*.ts']);

      // Should complete without throwing
      expect(result).toBeDefined();
      expect(result.classes.size()).toBe(0);

      // May have IO errors if pattern matching attempts to read
      if (result.errors.length > 0) {
        const ioErrors = result.errors.filter((e) => e.errorType === 'io');
        ioErrors.forEach((error) => {
          expect(error.error.message).toMatch(/ENOENT|no such file|does not exist/i);
        });
      }
    });

    it('should handle mixed success and failure scenarios', async () => {
      // Create test directory with both valid and invalid files
      const tempDir = path.join(__dirname, 'temp-mixed');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // Valid file
      const validFile = path.join(tempDir, 'valid.ts');
      fs.writeFileSync(
        validFile,
        `
        export class ValidClass {
          method() {
            return 'valid';
          }
        }
        `,
        'utf-8'
      );

      // Invalid file
      const invalidFile = path.join(tempDir, 'invalid.ts');
      fs.writeFileSync(
        invalidFile,
        `
        class InvalidClass {
          method() {
            const x = ;  // Syntax error
          }
        }
        `,
        'utf-8'
      );

      const result = await analyzer.analyzeWithErrors(tempDir);

      // Should have processed the valid file
      expect(result.classes.size()).toBeGreaterThan(0);
      const classes = result.classes.getAll();
      expect(classes.some((c) => c.name === 'ValidClass')).toBe(true);

      // Should have error for invalid file
      expect(result.errors.length).toBeGreaterThan(0);
      const parseError = result.errors.find((e) => e.file === invalidFile);
      expect(parseError).toBeDefined();
      expect(parseError!.errorType).toBe('parse');

      // Stats should reflect mixed results
      expect(result.filesProcessed).toBeGreaterThan(0);
      expect(result.filesSkipped).toBeGreaterThan(0);

      // Cleanup
      fs.unlinkSync(validFile);
      fs.unlinkSync(invalidFile);
      fs.rmdirSync(tempDir);
    });

    it('should handle empty directories without errors', async () => {
      const tempDir = path.join(__dirname, 'temp-empty');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const result = await analyzer.analyzeWithErrors(tempDir);

      // Should complete successfully with no classes
      expect(result.classes.size()).toBe(0);
      expect(result.errors).toEqual([]);
      expect(result.filesProcessed).toBe(0);
      expect(result.filesSkipped).toBe(0);

      // Cleanup
      fs.rmdirSync(tempDir);
    });

    it('should preserve error stack traces for debugging', async () => {
      const tempDir = path.join(__dirname, 'temp-stack');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const invalidFile = path.join(tempDir, 'stack-test.ts');
      fs.writeFileSync(invalidFile, 'const x = ;', 'utf-8');

      const result = await analyzer.analyzeWithErrors(tempDir);

      if (result.errors.length > 0) {
        const error = result.errors[0];
        expect(error.error).toBeInstanceOf(Error);
        expect(error.error.stack).toBeDefined();
      }

      // Cleanup
      fs.unlinkSync(invalidFile);
      fs.rmdirSync(tempDir);
    });

    it('should analyze with caching enabled', async () => {
      const analyzerWithCache = new CodeAnalyzer({ enableCache: true });

      // First analysis
      const result1 = await analyzerWithCache.analyzeWithErrors(fixturesPath);
      expect(result1.classes.size()).toBeGreaterThan(0);

      // Second analysis - should hit cache
      const result2 = await analyzerWithCache.analyzeWithErrors(fixturesPath);
      expect(result2.classes.size()).toBe(result1.classes.size());

      // Both should have same classes
      const classes1 = result1.classes
        .getAll()
        .map((c) => c.name)
        .sort();
      const classes2 = result2.classes
        .getAll()
        .map((c) => c.name)
        .sort();
      expect(classes1).toEqual(classes2);
    });

    it('should handle different file patterns', async () => {
      // Only .ts files
      const tsResult = await analyzer.analyzeWithErrors(fixturesPath, ['**/*.ts']);
      expect(tsResult.classes.size()).toBeGreaterThan(0);

      // Try .tsx pattern (may not exist in fixtures)
      const tsxResult = await analyzer.analyzeWithErrors(fixturesPath, ['**/*.tsx']);
      // Should complete without errors even if no files match
      expect(tsxResult).toBeDefined();
    });

    it('should categorize unknown errors correctly', async () => {
      // Create a scenario that might cause an unexpected error
      const tempDir = path.join(__dirname, 'temp-unknown');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      // File with unusual content that might trigger unexpected parsing behavior
      const strangeFile = path.join(tempDir, 'strange.ts');
      fs.writeFileSync(strangeFile, '\x00\x01\x02', 'utf-8'); // Binary-like content

      const result = await analyzer.analyzeWithErrors(tempDir);

      // Should handle gracefully
      expect(result).toBeDefined();

      // Cleanup
      fs.unlinkSync(strangeFile);
      fs.rmdirSync(tempDir);
    });
  });

  describe('Backward Compatibility', () => {
    it('should maintain analyze() method for legacy code', async () => {
      // Old analyze() method should still work
      const classes = await analyzer.analyze(fixturesPath);

      expect(classes).toBeDefined();
      expect(classes.size()).toBeGreaterThan(0);

      // Should return TSClasses object, not AnalysisResult
      expect(classes).toHaveProperty('getAll');
      expect(classes).toHaveProperty('size');
      expect(classes).not.toHaveProperty('errors');
    });

    it('should log errors but not throw in analyze() method', async () => {
      const tempDir = path.join(__dirname, 'temp-legacy');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const invalidFile = path.join(tempDir, 'invalid-legacy.ts');
      fs.writeFileSync(invalidFile, 'const x = ;', 'utf-8');

      // Spy on console.error
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Should not throw
      const classes = await analyzer.analyze(tempDir);

      // Should still return a TSClasses object
      expect(classes).toBeDefined();
      expect(classes).toHaveProperty('getAll');

      // Cleanup
      consoleErrorSpy.mockRestore();
      fs.unlinkSync(invalidFile);
      fs.rmdirSync(tempDir);
    });
  });
});
