# ArchUnit Java vs ArchUnitNode Comparison

## Executive Summary

This document compares ArchUnitNode with ArchUnit Java to identify missing features and ensure API parity.

## Current ArchUnitNode Fluent API Coverage

### ✅ Implemented "That" Methods (13 methods)

1. `resideInPackage(pattern)` - Filter by package
2. `resideInAnyPackage(...patterns)` - Filter by multiple packages
3. `resideOutsidePackage(pattern)` - Filter excluding package
4. `areAnnotatedWith(decorator)` - Filter by decorator
5. `areNotAnnotatedWith(decorator)` - Filter excluding decorator
6. `haveSimpleNameMatching(pattern)` - Filter by name pattern
7. `haveSimpleNameEndingWith(suffix)` - Filter by name suffix
8. `haveSimpleNameStartingWith(prefix)` - Filter by name prefix
9. `areAssignableTo(className)` - Filter by inheritance/implementation
10. `implement(interfaceName)` - Filter by interface implementation
11. `extend(className)` - Filter by class extension
12. `areInterfaces()` - Filter interfaces only
13. `areAbstract()` - Filter abstract classes

### ✅ Implemented "Should" Methods (13 methods)

1. `resideInPackage(pattern)` - Assert package location
2. `resideOutsideOfPackage(pattern)` - Assert outside package
3. `resideInAnyPackage(...patterns)` - Assert in any package
4. `beAnnotatedWith(decorator)` - Assert has decorator
5. `notBeAnnotatedWith(decorator)` - Assert lacks decorator
6. `haveSimpleNameMatching(pattern)` - Assert name pattern
7. `haveSimpleNameEndingWith(suffix)` - Assert name suffix
8. `haveSimpleNameStartingWith(prefix)` - Assert name prefix
9. `onlyDependOnClassesThat()` - Assert allowed dependencies
10. `notDependOnClassesThat()` - Assert forbidden dependencies
11. `notFormCycles()` - Assert acyclic dependencies
12. `asWarning()` - Set warning severity
13. `asError()` - Set error severity

## Missing Fluent API Methods from ArchUnit Java

### 🔴 Missing "That" Methods (Need to Add)

#### Visibility/Modifiers

1. `arePublic()` - Filter public classes
2. `areNotPublic()` - Filter non-public classes
3. `arePrivate()` - Filter private members (applicable to methods/properties)
4. `areProtected()` - Filter protected members
5. `arePackagePrivate()` - N/A in TypeScript (no package-private concept)
6. `areStatic()` - Filter static members
7. `areFinal()` - N/A in TypeScript (use readonly for properties)

#### Type Checks

8. `areEnums()` - Filter enums
9. `areRecords()` - N/A in TypeScript (no records)
10. `areTopLevelClasses()` - Filter top-level vs nested classes
11. `areNestedClasses()` - Filter nested classes
12. `areMemberClasses()` - Filter member classes
13. `areLocalClasses()` - N/A in TypeScript
14. `areAnonymousClasses()` - Filter anonymous classes

#### Annotations/Decorators (Enhanced)

15. `areMetaAnnotatedWith(annotation)` - Meta-decorators
16. `areAnnotatedWith(annotation, predicate)` - Decorator with predicate
17. `haveDecorator(decorator)` - Alias for areAnnotatedWith

#### Methods/Fields

18. `haveFieldWith(predicate)` - Filter classes with specific fields
19. `haveMethodWith(predicate)` - Filter classes with specific methods
20. `declareField(name, type)` - Filter by field declaration
21. `declareMethod(name, params)` - Filter by method declaration
22. `containNumberOfElements(count)` - Filter by size

#### Access/Dependencies

23. `accessField(className, fieldName)` - Filter by field access
24. `callMethod(className, methodName)` - Filter by method calls
25. `accessClassesThat()` - Filter by accessed classes
26. `onlyAccessClassesThat()` - Filter by exclusive access
27. `haveFullyQualifiedName(name)` - Filter by FQN
28. `haveNameMatching(pattern)` - Alternative name matching

### 🔴 Missing "Should" Methods (Need to Add)

#### Visibility Assertions

1. `bePublic()` - Assert public access
2. `notBePublic()` - Assert non-public
3. `bePrivate()` - Assert private access
4. `beProtected()` - Assert protected access
5. `beStatic()` - Assert static
6. `notBeStatic()` - Assert non-static
7. `beFinal()` - Assert readonly/final

#### Type Assertions

8. `beInterfaces()` - Assert are interfaces
9. `notBeInterfaces()` - Assert not interfaces
10. `beEnums()` - Assert are enums
11. `beTopLevelClasses()` - Assert top-level
12. `beAbstract()` - Assert abstract
13. `notBeAbstract()` - Assert concrete

#### Member Assertions

14. `haveOnlyFinalFields()` - Assert all fields are readonly
15. `haveOnlyPrivateConstructors()` - Assert private constructors
16. `haveOnlyPublicMethods()` - Assert all methods public
17. `notHaveFields(predicate)` - Assert no matching fields
18. `notHaveMethods(predicate)` - Assert no matching methods
19. `containNumberOfElements(count)` - Assert size

#### Access/Call Assertions

20. `onlyAccessClassesThat()` - Assert exclusive access
21. `onlyCallMethodsThat()` - Assert exclusive method calls
22. `notAccessField(className, fieldName)` - Assert no field access
23. `notCallMethod(className, methodName)` - Assert no method calls
24. `notCallConstructor(className)` - Assert no constructor calls
25. `onlyBeAccessed().byClassesThat()` - Assert access restrictions
26. `onlyHaveDependentClassesThat()` - Assert dependent restrictions

#### Special Rules

