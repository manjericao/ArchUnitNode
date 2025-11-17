# Security Features

ArchUnitNode implements robust security features to protect against common vulnerabilities when analyzing codebases.

## Table of Contents

- [Path Traversal Protection](#path-traversal-protection)
- [Input Validation](#input-validation)
- [Error Handling](#error-handling)
- [Best Practices](#best-practices)

## Path Traversal Protection

The TypeScriptParser implements defense-in-depth validation to prevent path traversal attacks:

### Security Checks

1. **Path Normalization**: All paths are normalized and resolved before use
2. **Traversal Detection**: Paths containing `..` are rejected
3. **CWD Boundary Check**: Relative paths must stay within the current working directory
4. **Null Byte Detection**: Paths containing null bytes (`\0` or `\x00`) are rejected
5. **File Type Verification**: Only actual files (not directories) are accepted
6. **Existence Validation**: Files must exist before parsing

### Examples

```typescript
import { TypeScriptParser } from 'archunitnode';

const parser = new TypeScriptParser();

// ✅ Safe paths - These will work
parser.parseFile('/absolute/path/to/file.ts');
parser.parseFile('./relative/path/within/project.ts');
parser.parseFile('src/services/UserService.ts');

// ❌ Dangerous paths - These will throw errors
parser.parseFile('../../../etc/passwd'); // Path traversal
parser.parseFile('/path/to/file.ts\x00.txt'); // Null byte injection
parser.parseFile('/path/to/directory'); // Directory, not file
parser.parseFile('../../../../Windows/System32/'); // Traversal attempt
```

### Error Messages

When security violations are detected, descriptive errors are thrown:

```typescript
try {
  parser.parseFile('../../../etc/passwd');
} catch (error) {
  console.error(error.message);
  // Output: "Path traversal detected: ../../../etc/passwd"
}
```

## Input Validation

### File Pattern Validation

The CodeAnalyzer uses glob patterns to find files. Patterns are validated to ensure they don't cause security issues:

```typescript
import { CodeAnalyzer } from 'archunitnode';

const analyzer = new CodeAnalyzer();

// ✅ Safe patterns
await analyzer.analyze('./src', ['**/*.ts', '**/*.tsx', '!**/*.test.ts', '!**/node_modules/**']);

// Patterns are processed by the 'glob' library which handles them safely
```

### Package Pattern Validation

Package patterns in rules are validated to prevent injection attacks:

```typescript
import { ArchRuleDefinition } from 'archunitnode';

// ✅ Safe package patterns
ArchRuleDefinition.classes()
  .that()
  .resideInPackage('services') // Exact match
  .should()
  .beAnnotatedWith('Service');

ArchRuleDefinition.classes()
  .that()
  .resideInAnyPackage('**/services') // Wildcard pattern
  .should()
  .beAnnotatedWith('Service');

// The pattern matching uses segment-based matching to prevent false positives
// "services" will NOT match "notservices" or "services-impl"
```

## Error Handling

### Error Categorization

The CodeAnalyzer categorizes errors into types for better handling:

```typescript
import { CodeAnalyzer } from 'archunitnode';

const analyzer = new CodeAnalyzer();
const result = await analyzer.analyzeWithErrors('./src');

// Group errors by type
const securityErrors = result.errors.filter((e) => e.errorType === 'security');
const parseErrors = result.errors.filter((e) => e.errorType === 'parse');
const ioErrors = result.errors.filter((e) => e.errorType === 'io');
const unknownErrors = result.errors.filter((e) => e.errorType === 'unknown');

console.log(`Security violations: ${securityErrors.length}`);
console.log(`Parse errors: ${parseErrors.length}`);
console.log(`I/O errors: ${ioErrors.length}`);
```

### Error Types

| Type       | Description                | Examples                       |
| ---------- | -------------------------- | ------------------------------ |
| `security` | Path traversal, null bytes | Path traversal detected        |
| `parse`    | Syntax errors              | Unexpected token, Parse error  |
| `io`       | File system errors         | ENOENT, EACCES, File not found |
| `unknown`  | Unclassified errors        | Other unexpected errors        |

### Graceful Degradation

The `analyzeWithErrors` method continues analysis even when individual files fail:

```typescript
const result = await analyzer.analyzeWithErrors('./src');

console.log(`Successfully analyzed: ${result.filesProcessed} files`);
console.log(`Skipped due to errors: ${result.filesSkipped} files`);
console.log(`Found classes: ${result.classes.size()}`);

// You can still use the successfully analyzed classes
const classes = result.classes;
```

## Best Practices

### 1. Always Use Absolute or Project-Relative Paths

```typescript
import * as path from 'path';

// ✅ Good - Absolute path
const projectRoot = path.resolve(__dirname, '..');
await analyzer.analyze(projectRoot);

// ✅ Good - Relative to current directory
await analyzer.analyze('./src');

// ❌ Bad - User-provided paths without validation
const userPath = getUserInput();
await analyzer.analyze(userPath); // Could contain ../../../
```

### 2. Validate User Input

If accepting paths from users, validate them first:

```typescript
import * as path from 'path';

function analyzeUserProject(userProvidedPath: string) {
  // Resolve and validate the path
  const resolvedPath = path.resolve(userProvidedPath);
  const projectRoot = path.resolve('.');

  // Ensure path is within project boundaries
  if (!resolvedPath.startsWith(projectRoot)) {
    throw new Error('Invalid path: Outside project boundaries');
  }

  return analyzer.analyze(resolvedPath);
}
```

### 3. Handle Errors Appropriately

```typescript
const result = await analyzer.analyzeWithErrors('./src');

// Check for security violations
const securityViolations = result.errors.filter((e) => e.errorType === 'security');
if (securityViolations.length > 0) {
  console.error('Security violations detected:');
  securityViolations.forEach((err) => {
    console.error(`  ${err.file}: ${err.error.message}`);
  });
  process.exit(1);
}

// Log other errors but continue
if (result.errors.length > 0) {
  console.warn(`${result.errors.length} files could not be parsed`);
}
```

### 4. Use Glob Patterns to Exclude Sensitive Files

```typescript
await analyzer.analyze('./src', [
  '**/*.ts',
  '!**/*.test.ts',
  '!**/*.spec.ts',
  '!**/node_modules/**',
  '!**/.env*', // Exclude environment files
  '!**/secrets/**', // Exclude secrets directory
  '!**/credentials.json', // Exclude credentials
]);
```

### 5. Enable Caching Safely

Caching is safe to use as it validates file hashes:

```typescript
// Cache is enabled by default with hash validation
const analyzer = new CodeAnalyzer({ enableCache: true });

// The cache checks SHA-256 hashes to detect file changes
// If a file changes, the cache is automatically invalidated
```

## Security Considerations for CI/CD

When using ArchUnitNode in CI/CD pipelines:

```typescript
// Example GitHub Actions / CI script
import { CodeAnalyzer } from 'archunitnode';
import * as path from 'path';

async function analyzePullRequest() {
  const analyzer = new CodeAnalyzer();

  // Always use absolute paths in CI
  const srcPath = path.resolve(process.env.GITHUB_WORKSPACE || '.', 'src');

  const result = await analyzer.analyzeWithErrors(srcPath);

  // Fail the build if security errors are found
  const securityErrors = result.errors.filter((e) => e.errorType === 'security');
  if (securityErrors.length > 0) {
    console.error('Security violations found in code analysis');
    process.exit(1);
  }

  return result.classes;
}
```

## Reporting Security Issues

If you discover a security vulnerability in ArchUnitNode, please report it to:

- **Email**: [Create an issue on GitHub](https://github.com/manjericao/ArchUnitNode/issues)
- **GitHub Security Advisory**: Use GitHub's security advisory feature

Please do not disclose security vulnerabilities publicly until a fix is available.

## Security Updates

We take security seriously and will:

1. Respond to security reports within 48 hours
2. Release security patches as soon as possible
3. Credit security researchers (unless they prefer to remain anonymous)
4. Maintain a security changelog

## Additional Resources

- [OWASP Path Traversal](https://owasp.org/www-community/attacks/Path_Traversal)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [TypeScript Security Guide](https://github.com/microsoft/TypeScript/wiki/Security-Guidelines)

---

Last updated: 2025-11-17
