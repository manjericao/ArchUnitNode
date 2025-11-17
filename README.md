# ArchUnit-TS

<div align="center">

[![npm version](https://img.shields.io/npm/v/archunit-ts?style=for-the-badge)](https://www.npmjs.com/package/archunit-ts)
[![npm downloads](https://img.shields.io/npm/dm/archunit-ts?style=for-the-badge)](https://www.npmjs.com/package/archunit-ts)
[![License](https://img.shields.io/github/license/manjericao/ArchUnitNode?style=for-the-badge)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/manjericao/ArchUnitNode/ci.yml?branch=main&style=for-the-badge&label=CI)](https://github.com/manjericao/ArchUnitNode/actions)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Code Coverage](https://img.shields.io/codecov/c/github/manjericao/ArchUnitNode?style=for-the-badge)](https://codecov.io/gh/manjericao/ArchUnitNode)
[![CodeQL](https://img.shields.io/github/actions/workflow/status/manjericao/ArchUnitNode/codeql.yml?branch=main&style=for-the-badge&label=CodeQL)](https://github.com/manjericao/ArchUnitNode/security/code-scanning)

[![GitHub issues](https://img.shields.io/github/issues/manjericao/ArchUnitNode?style=for-the-badge)](https://github.com/manjericao/ArchUnitNode/issues)
[![GitHub stars](https://img.shields.io/github/stars/manjericao/ArchUnitNode?style=for-the-badge)](https://github.com/manjericao/ArchUnitNode/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg?style=for-the-badge)](https://conventionalcommits.org)

</div>

---

<p align="center">
  <strong>A TypeScript/JavaScript architecture testing library that allows you to specify and assert architecture rules in a fluent, expressive API.</strong>
</p>

<p align="center">
  Inspired by <a href="https://www.archunit.org/">ArchUnit</a> for Java
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="API.md">API Docs</a> •
  <a href="#examples">Examples</a> •
  <a href="CONTRIBUTING.md">Contributing</a> •
  <a href="FAQ.md">FAQ</a>
</p>

---

## Overview

ArchUnit-TS helps you maintain clean architecture in your TypeScript and JavaScript projects by:

- **Enforcing architectural rules** as executable code
- **Detecting violations early** in your CI/CD pipeline
- **Documenting architecture** through executable specifications
- **Preventing architectural drift** over time

## Features

- ✅ **Fluent API** for defining architecture rules
- ✅ **Naming conventions** enforcement
- ✅ **Package/module dependency** rules
- ✅ **Decorator/annotation** checking
- ✅ **Layered architecture** support
- ✅ **Cyclic dependency** detection
- ✅ **TypeScript & JavaScript** support
- ✅ **Integration with Jest** and other test frameworks
- ✅ **Zero runtime dependencies** in production

## Installation

```bash
npm install --save-dev archunit-ts
```

or

```bash
yarn add --dev archunit-ts
```

## Quick Start

### Basic Example

```typescript
import { createArchUnit, ArchRuleDefinition } from 'archunit-ts';

describe('Architecture Tests', () => {
  it('services should reside in services package', async () => {
    const archUnit = createArchUnit();

    const rule = ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Service')
      .should()
      .resideInPackage('services');

    const violations = await archUnit.checkRule('./src', rule);
    expect(violations).toHaveLength(0);
  });
});
```

### Naming Convention Rules

```typescript
import { ArchRuleDefinition } from 'archunit-ts';

// Classes ending with 'Controller' should reside in controllers package
const controllerRule = ArchRuleDefinition.classes()
  .that()
  .haveSimpleNameEndingWith('Controller')
  .should()
  .resideInPackage('controllers');

// Classes ending with 'Repository' should reside in repositories package
const repositoryRule = ArchRuleDefinition.classes()
  .that()
  .haveSimpleNameEndingWith('Repository')
  .should()
  .resideInPackage('repositories');
```

### Decorator/Annotation Rules

```typescript
import { ArchRuleDefinition } from 'archunit-ts';

// Classes with @Service decorator should reside in services package
const serviceRule = ArchRuleDefinition.classes()
  .that()
  .areAnnotatedWith('Service')
  .should()
  .resideInPackage('services');

// Classes in services package should be annotated with @Service
const serviceAnnotationRule = ArchRuleDefinition.classes()
  .that()
  .resideInPackage('services')
  .should()
  .beAnnotatedWith('Service');
```

### Layered Architecture

```typescript
import { layeredArchitecture } from 'archunit-ts';

const layerRule = layeredArchitecture()
  .layer('Controllers')
  .definedBy('controllers')
  .layer('Services')
  .definedBy('services')
  .layer('Repositories')
  .definedBy('repositories')
  .layer('Models')
  .definedBy('models')
  // Define access rules
  .whereLayer('Controllers')
  .mayOnlyAccessLayers('Services')
  .whereLayer('Services')
  .mayOnlyAccessLayers('Repositories', 'Models')
  .whereLayer('Repositories')
  .mayOnlyAccessLayers('Models')
  .whereLayer('Models')
  .mayNotAccessLayers('Controllers', 'Services', 'Repositories');

const violations = await archUnit.checkRule('./src', layerRule);
```

### Dependency Rules

```typescript
import { ArchRuleDefinition } from 'archunit-ts';

// Classes in domain should not depend on infrastructure
const domainRule = ArchRuleDefinition.classes()
  .that()
  .resideInPackage('domain')
  .should()
  .notDependOnClassesThat()
  .resideInPackage('infrastructure');
```

## API Documentation

See [API.md](API.md) for complete API documentation.

### Entry Points

- `ArchRuleDefinition` - Define architecture rules
- `createArchUnit()` - Create analyzer instance
- `layeredArchitecture()` - Define layered architecture
- `ArchUnitTS.assertNoViolations()` - Assert no violations

## Real-World Examples

### Express.js API Structure

```typescript
describe('Express API Architecture', () => {
  it('should enforce MVC pattern', async () => {
    const archUnit = createArchUnit();

    const rules = [
      // Controllers should only depend on services
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('controllers')
        .should()
        .onlyDependOnClassesThat()
        .resideInAnyPackage('services', 'models'),

      // Services should not depend on controllers
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .notDependOnClassesThat()
        .resideInPackage('controllers'),

      // Models should not depend on anything
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('models')
        .should()
        .notDependOnClassesThat()
        .resideInAnyPackage('controllers', 'services'),
    ];

    const violations = await archUnit.checkRules('./src', rules);
    expect(violations).toHaveLength(0);
  });
});
```

### NestJS Application

```typescript
describe('NestJS Architecture', () => {
  it('should enforce module boundaries', async () => {
    const archUnit = createArchUnit();

    const rules = [
      // Controllers should be annotated with @Controller
      ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .beAnnotatedWith('Controller'),

      // Services should be annotated with @Injectable
      ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .beAnnotatedWith('Injectable'),

      // Repositories should reside in database module
      ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Repository')
        .should()
        .resideInPackage('database'),
    ];

    const violations = await archUnit.checkRules('./src', rules);
    expect(violations).toHaveLength(0);
  });
});
```

## Integration with Test Frameworks

### Jest

```typescript
import { createArchUnit, ArchRuleDefinition, ArchUnitTS } from 'archunit-ts';

describe('Architecture Tests', () => {
  let archUnit: ArchUnitTS;

  beforeAll(() => {
    archUnit = createArchUnit();
  });

  it('should follow naming conventions', async () => {
    const rule = ArchRuleDefinition.classes()
      .that()
      .resideInPackage('services')
      .should()
      .haveSimpleNameEndingWith('Service');

    const violations = await archUnit.checkRule('./src', rule);

    // Assert no violations
    ArchUnitTS.assertNoViolations(violations);
  });
});
```

### Mocha

```typescript
import { expect } from 'chai';
import { createArchUnit, ArchRuleDefinition } from 'archunit-ts';

describe('Architecture Tests', () => {
  it('should enforce package rules', async () => {
    const archUnit = createArchUnit();

    const rule = ArchRuleDefinition.classes()
      .that()
      .areAnnotatedWith('Service')
      .should()
      .resideInPackage('services');

    const violations = await archUnit.checkRule('./src', rule);
    expect(violations).to.have.lengthOf(0);
  });
});
```

## Configuration

### Custom File Patterns

By default, ArchUnit-TS analyzes `**/*.ts`, `**/*.tsx`, `**/*.js`, and `**/*.jsx` files. You can customize this:

```typescript
const archUnit = createArchUnit();

const violations = await archUnit.checkRule(
  './src',
  rule,
  ['**/*.ts', '**/*.tsx'] // Only TypeScript files
);
```

### Ignoring Files

Automatically ignored:
- `node_modules/`
- `dist/`
- `build/`
- `*.d.ts` files

## Best Practices

1. **Run in CI/CD**: Add architecture tests to your CI/CD pipeline
2. **Test Early**: Run architecture tests alongside unit tests
3. **Start Small**: Begin with simple rules and expand gradually
4. **Document Intent**: Use clear, descriptive rule definitions
5. **Fail Fast**: Configure tests to fail on first violation for faster feedback

## Examples

Check the `/examples` directory for complete working examples:

- `examples/express-api/` - Express.js REST API
- `examples/nestjs-app/` - NestJS application
- `examples/clean-architecture/` - Clean architecture example

## Why ArchUnit-TS?

### Prevent Architecture Drift

As codebases grow, they tend to drift from their intended architecture. ArchUnit-TS helps prevent this by making architecture testable:

```typescript
// ❌ This would fail if a developer accidentally adds a dependency
const rule = ArchRuleDefinition.classes()
  .that()
  .resideInPackage('domain')
  .should()
  .notDependOnClassesThat()
  .resideInPackage('infrastructure');
```

### Living Documentation

Architecture tests serve as executable documentation that never gets outdated:

```typescript
// This test documents that controllers should only use services
describe('Architecture Rules', () => {
  it('controllers should only depend on services', async () => {
    // Test doubles as documentation
  });
});
```

### Early Detection

Catch architectural violations in CI/CD before they reach code review:

```bash
✓ Architecture Tests
  ✓ services should reside in services package
  ✓ controllers should only depend on services
  ✗ domain should not depend on infrastructure

    Violation: UserEntity depends on PostgresClient
    Location: src/domain/entities/UserEntity.ts:5
```

## Documentation

- 📖 [API Documentation](API.md) - Complete API reference
- ❓ [FAQ](FAQ.md) - Frequently asked questions
- 🛣️ [Roadmap](ROADMAP.md) - Future plans and features
- 🔒 [Security Policy](SECURITY.md) - Security guidelines
- 📝 [Changelog](CHANGELOG.md) - Release history
- 🤝 [Contributing Guide](CONTRIBUTING.md) - How to contribute

## Community & Support

- 💬 [GitHub Discussions](https://github.com/manjericao/ArchUnitNode/discussions) - Ask questions and share ideas
- 🐛 [Issue Tracker](https://github.com/manjericao/ArchUnitNode/issues) - Report bugs
- 📧 Email: admin@manjericao.io

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT © Manjericao Team

## Acknowledgments

Inspired by [ArchUnit](https://www.archunit.org/) for Java, created by TNG Technology Consulting.

## Support

- 📖 [Documentation](https://github.com/manjericao/ArchUnitNode)
- 🐛 [Issue Tracker](https://github.com/manjericao/ArchUnitNode/issues)
- 💬 [Discussions](https://github.com/manjericao/ArchUnitNode/discussions)
