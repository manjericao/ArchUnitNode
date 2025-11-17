# Frequently Asked Questions (FAQ)

## General Questions

### What is ArchUnit-TS?

ArchUnit-TS is a TypeScript/JavaScript library that allows you to test and enforce architectural rules in your codebase. It's inspired by [ArchUnit](https://www.archunit.org/) for Java.

### Why should I use ArchUnit-TS?

Architecture tests help you:
- **Prevent architectural drift** - Ensure your architecture stays clean over time
- **Document architecture** - Your tests serve as executable documentation
- **Catch violations early** - Find architectural issues in CI/CD before code review
- **Enforce team conventions** - Automatically enforce naming conventions and package structures
- **Maintain clean code** - Prevent unwanted dependencies between layers

### How is this different from a linter?

While linters focus on code style and common bugs, ArchUnit-TS focuses on architectural patterns:
- **Layered architecture** - Ensure layers only depend on allowed layers
- **Package structure** - Verify classes are in the correct packages
- **Naming conventions** - Enforce class naming patterns
- **Dependency rules** - Control which modules can depend on which
- **Custom patterns** - Define your own architectural rules

## Installation & Setup

### Which version should I use?

Always use the latest stable version. Check [npm](https://www.npmjs.com/package/archunit-ts) for the current version.

### Can I use this with JavaScript (not TypeScript)?

Yes! ArchUnit-TS works with both TypeScript and JavaScript projects. It can analyze `.ts`, `.tsx`, `.js`, and `.jsx` files.

### Do I need to install it as a regular dependency?

No, install it as a dev dependency since it's only used for testing:
```bash
npm install --save-dev archunit-ts
```

### Which test frameworks are supported?

ArchUnit-TS works with any test framework. We provide examples for:
- Jest (recommended)
- Mocha
- Vitest
- Node's built-in test runner

## Usage Questions

### How do I ignore certain files?

By default, ArchUnit-TS ignores:
- `node_modules/`
- `dist/`
- `build/`
- `*.d.ts` files

You can customize the file patterns:
```typescript
const violations = await archUnit.checkRule(
  './src',
  rule,
  ['**/*.ts', '!**/*.test.ts'] // Custom patterns
);
```

### Can I test multiple rules at once?

Yes, use the `checkRules` method:
```typescript
const rules = [rule1, rule2, rule3];
const violations = await archUnit.checkRules('./src', rules);
```

### How do I handle violations?

Use `assertNoViolations` to throw an error if violations are found:
```typescript
const violations = await archUnit.checkRule('./src', rule);
ArchUnitTS.assertNoViolations(violations); // Throws if violations exist
```

Or handle them manually:
```typescript
if (violations.length > 0) {
  violations.forEach(v => console.error(v.message));
}
```

### Can I define custom architecture patterns?

Yes! You can create custom rules using the fluent API or extend `BaseArchRule`:
```typescript
class CustomRule extends BaseArchRule {
  check(classes: TSClasses): ArchitectureViolation[] {
    // Your custom logic
  }
}
```

### How do I test decorators/annotations?

Use the decorator checking methods:
```typescript
const rule = ArchRuleDefinition.classes()
  .that()
  .areAnnotatedWith('Controller')
  .should()
  .resideInPackage('controllers');
```

## Performance Questions

### Is ArchUnit-TS fast enough for large codebases?

Yes, but performance depends on:
- **Codebase size** - More files = longer analysis
- **Rule complexity** - Simple rules are faster
- **File patterns** - Be specific to analyze fewer files

For large projects, consider:
- Running architecture tests separately from unit tests
- Using more specific file patterns
- Caching analysis results (future feature)

### Can I run tests in watch mode?

Yes! Use Jest's watch mode:
```bash
npm run test:watch
```

### Should architecture tests run on every commit?

It depends on your workflow:
- **Small projects** - Yes, run on every commit
- **Large projects** - Consider running only on PR or push to main
- **CI/CD** - Always run in CI pipeline

## Troubleshooting

### Why are my rules not catching violations?

Common issues:
1. **Package patterns** - Ensure your package patterns match your folder structure
2. **File patterns** - Check that files are being analyzed (not ignored)
3. **Rule logic** - Verify your rule logic is correct
4. **Case sensitivity** - Package names are case-sensitive

Debug by:
```typescript
const classes = await archUnit.analyzeCode('./src');
console.log(classes.getAll()); // See what was analyzed
```

### Why is analysis taking so long?

Possible causes:
- Analyzing too many files (including node_modules)
- Complex TypeScript configurations
- Large files with complex syntax

Solutions:
- Use specific file patterns
- Exclude unnecessary directories
- Check your tsconfig.json

### I'm getting TypeScript parsing errors

Ensure:
1. Your TypeScript files are valid
2. Dependencies are installed
3. TypeScript version is compatible (>= 4.0)
4. tsconfig.json is properly configured

### Can I analyze files outside my project?

Yes, but ensure:
- You have read permissions
- The path is absolute or correctly relative
- TypeScript can parse the files

## Integration Questions

### Can I use this with CI/CD?

Absolutely! Add to your CI pipeline:
```yaml
- name: Architecture Tests
  run: npm run test:architecture
```

### Does this work with monorepos?

Yes! Analyze each package separately:
```typescript
const violations = await archUnit.checkRule('./packages/api', rule);
```

Or all at once:
```typescript
const violations = await archUnit.checkRule('./packages', rule);
```

### Can I integrate with SonarQube or other tools?

Currently, violations are returned as arrays. You can format them for your tools:
```typescript
violations.forEach(v => {
  // Format for your tool
  console.log(JSON.stringify(v));
});
```

### Does this work with ES modules?

Yes! ArchUnit-TS 1.x supports both CommonJS and ES modules.

## Best Practices

### How many architecture tests should I write?

Start small:
1. Test critical architectural boundaries (e.g., domain doesn't depend on infrastructure)
2. Add naming convention tests for consistency
3. Add layer dependency rules
4. Expand as needed

### Should I test third-party code?

No, focus on your own code. Use file patterns to exclude `node_modules`.

### How granular should my tests be?

Balance specificity with maintainability:
- ✅ `Controllers should only depend on Services and Models`
- ✅ `Services should not depend on Controllers`
- ❌ `UserService should only import from UserRepository` (too specific)

### Where should I put architecture tests?

Common approaches:
- `test/architecture/` - Separate directory
- `test/arch.test.ts` - Single file
- Near related tests - Colocated with unit tests

## Contribution Questions

### How can I contribute?

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Code contributions
- Documentation improvements
- Bug reports
- Feature requests

### I found a bug, what should I do?

1. Check existing [issues](https://github.com/manjericao/ArchUnitNode/issues)
2. Create a new issue with:
   - Description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Can I request new features?

Yes! Create a [feature request](https://github.com/manjericao/ArchUnitNode/issues/new?template=feature_request.md) with:
- Use case description
- Proposed API or behavior
- Examples of how you'd use it

## Comparison Questions

### How does this compare to ESLint rules?

| Feature | ArchUnit-TS | ESLint |
|---------|-------------|--------|
| Architecture rules | ✅ Specialized | ⚠️ Limited |
| Layer dependencies | ✅ Yes | ❌ No |
| Naming conventions | ✅ Yes | ✅ Yes |
| Code style | ❌ No | ✅ Yes |
| Custom rules | ✅ Fluent API | ⚠️ Requires plugin |

Use both! ESLint for code style, ArchUnit-TS for architecture.

### How does this compare to ArchUnit (Java)?

ArchUnit-TS is inspired by ArchUnit for Java:
- ✅ Similar fluent API
- ✅ Same concepts (layers, dependencies, rules)
- ⚠️ Some features not yet implemented (caching, freezing)
- TypeScript/JavaScript specific features

### Are there alternatives?

Other tools:
- **dependency-cruiser** - Dependency validation
- **madge** - Circular dependency detection
- **ESLint import rules** - Import linting

ArchUnit-TS provides a more comprehensive architecture testing framework.

## Still have questions?

- 📖 Check the [API Documentation](API.md)
- 💬 Start a [Discussion](https://github.com/manjericao/ArchUnitNode/discussions)
- 🐛 Report an [Issue](https://github.com/manjericao/ArchUnitNode/issues)
- 📧 Email us at admin@manjericao.io
