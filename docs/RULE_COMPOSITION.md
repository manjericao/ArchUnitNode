# Rule Composition Guide

ArchUnit-TS supports powerful rule composition capabilities, allowing you to combine multiple architectural rules using logical operators (AND, OR, NOT, XOR). This enables you to express complex architectural constraints that go beyond simple single-rule checks.

## Table of Contents

- [Overview](#overview)
- [Basic Composition](#basic-composition)
  - [AND Composition](#and-composition)
  - [OR Composition](#or-composition)
  - [NOT Composition](#not-composition)
  - [XOR Composition](#xor-composition)
- [Advanced Patterns](#advanced-patterns)
- [Fluent API Composition](#fluent-api-composition)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Overview

Rule composition allows you to create complex architectural rules by combining simpler rules with logical operators. This is useful when your architectural constraints cannot be expressed as a single rule.

**Available Operators:**
- **AND** - All rules must pass
- **OR** - At least one rule must pass
- **NOT** - Rule must fail (inverted logic)
- **XOR** - Exactly one rule must pass

---

## Basic Composition

### AND Composition

Use `allOf()` when **all** rules must be satisfied.

```typescript
import { ArchRuleDefinition, RuleComposer } from 'archunit-ts';

// Method 1: Using ArchRuleDefinition.allOf()
const rule = ArchRuleDefinition.allOf([
  classes().that().resideInPackage('services')
    .should().haveSimpleNameEndingWith('Service'),
  classes().that().resideInPackage('services')
    .should().beAnnotatedWith('Injectable')
]);

// Method 2: Using RuleComposer.allOf()
const rule = RuleComposer.allOf([
  serviceNamingRule,
  serviceDecoratorRule
]);

// Method 3: Using .and() method
const rule = serviceNamingRule.and(serviceDecoratorRule);
```

**Behavior:**
- Returns violations from **all** rules that failed
- Passes only if **all** child rules pass

**Use Case:** Enforce multiple constraints simultaneously
```typescript
// Services must have correct naming AND correct decorator AND not depend on controllers
const strictServiceRule = ArchRuleDefinition.allOf([
  classes().that().resideInPackage('services')
    .should().haveSimpleNameEndingWith('Service'),
  classes().that().resideInPackage('services')
    .should().beAnnotatedWith('Injectable'),
  classes().that().resideInPackage('services')
    .should().notDependOnClassesThat().resideInPackage('controllers')
]);
```

---

### OR Composition

Use `anyOf()` when **at least one** rule must be satisfied.

```typescript
// Method 1: Using ArchRuleDefinition.anyOf()
const rule = ArchRuleDefinition.anyOf([
  classes().that().resideInPackage('api')
    .should().beAnnotatedWith('Controller'),
  classes().that().resideInPackage('api')
    .should().haveSimpleNameEndingWith('Controller')
]);

// Method 2: Using RuleComposer.anyOf()
const rule = RuleComposer.anyOf([
  decoratorRule,
  namingRule
]);

// Method 3: Using .or() method
const rule = decoratorRule.or(namingRule);
```

**Behavior:**
- Passes if **any** child rule passes (has no violations)
- Returns violations only if **all** child rules fail
- Violations include branch information for debugging

**Use Case:** Accept multiple valid patterns
```typescript
// Controllers can EITHER have @Controller decorator OR end with 'Controller'
const flexibleControllerRule = ArchRuleDefinition.anyOf([
  classes().that().resideInPackage('controllers')
    .should().beAnnotatedWith('Controller'),
  classes().that().resideInPackage('controllers')
    .should().haveSimpleNameEndingWith('Controller')
]);
```

---

### NOT Composition

Use `not()` to invert a rule - it passes when the original rule would fail.

```typescript
// Method 1: Using ArchRuleDefinition.not()
const rule = ArchRuleDefinition.not(
  classes().that().resideInPackage('internal')
    .should().bePublic()
);

// Method 2: Using RuleComposer.not()
const rule = RuleComposer.not(internalClassesArePublic);
```

**Behavior:**
- Passes if the child rule **fails** (has violations)
- Fails if the child rule **passes** (no violations)
- Useful for forbidding certain patterns

**Use Case:** Ensure a pattern does NOT exist
```typescript
// Internal packages should NOT have public classes
const noPublicInternalsRule = ArchRuleDefinition.not(
  classes().that().resideInPackage('internal')
    .should().bePublic()
);

// Domain layer should NOT depend on infrastructure
const cleanDomainRule = ArchRuleDefinition.not(
  classes().that().resideInPackage('domain')
    .should().dependOnClassesThat().resideInPackage('infrastructure')
);
```

---

### XOR Composition

Use `xor()` when **exactly one** rule must pass (exclusive OR).

```typescript
const rule = ArchRuleDefinition.xor([
  classes().that().resideInPackage('models')
    .should().beAnnotatedWith('Entity'),
  classes().that().resideInPackage('models')
    .should().beAnnotatedWith('ValueObject')
]);

// Using RuleComposer
const rule = RuleComposer.xor([
  entityRule,
  valueObjectRule
]);
```

**Behavior:**
- Passes only if **exactly one** child rule passes
- Fails if **zero** or **more than one** rule passes

**Use Case:** Enforce mutual exclusivity
```typescript
// Each model must be EITHER an Entity OR a ValueObject, but not both
const exclusiveModelTypeRule = ArchRuleDefinition.xor([
  classes().that().resideInPackage('models')
    .should().beAnnotatedWith('Entity'),
  classes().that().resideInPackage('models')
    .should().beAnnotatedWith('ValueObject')
]);
```

---

## Advanced Patterns

### Nested Composition

Combine operators to create complex logical expressions:

```typescript
// (A OR B) AND NOT(C)
const complexRule = ArchRuleDefinition.allOf([
  ArchRuleDefinition.anyOf([
    ruleA,
    ruleB
  ]),
  ArchRuleDefinition.not(ruleC)
]);

// Real-world example:
// Controllers must (have @Controller OR end with 'Controller')
// AND NOT depend on repositories
const smartControllerRule = ArchRuleDefinition.allOf([
  ArchRuleDefinition.anyOf([
    classes().that().resideInPackage('controllers')
      .should().beAnnotatedWith('Controller'),
    classes().that().resideInPackage('controllers')
      .should().haveSimpleNameEndingWith('Controller')
  ]),
  ArchRuleDefinition.not(
    classes().that().resideInPackage('controllers')
      .should().dependOnClassesThat().resideInPackage('repositories')
  )
]);
```

### Multi-Level Nesting

```typescript
// ((A OR B) AND (C OR D)) AND NOT(E OR F)
const deepRule = ArchRuleDefinition.allOf([
  ArchRuleDefinition.allOf([
    ArchRuleDefinition.anyOf([ruleA, ruleB]),
    ArchRuleDefinition.anyOf([ruleC, ruleD])
  ]),
  ArchRuleDefinition.not(
    ArchRuleDefinition.anyOf([ruleE, ruleF])
  )
]);
```

---

## Fluent API Composition

The fluent API supports inline composition:

```typescript
// Using .or() in fluent chain
const rule = classes().that().resideInPackage('api')
  .should().beAnnotatedWith('Controller')
  .or()
  .should().haveSimpleNameEndingWith('Controller');

// Using .and() to combine rules
const rule1 = classes().that().resideInPackage('services')
  .should().haveSimpleNameEndingWith('Service');

const rule2 = classes().that().resideInPackage('services')
  .should().beAnnotatedWith('Injectable');

const combinedRule = rule1.and(rule2);

// Using .or() to combine rules
const combinedRule = rule1.or(rule2);
```

---

## Best Practices

### 1. Keep Rules Readable

```typescript
// ❌ Hard to understand
const rule = ArchRuleDefinition.allOf([
  ArchRuleDefinition.anyOf([r1, r2]),
  ArchRuleDefinition.not(ArchRuleDefinition.anyOf([r3, r4]))
]);

// ✅ Better: Break into named components
const hasValidNaming = ArchRuleDefinition.anyOf([
  controllerDecoratorRule,
  controllerNamingRule
]);

const noForbiddenDependencies = ArchRuleDefinition.not(
  ArchRuleDefinition.anyOf([
    dependsOnRepositories,
    dependsOnInfrastructure
  ])
);

const strictControllerRule = ArchRuleDefinition.allOf([
  hasValidNaming,
  noForbiddenDependencies
]);
```

### 2. Provide Clear Descriptions

```typescript
const rule = ArchRuleDefinition.anyOf([
  decoratorRule,
  namingRule
], 'Controllers must have @Controller decorator OR end with Controller suffix');
```

### 3. Use Appropriate Severity

```typescript
// Warning for style preferences
const styleRule = ArchRuleDefinition.anyOf([...])
  .asWarning();

// Error for critical architecture violations
const criticalRule = ArchRuleDefinition.allOf([...])
  .asError();
```

### 4. Test Composite Rules

```typescript
import { createMockClasses, testRule } from 'archunit-ts/testing';

describe('Composite Rules', () => {
  it('should enforce controller naming or decorator', () => {
    const mockClasses = createMockClasses([
      { name: 'UserController', package: 'controllers' },
      { name: 'User', package: 'controllers', decorators: ['Controller'] }
    ]);

    const violations = compositeRule.check(mockClasses);
    expect(violations).toHaveLength(0); // Both patterns are valid
  });
});
```

---

## Examples

### Example 1: Clean Architecture Layers

```typescript
// Domain layer must not depend on outer layers
const domainIsolation = ArchRuleDefinition.not(
  ArchRuleDefinition.anyOf([
    classes().that().resideInPackage('domain')
      .should().dependOnClassesThat().resideInPackage('application'),
    classes().that().resideInPackage('domain')
      .should().dependOnClassesThat().resideInPackage('infrastructure'),
    classes().that().resideInPackage('domain')
      .should().dependOnClassesThat().resideInPackage('presentation')
  ])
);
```

### Example 2: Service Layer Conventions

```typescript
// Services must follow naming AND decorator conventions
// AND must not depend on controllers or presentation
const serviceConventions = ArchRuleDefinition.allOf([
  classes().that().resideInPackage('services')
    .should().haveSimpleNameEndingWith('Service'),
  classes().that().resideInPackage('services')
    .should().beAnnotatedWith('Injectable'),
  ArchRuleDefinition.not(
    classes().that().resideInPackage('services')
      .should().dependOnClassesThat().resideInPackage('controllers')
  )
]);
```

### Example 3: Test File Conventions

```typescript
// Test files must either:
// - Reside in __tests__ directory OR
// - Have filename ending with .test.ts/.spec.ts
const testFileConvention = ArchRuleDefinition.anyOf([
  classes().that().resideInPackage('__tests__')
    .should().haveSimpleNameMatching(/.*/),
  classes().that().haveSimpleNameMatching(/\.(test|spec)\.ts$/)
    .should().haveSimpleNameMatching(/.*/
]);
```

### Example 4: Repository Pattern

```typescript
// Repositories must have correct naming AND decorator
// AND must only be accessed by services, not controllers
const repositoryPattern = ArchRuleDefinition.allOf([
  classes().that().resideInPackage('repositories')
    .should().haveSimpleNameEndingWith('Repository'),
  classes().that().resideInPackage('repositories')
    .should().beAnnotatedWith('Repository'),
  ArchRuleDefinition.not(
    classes().that().resideInPackage('controllers')
      .should().dependOnClassesThat().resideInPackage('repositories')
  )
]);
```

---

## API Reference

### Static Methods

#### `ArchRuleDefinition.allOf(rules, description?)`
Combines rules with AND logic.

**Parameters:**
- `rules: ArchRule[]` - Array of rules to combine
- `description?: string` - Optional custom description

**Returns:** `ArchRule` - Composite rule

---

#### `ArchRuleDefinition.anyOf(rules, description?)`
Combines rules with OR logic.

**Parameters:**
- `rules: ArchRule[]` - Array of rules to combine
- `description?: string` - Optional custom description

**Returns:** `ArchRule` - Composite rule

---

#### `ArchRuleDefinition.not(rule, description?)`
Inverts a rule.

**Parameters:**
- `rule: ArchRule` - Rule to negate
- `description?: string` - Optional custom description

**Returns:** `ArchRule` - Negated rule

---

#### `ArchRuleDefinition.xor(rules, description?)`
Combines rules with XOR logic.

**Parameters:**
- `rules: ArchRule[]` - Array of rules to combine
- `description?: string` - Optional custom description

**Returns:** `ArchRule` - Composite rule

---

### Instance Methods

#### `.and(otherRule)`
Combines two rules with AND logic.

```typescript
const combined = rule1.and(rule2);
```

---

#### `.or(otherRule)`
Combines two rules with OR logic.

```typescript
const combined = rule1.or(rule2);
```

---

## Troubleshooting

### Violations Show "OR branch X/Y"

This is normal for OR composition. It shows which branches of the OR failed:

```
[OR branch 1/2] Class 'UserService' is not annotated with @Injectable
[OR branch 2/2] Class 'UserService' does not have simple name ending with 'Service'
```

Both branches failed, so the OR rule fails.

### NOT Rule Always Fails

Remember: NOT inverts the logic. If the original rule passes (no violations), NOT fails.

```typescript
// This passes when classes ARE public
const publicRule = classes().that().resideInPackage('api').should().bePublic();

// This passes when classes are NOT public
const notPublicRule = ArchRuleDefinition.not(publicRule);
```

---

## Next Steps

- [Architectural Metrics](./ARCHITECTURAL_METRICS.md) - Learn about coupling and cohesion analysis
- [Testing Guide](./TESTING.md) - Test your composite rules
- [Patterns Library](./PATTERNS.md) - Predefined architectural patterns using composition
