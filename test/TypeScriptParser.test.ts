import { TypeScriptParser } from '../src/parser/TypeScriptParser';
import { TSModule } from '../src/types';
import * as path from 'path';
import * as fs from 'fs';

describe('TypeScriptParser', () => {
  let parser: TypeScriptParser;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeEach(() => {
    parser = new TypeScriptParser();
  });

  describe('Basic Parsing', () => {
    it('should parse valid TypeScript files', () => {
      const filePath = path.join(fixturesPath, 'models', 'User.ts');
      const module = parser.parseFile(filePath);

      expect(module).toBeDefined();
      expect(module.filePath).toBe(filePath);
      expect(module.classes).toBeDefined();
    });

    it('should extract class information', () => {
      const filePath = path.join(fixturesPath, 'services', 'UserService.ts');
      const module = parser.parseFile(filePath);

      expect(module.classes.length).toBeGreaterThan(0);
      const serviceClass = module.classes.find((c) => c.name === 'UserService');
      expect(serviceClass).toBeDefined();
    });

    it('should extract imports', () => {
      const filePath = path.join(fixturesPath, 'services', 'UserService.ts');
      const module = parser.parseFile(filePath);

      expect(module.imports.length).toBeGreaterThan(0);
    });

    it('should extract decorators', () => {
      const filePath = path.join(fixturesPath, 'services', 'UserService.ts');
      const module = parser.parseFile(filePath);

      const serviceClass = module.classes.find((c) => c.name === 'UserService');
      expect(serviceClass).toBeDefined();
      expect(serviceClass!.decorators.length).toBeGreaterThan(0);
      expect(serviceClass!.decorators.some((d) => d.name === 'Service')).toBe(true);
    });

    it('should extract methods', () => {
      const filePath = path.join(fixturesPath, 'services', 'UserService.ts');
      const module = parser.parseFile(filePath);

      const serviceClass = module.classes.find((c) => c.name === 'UserService');
      expect(serviceClass).toBeDefined();
      expect(serviceClass!.methods.length).toBeGreaterThan(0);

      const methodNames = serviceClass!.methods.map((m) => m.name);
      expect(methodNames).toContain('getUser');
    });

    it('should extract properties', () => {
      const filePath = path.join(fixturesPath, 'models', 'User.ts');
      const module = parser.parseFile(filePath);

      const userClass = module.classes.find((c) => c.name === 'User');
      expect(userClass).toBeDefined();
      expect(userClass!.properties.length).toBeGreaterThan(0);
    });
  });

  describe('Security - Path Traversal Protection', () => {
    it('should reject path traversal attempts with ..', () => {
      const maliciousPath = path.join(__dirname, '..', '..', '..', 'etc', 'passwd');

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|File does not exist|Invalid file path/i);
    });

    it('should reject relative path traversal', () => {
      const maliciousPath = '../../../etc/passwd';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|File does not exist|Invalid file path/i);
    });

    it('should reject paths with null bytes', () => {
      const maliciousPath = '/valid/path/file.ts\x00.txt';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/null byte|Invalid file path/i);
    });

    it('should reject paths with encoded null bytes', () => {
      const maliciousPath = '/valid/path/file.ts\0.txt';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/null byte|Invalid file path/i);
    });

    it('should accept valid absolute paths', () => {
      const validPath = path.join(fixturesPath, 'models', 'User.ts');

      // Should not throw
      expect(() => {
        parser.parseFile(validPath);
      }).not.toThrow();
    });

    it('should accept valid relative paths within project', () => {
      const validPath = path.join('test', 'fixtures', 'sample-code', 'models', 'User.ts');

      // Should not throw for valid relative paths
      expect(() => {
        parser.parseFile(validPath);
      }).not.toThrow();
    });

    it('should reject paths trying to escape with multiple traversals', () => {
      const maliciousPath = '../../../../../../../../etc/passwd';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|Invalid file path/i);
    });

    it('should reject mixed traversal attempts', () => {
      const maliciousPath = path.join('valid', '..', '..', '..', 'etc', 'passwd');

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|Invalid file path/i);
    });

    it('should handle normalized paths that become safe', () => {
      // Path that normalizes to a valid location
      const validButConfusingPath = path.join(fixturesPath, 'models', '..', 'models', 'User.ts');

      // This should work because it normalizes to a valid path within the project
      // But our security check is strict and may reject it - that's acceptable
      const result = (): TSModule => parser.parseFile(validButConfusingPath);

      // Either it works (normalized correctly) or throws (strict security)
      // Both behaviors are acceptable
      if (validButConfusingPath.includes('..')) {
        expect(result).toThrow();
      } else {
        expect(result).not.toThrow();
      }
    });

    it('should reject symbolic link-like traversal patterns', () => {
      const maliciousPath = '/valid/path/../../../../../../etc/shadow';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|File does not exist|Invalid file path|ENOENT/i);
    });

    it('should handle Windows-style path traversal', () => {
      const maliciousPath = 'C:\\valid\\..\\..\\..\\Windows\\System32\\config\\SAM';

      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/path traversal|File does not exist|Invalid file path|ENOENT/i);
    });

    it('should protect against encoded path separators', () => {
      // URL-encoded forward slash: %2F, backward slash: %5C
      const maliciousPath = '/valid/path/%2e%2e%2f%2e%2e%2fetc%2fpasswd';

      // Node.js path module doesn't decode URL encoding by default,
      // so this would be treated as a literal directory name and fail naturally
      expect(() => {
        parser.parseFile(maliciousPath);
      }).toThrow(/File does not exist|Invalid file path|ENOENT/i);
    });
  });

  describe('Security - File Validation', () => {
    it('should reject non-existent files', () => {
      const nonExistentPath = path.join(__dirname, 'nonexistent-file.ts');

      expect(() => {
        parser.parseFile(nonExistentPath);
      }).toThrow(/does not exist|ENOENT|Invalid file path/i);
    });

    it('should reject directories', () => {
      const dirPath = fixturesPath;

      expect(() => {
        parser.parseFile(dirPath);
      }).toThrow(/is not a file|Invalid file path/i);
    });

    it('should handle empty file paths', () => {
      expect(() => {
        parser.parseFile('');
      }).toThrow(/Path is not a file|File does not exist|Invalid file path|ENOENT/i);
    });

    it('should handle whitespace-only paths', () => {
      expect(() => {
        parser.parseFile('   ');
      }).toThrow(/Path is not a file|File does not exist|Invalid file path|ENOENT/i);
    });

    it('should validate file exists before parsing', () => {
      const tempPath = path.join(__dirname, 'temp-deleted.ts');

      // Create and immediately delete a file
      fs.writeFileSync(tempPath, 'class Test {}', 'utf-8');
      fs.unlinkSync(tempPath);

      expect(() => {
        parser.parseFile(tempPath);
      }).toThrow(/does not exist|ENOENT|Invalid file path/i);
    });
  });

  describe('Security - Edge Cases', () => {
    it('should handle very long file paths', () => {
      // Create an extremely long but valid path
      const longComponent = 'a'.repeat(100);
      const longPath = path.join(__dirname, longComponent, 'file.ts');

      expect(() => {
        parser.parseFile(longPath);
      }).toThrow(/File does not exist|ENOENT|Invalid file path/i);
    });

    it('should handle special characters in filenames', () => {
      const specialPath = path.join(__dirname, 'file with spaces & special!chars.ts');

      expect(() => {
        parser.parseFile(specialPath);
      }).toThrow(/File does not exist|ENOENT|Invalid file path/i);
    });

    it('should handle unicode in file paths', () => {
      const unicodePath = path.join(__dirname, '文件.ts');

      expect(() => {
        parser.parseFile(unicodePath);
      }).toThrow(/File does not exist|ENOENT|Invalid file path/i);
    });

    it('should handle dot files', () => {
      const dotFilePath = path.join(__dirname, '.hidden.ts');

      // Create a test dot file
      fs.writeFileSync(dotFilePath, 'export class Hidden {}', 'utf-8');

      // Should be able to parse dot files (they're valid)
      expect(() => {
        parser.parseFile(dotFilePath);
      }).not.toThrow();

      // Cleanup
      fs.unlinkSync(dotFilePath);
    });

    it('should handle case sensitivity correctly', () => {
      // const filePath = path.join(fixturesPath, 'models', 'User.ts');

      // On case-sensitive systems, wrong case should fail
      // On case-insensitive systems (Windows, macOS), it may succeed
      const wrongCasePath = path.join(fixturesPath, 'models', 'user.ts');

      try {
        // Try to access with wrong case
        fs.accessSync(wrongCasePath, fs.constants.R_OK);
        // If no error, filesystem is case-insensitive, parsing should work
        expect(() => parser.parseFile(wrongCasePath)).not.toThrow();
      } catch {
        // Filesystem is case-sensitive, parsing should fail
        expect(() => parser.parseFile(wrongCasePath)).toThrow(/ENOENT|does not exist/i);
      }
    });
  });

  describe('Parsing Robustness', () => {
    it('should handle files with syntax errors gracefully', () => {
      const tempPath = path.join(__dirname, 'syntax-error.ts');
      fs.writeFileSync(tempPath, 'class Broken { const x = ; }', 'utf-8');

      expect(() => {
        parser.parseFile(tempPath);
      }).toThrow(/Expression expected|Unexpected token|parsing/i);

      // Cleanup
      fs.unlinkSync(tempPath);
    });

    it('should handle empty files', () => {
      const tempPath = path.join(__dirname, 'empty.ts');
      fs.writeFileSync(tempPath, '', 'utf-8');

      // Empty file should parse successfully with no classes
      const module = parser.parseFile(tempPath);
      expect(module).toBeDefined();
      expect(module.classes).toHaveLength(0);

      // Cleanup
      fs.unlinkSync(tempPath);
    });

    it('should handle files with only comments', () => {
      const tempPath = path.join(__dirname, 'comments-only.ts');
      fs.writeFileSync(
        tempPath,
        `
        // Just comments
        /* Block comment */
        /**
         * JSDoc comment
         */
        `,
        'utf-8'
      );

      const module = parser.parseFile(tempPath);
      expect(module).toBeDefined();
      expect(module.classes).toHaveLength(0);

      // Cleanup
      fs.unlinkSync(tempPath);
    });

    it('should handle files with multiple classes', () => {
      const tempPath = path.join(__dirname, 'multiple-classes.ts');
      fs.writeFileSync(
        tempPath,
        `
        export class First {}
        export class Second {}
        class Third {}
        `,
        'utf-8'
      );

      const module = parser.parseFile(tempPath);
      expect(module.classes).toHaveLength(3);
      expect(module.classes.map((c) => c.name)).toEqual(['First', 'Second', 'Third']);

      // Cleanup
      fs.unlinkSync(tempPath);
    });

    it('should handle complex TypeScript features', () => {
      const tempPath = path.join(__dirname, 'complex.ts');
      fs.writeFileSync(
        tempPath,
        `
        import { Observable } from 'rxjs';

        export interface IUser {
          id: string;
          name: string;
        }

        export class UserService<T extends IUser> implements IService {
          private readonly users: Map<string, T> = new Map();

          async getUser(id: string): Promise<T | null> {
            return this.users.get(id) ?? null;
          }

          getUsers(): Observable<T[]> {
            return new Observable((subscriber) => {
              subscriber.next(Array.from(this.users.values()));
            });
          }
        }
        `,
        'utf-8'
      );

      const module = parser.parseFile(tempPath);
      expect(module.classes.length).toBeGreaterThan(0);

      const userService = module.classes.find((c) => c.name === 'UserService');
      expect(userService).toBeDefined();
      expect(userService!.methods.length).toBeGreaterThan(0);
      expect(userService!.implements).toContain('IService');

      // Cleanup
      fs.unlinkSync(tempPath);
    });

    it('should handle inheritance chains', () => {
      const tempPath = path.join(__dirname, 'inheritance.ts');
      fs.writeFileSync(
        tempPath,
        `
        export class Animal {
          move() {}
        }

        export class Dog extends Animal {
          bark() {}
        }

        export class Poodle extends Dog {
          groom() {}
        }
        `,
        'utf-8'
      );

      const module = parser.parseFile(tempPath);
      expect(module.classes).toHaveLength(3);

      const dog = module.classes.find((c) => c.name === 'Dog');
      expect(dog).toBeDefined();
      expect(dog!.extends).toBe('Animal');

      const poodle = module.classes.find((c) => c.name === 'Poodle');
      expect(poodle).toBeDefined();
      expect(poodle!.extends).toBe('Dog');

      // Cleanup
      fs.unlinkSync(tempPath);
    });
  });

  describe('Performance', () => {
    it('should parse files efficiently', () => {
      const filePath = path.join(fixturesPath, 'services', 'UserService.ts');

      const startTime = Date.now();
      for (let i = 0; i < 10; i++) {
        parser.parseFile(filePath);
      }
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should parse 10 files in under 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large files', () => {
      const tempPath = path.join(__dirname, 'large-file.ts');

      // Create a large file with many classes
      const classes = Array.from(
        { length: 100 },
        (_, i) => `
        export class Class${i} {
          method${i}() {
            return ${i};
          }
        }
      `
      ).join('\n');

      fs.writeFileSync(tempPath, classes, 'utf-8');

      const startTime = Date.now();
      const module = parser.parseFile(tempPath);
      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(module.classes).toHaveLength(100);
      // Should parse large file in under 500ms
      expect(duration).toBeLessThan(500);

      // Cleanup
      fs.unlinkSync(tempPath);
    });
  });
});