27. `beAssignableTo(type)` - Assert inheritance/implementation
28. `notBeAssignableTo(type)` - Assert not assignable
29. `beAssignableFrom(type)` - Assert can be assigned from
30. `haveFullyQualifiedName(name)` - Assert FQN
31. `haveSimpleName(name)` - Assert exact simple name
32. `notDependOn(className)` - Assert no specific dependency
33. `dependOn(className)` - Assert specific dependency
34. `transitivelyDependOn(className)` - Assert transitive dependency

## Rule Templates Comparison

### ✅ Current Rule Templates (10)

1. `serviceNamingConvention()` - Services end with 'Service'
2. `controllerNamingConvention()` - Controllers end with 'Controller'
3. `repositoryNamingConvention()` - Repositories end with 'Repository'
4. `dtoNamingConvention()` - DTOs end with 'DTO'/'Dto'
5. `validatorNamingConvention()` - Validators end with 'Validator'
6. `middlewareNamingConvention()` - Middleware end with 'Middleware'
7. `guardNamingConvention()` - Guards end with 'Guard'
8. `eventHandlerNamingConvention()` - Handlers end with 'Handler'
9. `factoryNamingConvention()` - Factories end with 'Factory'
10. `controllersShouldNotDependOnRepositories()` - Dependency rule

### 🟡 Missing Common Rule Templates from ArchUnit Java

#### Naming Patterns

11. `entityNamingConvention()` - Entities end with 'Entity'
12. `valueObjectNamingConvention()` - Value objects end with 'VO'
13. `exceptionNamingConvention()` - Exceptions end with 'Exception'
14. `interfaceNamingConvention()` - Interfaces start with 'I' (configurable)
15. `abstractClassNamingConvention()` - Abstract classes start with 'Abstract'
16. `testClassNamingConvention()` - Test classes end with 'Test'/'Spec'
17. `utilityClassNamingConvention()` - Utility classes end with 'Utils'/'Helper'

#### Dependency Rules

18. `noClassesShouldDependUpperPackages()` - Prevent upward dependencies
19. `noClassesShouldAccessStandardStreams()` - No System.out/err (console.log)
20. `noClassesShouldThrowGenericExceptions()` - No generic throws
21. `noClassesShouldUseJavaUtilLogging()` - Enforce logging framework
22. `noClassesShouldUseFieldInjection()` - Prefer constructor injection
23. `repositoriesShouldNotDependOnServices()` - Dependency direction
24. `servicesShouldNotDependOnControllers()` - Layering rule

#### Decorator/Annotation Rules

25. `springComponentsShouldBeAnnotated()` - Framework decorators
26. `persistenceLayerShouldUseRepositoryAnnotation()` - Data layer
27. `serviceLayerShouldUseServiceAnnotation()` - Service layer

#### Architectural Patterns

28. `utilityClassesShouldNotHavePublicConstructors()` - Utility pattern
29. `utilityClassesShouldBeFinal()` - Utility immutability
30. `singletonsShouldHavePrivateConstructors()` - Singleton pattern
31. `immutablesShouldBeFinal()` - Immutability enforcement
32. `buildersShouldEndWithBuilder()` - Builder pattern

## Implementation Priority

### Phase 1: Critical Missing Fluent API Methods (High Priority)

- [x] Basic "that" and "should" methods (DONE)
- [ ] `bePublic()`, `bePrivate()`, `beProtected()` - Visibility assertions
- [ ] `beStatic()`, `notBeStatic()` - Static assertions
- [ ] `beInterfaces()`, `beEnums()` - Type assertions
- [ ] `beAssignableTo()`, `notBeAssignableTo()` - Inheritance assertions
- [ ] `haveFullyQualifiedName()`, `haveSimpleName()` - Name assertions

### Phase 2: Essential Rule Templates (High Priority)

- [x] Basic naming conventions (DONE)
- [ ] Entity, Exception, Test naming conventions
- [ ] Common dependency rules
- [ ] Framework decorator rules

### Phase 3: Advanced Features (Medium Priority)

- [ ] Field and method access tracking
- [ ] Call graph analysis
- [ ] Transitive dependency checking
- [ ] Access restrictions (onlyBeAccessed API)

### Phase 4: Special Patterns (Low Priority)

- [ ] Utility class patterns
- [ ] Singleton patterns
- [ ] Builder patterns
- [ ] Meta-decorator support

## TypeScript-Specific Enhancements

### Unique to TypeScript (Not in Java)

1. Type guard checking
2. Generic type parameter validation
3. Decorator factory validation
4. Module system (ESM vs CommonJS)
5. Namespace validation
6. Ambient declaration checking
7. Type assertion validation

### Implementation Notes

- Some Java concepts don't map to TypeScript (package-private, records, final classes)
- TypeScript has different visibility model (public by default)
- Decorators work differently than Java annotations
- Need to handle both class-based and functional components
- Module resolution is more complex than Java packages

## Quality Metrics

### Test Coverage Target

- Fluent API methods: 100% coverage
- Rule Templates: 100% coverage
- Integration tests: All architectural patterns
- Edge cases: Error handling, invalid inputs

### Documentation Requirements

- API reference for all new methods
- Examples for each rule template
- Migration guide from ArchUnit Java
- Best practices guide

## Conclusion

ArchUnitNode has solid foundations with:

- ✅ 26 core fluent API methods
- ✅ 10 rule templates
- ✅ 9 architectural pattern templates
- ✅ Comprehensive testing infrastructure

To achieve parity with ArchUnit Java, we need to:

- 🔴 Add ~40 missing fluent API methods
- 🔴 Add ~25 common rule templates
- 🔴 Implement advanced dependency tracking
- 🔴 Enhance documentation

Estimated implementation: 2-3 days for full parity
