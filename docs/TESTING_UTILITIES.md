# Testing Utilities Guide

ArchUnit-TS provides comprehensive testing utilities to make writing architectural tests easier, more readable, and maintainable. This guide covers test helpers, custom matchers, and test suite builders.

## Table of Contents

- [Overview](#overview)
- [Test Helpers](#test-helpers)
  - [TestFixtureBuilder](#testfixturebuilder)
  - [RuleTestHelper](#ruletesthelper)
  - [ViolationAssertions](#violationassertions)
- [Jest Matchers](#jest-matchers)
- [Test Suite Builder](#test-suite-builder)
- [Examples](#examples)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

---

## Overview

Testing utilities help you:

- **Create test fixtures** quickly without real files
- **Write readable assertions** with custom Jest matchers
- **Build test suites** programmatically
- **Reduce boilerplate** in architectural tests

---

## Test Helpers

### TestFixtureBuilder

Create test fixtures programmatically without needing real TypeScript files.

**Usage:**

```typescript
import { createTestFixture } from 'archunit-ts';

const fixture = createTestFixture()
  .addClass({
    name: 'UserController',
    filePath: 'src/controllers/UserController.ts',
    module: 'controllers',
    methods: [
      { name: 'getUser', returnType: 'Promise<User>' },
      { name: 'createUser', returnType: 'Promise<void>' }
    ],
    dependencies: ['UserService', 'Logger']
  })
  .addClass({
    name: 'UserService',
    filePath: 'src/services/UserService.ts',
    module: 'services',
    methods: [
      { name: 'findById', returnType: 'Promise<User>' }
    ],
    dependencies: ['UserRepository']
  })
  .build();

// Use fixture with rules
const violations = rule.check(fixture);
```

**Class Configuration:**

```typescript
interface ClassConfig {
  name: string;                    // Class name
  filePath: string;                // File path
  module?: string;                 // Module/package name
  methods?: Array<{                // Class methods
    name: string;
    returnType?: string;
  }>;
  properties?: Array<{             // Class properties
    name: string;
    type?: string;
    isReadonly?: boolean;
  }>;
  decorators?: Array<{             // Decorators/annotations
    name: string;
    arguments?: unknown[];
  }>;
  dependencies?: string[];         // Import dependencies
  isAbstract?: boolean;           // Abstract class/interface
}
```

**Example - Testing Layering Rules:**

```typescript
import { createTestFixture, layeredArchitecture } from 'archunit-ts';

describe('Layered Architecture', () => {
  it('should enforce layer dependencies', () => {
    const fixture = createTestFixture()
      .addClass({
        name: 'UserController',
        filePath: 'src/controllers/UserController.ts',
        dependencies: ['UserService'] // ✅ Allowed
      })
      .addClass({
        name: 'UserService',
        filePath: 'src/services/UserService.ts',
        dependencies: ['UserRepository'] // ✅ Allowed
      })
      .addClass({
        name: 'UserRepository',
        filePath: 'src/repositories/UserRepository.ts',
        dependencies: ['UserController'] // ❌ Violation!
      })
      .build();

    const rule = layeredArchitecture()
      .layer('Controllers').definedBy('controllers')
      .layer('Services').definedBy('services')
      .layer('Repositories').definedBy('repositories')
      .whereLayer('Repositories').mayNotAccessLayers('Controllers', 'Services');

    const violations = rule.check(fixture);

    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('UserRepository');
  });
});
```

---

### RuleTestHelper

Helper for checking rules against fixtures or real code.

**Usage:**

```typescript
import { createRuleTestHelper, ArchRuleDefinition } from 'archunit-ts';

const helper = createRuleTestHelper();

// Check against fixture
const rule = ArchRuleDefinition.classes()
  .that().resideInPackage('controllers')
  .should().haveSimpleNameEndingWith('Controller');

helper.expectNoViolations(rule, fixture);

// Or check against real code
const violations = await helper.checkRuleAgainstCode(
  rule,
  './src',
  ['**/*.ts']
);
```

**Methods:**

```typescript
class RuleTestHelper {
  // Check rule against fixture
  checkRule(rule: ArchRule, fixture: TSClasses): ArchitectureViolation[];

  // Check rule against actual code
  async checkRuleAgainstCode(
    rule: ArchRule,
    basePath: string,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]>;

  // Expect no violations (throws if violations found)
  expectNoViolations(rule: ArchRule, fixture: TSClasses): void;

  // Expect specific number of violations
  expectViolationCount(rule: ArchRule, fixture: TSClasses, count: number): void;

  // Expect violations containing message
  expectViolationMessage(
    rule: ArchRule,
    fixture: TSClasses,
    message: string | RegExp
  ): void;
}
```

---

### ViolationAssertions

Static assertion methods for violations.

**Usage:**

```typescript
import { ViolationAssertions } from 'archunit-ts';

const violations = rule.check(classes);

// Assert no violations (throws if any found)
ViolationAssertions.assertNoViolations(violations);

// Assert specific count
ViolationAssertions.assertViolationCount(violations, 3);

// Assert message
ViolationAssertions.assertViolationMessage(violations, 'should not depend on');

// Assert file
ViolationAssertions.assertViolationInFile(violations, 'UserController.ts');
```

---

## Jest Matchers

Custom Jest matchers for more readable architectural tests.

### Setup

Add to your Jest setup file (`jest.setup.ts`):

```typescript
import { extendJestMatchers } from 'archunit-ts';

extendJestMatchers();
```

Or in `package.json`:

```json
{
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/jest.setup.ts"]
  }
}
```

### Available Matchers

#### `toHaveNoViolations()`

Assert that there are no architectural violations.

```typescript
const violations = rule.check(classes);

expect(violations).toHaveNoViolations();
```

**Output on failure:**
```
expected no violations but found 2:
  1. Controllers should not depend on Repositories
     at src/controllers/UserController.ts
  2. Service should end with 'Service' suffix
     at src/services/UserManager.ts
```

---

#### `toHaveViolationCount(count)`

Assert exact number of violations.

```typescript
expect(violations).toHaveViolationCount(3);
```

---

#### `toHaveViolationMatching(message)`

Assert at least one violation matches the message (string or regex).

```typescript
expect(violations).toHaveViolationMatching('should not depend on');
expect(violations).toHaveViolationMatching(/Controller.*Service/);
```

---

#### `toHaveViolationInFile(filePath)`

Assert at least one violation in the specified file.

```typescript
expect(violations).toHaveViolationInFile('UserController.ts');
```

---

#### `toHaveOnlyWarnings()`

Assert all violations are warnings (no errors).

```typescript
const warningRule = rule.asWarning();
const violations = warningRule.check(classes);

expect(violations).toHaveOnlyWarnings();
```

---

#### `toHaveOnlyErrors()`

Assert all violations are errors (no warnings).

```typescript
expect(violations).toHaveOnlyErrors();
```

---

## Test Suite Builder

Programmatically build test suites for multiple rules.

### Basic Usage

```typescript
import { createTestSuite } from 'archunit-ts';

createTestSuite({
  basePath: './src',
  patterns: ['**/*.ts'],
})
  .shouldPassRule(
    'Controllers should end with Controller',
    ArchRuleDefinition.classes()
      .that().resideInPackage('controllers')
      .should().haveSimpleNameEndingWith('Controller')
  )
  .shouldPassRule(
    'Services should end with Service',
    ArchRuleDefinition.classes()
      .that().resideInPackage('services')
      .should().haveSimpleNameEndingWith('Service')
  )
  .shouldFailRule(
    'Repositories should not access Controllers',
    ArchRuleDefinition.classes()
      .that().resideInPackage('repositories')
      .should().onlyDependOnClassesThat()
      .resideInAnyPackage('repositories', 'models'),
    { expectedCount: 2 }
  )
  .generateJestSuite('My Architecture Tests');
```

### Advanced Configuration

```typescript
createTestSuite({
  basePath: './src',
  patterns: ['**/*.ts'],
  failOnWarnings: true,
  beforeEach: async () => {
    console.log('Setting up test...');
  },
  afterEach: async () => {
    console.log('Cleaning up...');
  },
})
  .shouldPassAllRules([
    {
      description: 'Models should be immutable',
      rule: modelImmutabilityRule,
    },
    {
      description: 'Controllers should handle errors',
      rule: errorHandlingRule,
    },
  ])
  .generateJestSuite();
```

### Generate Reports

```typescript
const suite = createTestSuite({ basePath: './src' })
  .shouldPassRule('Rule 1', rule1)
  .shouldPassRule('Rule 2', rule2);

const report = await suite.generateReport();
console.log(report);
```

**Output:**
```markdown
# Architectural Test Report

**Summary**: 2 passed, 0 failed, 0 total violations

## Results

✅ **Rule 1**

✅ **Rule 2**
```

---

## Examples

### Example 1: Complete Test Suite

```typescript
import {
  ArchRuleDefinition,
  layeredArchitecture,
  extendJestMatchers,
  createTestSuite,
} from 'archunit-ts';

// Setup
extendJestMatchers();

// Define rules
const namingRules = [
  {
    description: 'Controllers should end with Controller',
    rule: ArchRuleDefinition.classes()
      .that().resideInPackage('controllers')
      .should().haveSimpleNameEndingWith('Controller'),
  },
  {
    description: 'Services should end with Service',
    rule: ArchRuleDefinition.classes()
      .that().resideInPackage('services')
      .should().haveSimpleNameEndingWith('Service'),
  },
];

const layeringRule = layeredArchitecture()
  .layer('Controllers').definedBy('controllers')
  .layer('Services').definedBy('services')
  .layer('Repositories').definedBy('repositories')
  .whereLayer('Controllers').mayOnlyAccessLayers('Services')
  .whereLayer('Services').mayOnlyAccessLayers('Repositories');

// Generate test suite
createTestSuite({
  basePath: './src',
  patterns: ['**/*.ts'],
})
  .shouldPassAllRules(namingRules)
  .shouldPassRule('Layering should be respected', layeringRule)
  .generateJestSuite('My Project Architecture');
```

### Example 2: Testing with Fixtures

```typescript
import {
  createTestFixture,
  createRuleTestHelper,
  ArchRuleDefinition,
} from 'archunit-ts';

describe('Naming Conventions', () => {
  const helper = createRuleTestHelper();

  const rule = ArchRuleDefinition.classes()
    .that().resideInPackage('services')
    .should().haveSimpleNameEndingWith('Service');

  it('should pass for correctly named services', () => {
    const fixture = createTestFixture()
      .addClass({
        name: 'UserService',
        filePath: 'src/services/UserService.ts',
      })
      .addClass({
        name: 'ProductService',
        filePath: 'src/services/ProductService.ts',
      })
      .build();

    helper.expectNoViolations(rule, fixture);
  });

  it('should fail for incorrectly named services', () => {
    const fixture = createTestFixture()
      .addClass({
        name: 'UserManager', // ❌ Should end with Service
        filePath: 'src/services/UserManager.ts',
      })
      .build();

    helper.expectViolationCount(rule, fixture, 1);
  });
});
```

### Example 3: Custom Matchers

```typescript
import { extendJestMatchers, ArchRuleDefinition } from 'archunit-ts';

extendJestMatchers();

describe('Architecture Rules', () => {
  it('should enforce dependency rules', async () => {
    const rule = ArchRuleDefinition.classes()
      .that().resideInPackage('domain')
      .should().onlyDependOnClassesThat()
      .resideInPackage('domain');

    const violations = await archUnit.checkRule('./src', rule);

    expect(violations).toHaveNoViolations();
  });

  it('should detect layering violations', async () => {
    const rule = layeredArchitecture()
      .layer('UI').definedBy('ui')
      .layer('Domain').definedBy('domain')
      .whereLayer('Domain').mayNotAccessLayers('UI');

    const violations = await archUnit.checkRule('./src', rule);

    expect(violations).toHaveViolationMatching('Domain.*UI');
    expect(violations).toHaveViolationInFile('DomainService.ts');
  });

  it('should handle warnings', async () => {
    const warningRule = rule.asWarning();
    const violations = await archUnit.checkRule('./src', warningRule);

    expect(violations).toHaveOnlyWarnings();
  });
});
```

### Example 4: Testing Event-Driven Architecture

```typescript
import {
  createTestFixture,
  eventDrivenArchitecture,
  createRuleTestHelper,
} from 'archunit-ts';

describe('Event-Driven Architecture', () => {
  const helper = createRuleTestHelper();

  it('should enforce event immutability', () => {
    const fixture = createTestFixture()
      .addClass({
        name: 'UserCreatedEvent',
        filePath: 'src/events/UserCreatedEvent.ts',
        properties: [
          { name: 'userId', type: 'string', isReadonly: true }, // ✅ Immutable
          { name: 'timestamp', type: 'Date', isReadonly: true },
        ],
      })
      .addClass({
        name: 'OrderPlacedEvent',
        filePath: 'src/events/OrderPlacedEvent.ts',
        properties: [
          { name: 'orderId', type: 'string', isReadonly: false }, // ❌ Mutable!
        ],
      })
      .build();

    const rule = eventDrivenArchitecture()
      .events('events')
      .publishers('publishers')
      .subscribers('subscribers');

    const violations = rule.check(fixture);

    expect(violations).toHaveViolationMatching('should have readonly properties');
    expect(violations).toHaveViolationInFile('OrderPlacedEvent.ts');
  });
});
```

---

## Best Practices

### 1. Use Fixtures for Unit Tests

```typescript
// ✅ GOOD: Fast unit tests with fixtures
it('should enforce naming', () => {
  const fixture = createTestFixture()
    .addClass({ name: 'UserService', filePath: 'services/UserService.ts' })
    .build();

  const violations = rule.check(fixture);
  expect(violations).toHaveNoViolations();
});

// ❌ AVOID: Slow tests analyzing real files for simple rules
it('should enforce naming', async () => {
  const classes = await analyzer.analyze('./src');
  const violations = rule.check(classes);
  expect(violations).toHaveNoViolations();
});
```

### 2. Use Real Code for Integration Tests

```typescript
// ✅ GOOD: Integration test with real codebase
describe('Architecture Integration Tests', () => {
  it('should respect all architectural rules', async () => {
    const violations = await archUnit.checkRules('./src', allRules);
    expect(violations).toHaveNoViolations();
  });
});
```

### 3. Organize Tests by Pattern

```typescript
describe('Architecture Tests', () => {
  describe('Naming Conventions', () => {
    // All naming tests here
  });

  describe('Layering Rules', () => {
    // All layering tests here
  });

  describe('Dependency Rules', () => {
    // All dependency tests here
  });
});
```

### 4. Use Test Suite Builder for CI

```typescript
// ci-architecture-test.ts
createTestSuite({
  basePath: './src',
  failOnWarnings: true, // Strict mode for CI
})
  .shouldPassAllRules(allArchitectureRules)
  .generateJestSuite('CI Architecture Validation');
```

### 5. Generate Reports for Documentation

```typescript
const suite = createTestSuite({ basePath: './src' })
  .shouldPassAllRules(rules);

const report = await suite.generateReport();

// Save to file
fs.writeFileSync('architecture-report.md', report);
```

---

## API Reference

### TestFixtureBuilder

```typescript
class TestFixtureBuilder {
  addClass(classData: ClassConfig): this;
  build(): TSClasses;
  reset(): this;
}

function createTestFixture(): TestFixtureBuilder;
```

### RuleTestHelper

```typescript
class RuleTestHelper {
  checkRule(rule: ArchRule, fixture: TSClasses): ArchitectureViolation[];
  async checkRuleAgainstCode(rule: ArchRule, basePath: string, patterns?: string[]): Promise<ArchitectureViolation[]>;
  expectNoViolations(rule: ArchRule, fixture: TSClasses): void;
  expectViolationCount(rule: ArchRule, fixture: TSClasses, count: number): void;
  expectViolationMessage(rule: ArchRule, fixture: TSClasses, message: string | RegExp): void;
}

function createRuleTestHelper(): RuleTestHelper;
```

### ViolationAssertions

```typescript
class ViolationAssertions {
  static assertNoViolations(violations: ArchitectureViolation[]): void;
  static assertViolationCount(violations: ArchitectureViolation[], expectedCount: number): void;
  static assertViolationMessage(violations: ArchitectureViolation[], expectedMessage: string | RegExp): void;
  static assertViolationInFile(violations: ArchitectureViolation[], filePath: string): void;
}
```

### Jest Matchers

```typescript
interface Matchers<R> {
  toHaveNoViolations(): R;
  toHaveViolationCount(count: number): R;
  toHaveViolationMatching(message: string | RegExp): R;
  toHaveViolationInFile(filePath: string): R;
  toHaveOnlyWarnings(): R;
  toHaveOnlyErrors(): R;
}

function extendJestMatchers(): void;
```

### TestSuiteBuilder

```typescript
class TestSuiteBuilder {
  shouldPassRule(description: string, rule: ArchRule): this;
  shouldFailRule(description: string, rule: ArchRule, options?: {...}): this;
  shouldPassAllRules(rules: Array<{description: string, rule: ArchRule}>): this;
  generateJestSuite(suiteName?: string): void;
  async generateReport(): Promise<string>;
}

function createTestSuite(config: TestSuiteConfig): TestSuiteBuilder;
function testRule(rule: ArchRule, basePath: string, options?: {...}): Promise<ArchitectureViolation[]>;
```

---

## Next Steps

- [Pattern Library](./PATTERN_LIBRARY.md) - Predefined architectural patterns
- [Rule Composition](./RULE_COMPOSITION.md) - Combine rules with logic
- [Violation Intelligence](./VIOLATION_INTELLIGENCE.md) - Smart analysis
- [Architectural Metrics](./ARCHITECTURAL_METRICS.md) - Measure quality
