# API Documentation

Complete API reference for ArchUnit-TS.

## Table of Contents

- [Core Classes](#core-classes)
- [Rule Definition](#rule-definition)
- [Architecture Patterns](#architecture-patterns)
- [Analyzers](#analyzers)
- [Types](#types)

## Core Classes

### ArchUnitTS

Main entry point for the library.

```typescript
class ArchUnitTS {
  constructor()

  async analyzeCode(
    basePath: string,
    patterns?: string[]
  ): Promise<TSClasses>

  getAnalyzer(): CodeAnalyzer

  async checkRule(
    basePath: string,
    rule: ArchRule | StaticArchRule,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]>

  async checkRules(
    basePath: string,
    rules: Array<ArchRule | StaticArchRule>,
    patterns?: string[]
  ): Promise<ArchitectureViolation[]>

  static assertNoViolations(
    violations: ArchitectureViolation[]
  ): void
}
```

### TSClass

Represents a TypeScript/JavaScript class.

```typescript
class TSClass {
  readonly name: string
  readonly filePath: string
  readonly module: string
  readonly extends?: string
  readonly implements: string[]
  readonly decorators: TSDecorator[]
  readonly methods: TSMethod[]
  readonly properties: TSProperty[]
  readonly isAbstract: boolean
  readonly isExported: boolean

  residesInPackage(packagePattern: string): boolean
  isAnnotatedWith(decoratorName: string): boolean
  hasSimpleName(name: string): boolean
  hasSimpleNameMatching(pattern: RegExp | string): boolean
  isAssignableTo(className: string): boolean
  hasSimpleNameEndingWith(suffix: string): boolean
  hasSimpleNameStartingWith(prefix: string): boolean
  getDependencies(): string[]
}
```

### TSClasses

Collection of TypeScript classes with filtering.

```typescript
class TSClasses {
  constructor(classes?: TSClass[])

  getAll(): TSClass[]
  that(predicate: PredicateFunction<TSClass>): TSClasses
  resideInPackage(packagePattern: string): TSClasses
  areAnnotatedWith(decoratorName: string): TSClasses
  haveSimpleNameMatching(pattern: RegExp | string): TSClasses
  haveSimpleNameEndingWith(suffix: string): TSClasses
  haveSimpleNameStartingWith(prefix: string): TSClasses
  areAssignableTo(className: string): TSClasses
  size(): number
  isEmpty(): boolean
  add(tsClass: TSClass): void
  merge(other: TSClasses): TSClasses
}
```

## Rule Definition

### ArchRuleDefinition

Static factory for creating architecture rules.

```typescript
class ArchRuleDefinition {
  static classes(): ClassesSelector
  static noClasses(): NoClassesSelector
  static allClasses(): ClassesShould
}
```

### ClassesSelector

```typescript
class ClassesSelector {
  that(): ClassesThatStatic
  should(): ClassesShould
}
```

### ClassesThatStatic

Filter classes before analysis.

```typescript
class ClassesThatStatic {
  resideInPackage(packagePattern: string): ClassesShouldStatic
  resideInAnyPackage(...packagePatterns: string[]): ClassesShouldStatic
  areAnnotatedWith(decoratorName: string): ClassesShouldStatic
  haveSimpleNameMatching(pattern: RegExp | string): ClassesShouldStatic
  haveSimpleNameEndingWith(suffix: string): ClassesShouldStatic
  haveSimpleNameStartingWith(prefix: string): ClassesShouldStatic
  areAssignableTo(className: string): ClassesShouldStatic
}
```

### ClassesShouldStatic

Define conditions for filtered classes.

```typescript
class ClassesShouldStatic {
  resideInPackage(packagePattern: string): StaticArchRule
  beAnnotatedWith(decoratorName: string): StaticArchRule
  notBeAnnotatedWith(decoratorName: string): StaticArchRule
  haveSimpleNameMatching(pattern: RegExp | string): StaticArchRule
  haveSimpleNameEndingWith(suffix: string): StaticArchRule
  onlyDependOnClassesThat(): StaticClassesDependencyShould
  notDependOnClassesThat(): StaticClassesDependencyShould
}
```

### ClassesThat

Filter classes after analysis (runtime).

```typescript
class ClassesThat {
  resideInPackage(packagePattern: string): ClassesShould
  resideOutsideOfPackage(packagePattern: string): ClassesShould
  areAnnotatedWith(decoratorName: string): ClassesShould
  areNotAnnotatedWith(decoratorName: string): ClassesShould
  haveSimpleNameMatching(pattern: RegExp | string): ClassesShould
  haveSimpleNameEndingWith(suffix: string): ClassesShould
  haveSimpleNameStartingWith(prefix: string): ClassesShould
  areAssignableTo(className: string): ClassesShould
  implement(interfaceName: string): ClassesShould
  extend(className: string): ClassesShould
}
```

### ClassesShould

Define assertions for classes.

```typescript
class ClassesShould {
  resideInPackage(packagePattern: string): ArchRule
  resideOutsideOfPackage(packagePattern: string): ArchRule
  beAnnotatedWith(decoratorName: string): ArchRule
  notBeAnnotatedWith(decoratorName: string): ArchRule
  haveSimpleNameMatching(pattern: RegExp | string): ArchRule
  haveSimpleNameEndingWith(suffix: string): ArchRule
  haveSimpleNameStartingWith(prefix: string): ArchRule
  onlyDependOnClassesThat(): ClassesDependencyShould
  notDependOnClassesThat(): ClassesDependencyShould
}
```

### ArchRule

Interface for architecture rules.

```typescript
interface ArchRule {
  check(classes: TSClasses): ArchitectureViolation[]
  getDescription(): string
}
```

## Architecture Patterns

### LayeredArchitecture

Define and check layered architecture.

```typescript
class LayeredArchitecture extends BaseArchRule {
  consideringAllDependencies(): this
  consideringOnlyDependenciesInLayers(): this
  layer(name: string): LayerDefinition
  whereLayer(layerName: string): LayerAccessRuleBuilder
  check(classes: TSClasses): ArchitectureViolation[]
}
```

### LayerDefinition

Define a layer in layered architecture.

```typescript
class LayerDefinition {
  definedBy(...packages: string[]): LayeredArchitecture
}
```

### LayerAccessRuleBuilder

Define access rules between layers.

```typescript
class LayerAccessRuleBuilder {
  mayOnlyBeAccessedByLayers(...layerNames: string[]): LayeredArchitecture
  mayNotBeAccessedByLayers(...layerNames: string[]): LayeredArchitecture
  mayOnlyAccessLayers(...layerNames: string[]): LayeredArchitecture
  mayNotAccessLayers(...layerNames: string[]): LayeredArchitecture
}
```

### Architectures

Factory for predefined architecture patterns.

```typescript
class Architectures {
  static layeredArchitecture(): LayeredArchitecture
  static onionArchitecture(): OnionArchitecture
}
```

### OnionArchitecture

Define onion/hexagonal architecture.

```typescript
class OnionArchitecture {
  domainModels(...packages: string[]): this
  applicationServices(...packages: string[]): this
  adapter(adapterName: string): AdapterBuilder
  toLayeredArchitecture(): LayeredArchitecture
}
```

## Analyzers

### CodeAnalyzer

Analyzes TypeScript/JavaScript code.

```typescript
class CodeAnalyzer {
  constructor()

  async analyze(
    basePath: string,
    patterns?: string[]
  ): Promise<TSClasses>

  getDependencies(): Dependency[]
  getModules(): Map<string, TSModule>
  findCyclicDependencies(): string[][]
}
```

### TypeScriptParser

Parses TypeScript/JavaScript files.

```typescript
class TypeScriptParser {
  parseFile(filePath: string): TSModule
}
```

## Types

### SourceLocation

```typescript
interface SourceLocation {
  filePath: string
  line: number
  column: number
}
```

### TSImport

```typescript
interface TSImport {
  source: string
  specifiers: string[]
  isDefault: boolean
  isNamespace: boolean
  location: SourceLocation
}
```

### TSExport

```typescript
interface TSExport {
  name: string
  isDefault: boolean
  location: SourceLocation
}
```

### TSDecorator

```typescript
interface TSDecorator {
  name: string
  arguments: unknown[]
  location: SourceLocation
}
```

### TSMethod

```typescript
interface TSMethod {
  name: string
  parameters: string[]
  returnType?: string
  isPublic: boolean
  isPrivate: boolean
  isProtected: boolean
  isStatic: boolean
  isAsync: boolean
  decorators: TSDecorator[]
  location: SourceLocation
}
```

### TSProperty

```typescript
interface TSProperty {
  name: string
  type?: string
  isPublic: boolean
  isPrivate: boolean
  isProtected: boolean
  isStatic: boolean
  isReadonly: boolean
  decorators: TSDecorator[]
  location: SourceLocation
}
```

### TSModule

```typescript
interface TSModule {
  name: string
  filePath: string
  imports: TSImport[]
  exports: TSExport[]
  classes: TSClass[]
  interfaces: TSInterface[]
  functions: TSFunction[]
}
```

### Dependency

```typescript
interface Dependency {
  from: string
  to: string
  type: 'import' | 'inheritance' | 'implementation' | 'usage'
  location: SourceLocation
}
```

### ArchitectureViolation

```typescript
interface ArchitectureViolation {
  message: string
  filePath: string
  location?: SourceLocation
  rule: string
}
```

### PredicateFunction

```typescript
type PredicateFunction<T> = (item: T) => boolean
```

### ConditionFunction

```typescript
type ConditionFunction<T> = (item: T) => boolean
```

## Factory Functions

### createArchUnit

```typescript
function createArchUnit(): ArchUnitTS
```

### layeredArchitecture

```typescript
function layeredArchitecture(): LayeredArchitecture
```

## Convenience Exports

```typescript
const { classes, noClasses, allClasses } = ArchRuleDefinition
```

## Usage Examples

### Basic Rule

```typescript
import { ArchRuleDefinition } from 'archunit-ts';

const rule = ArchRuleDefinition.classes()
  .that()
  .haveSimpleNameEndingWith('Service')
  .should()
  .resideInPackage('services');
```

### Complex Rule

```typescript
import { ArchRuleDefinition } from 'archunit-ts';

const rule = ArchRuleDefinition.classes()
  .that()
  .resideInPackage('domain')
  .and()
  .areAnnotatedWith('Entity')
  .should()
  .notDependOnClassesThat()
  .resideInAnyPackage('infrastructure', 'presentation');
```

### Layered Architecture

```typescript
import { layeredArchitecture } from 'archunit-ts';

const architecture = layeredArchitecture()
  .layer('UI').definedBy('presentation', 'ui')
  .layer('Application').definedBy('application', 'services')
  .layer('Domain').definedBy('domain', 'model')
  .layer('Infrastructure').definedBy('infrastructure', 'persistence')
  .whereLayer('UI').mayOnlyAccessLayers('Application')
  .whereLayer('Application').mayOnlyAccessLayers('Domain')
  .whereLayer('Domain').mayNotAccessLayers('Application', 'UI', 'Infrastructure');
```
