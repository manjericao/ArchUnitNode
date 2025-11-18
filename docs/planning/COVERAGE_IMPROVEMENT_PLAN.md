# ArchUnitNode - Code Coverage Improvement Plan

## Deep Analysis & Path to 80% Coverage

**Generated:** 2025-11-18
**Current Coverage:** 49.04%
**Target Coverage:** 80%
**Tests Status:** ✅ All 378 tests passing (25 test suites)

---

## 📊 Executive Summary

The ArchUnitNode framework is **production-ready** with excellent architecture and comprehensive features. However, test coverage needs significant improvement to meet the 80% target. This document outlines a strategic, prioritized plan to achieve this goal.

### Current Status

- **All tests passing:** 378 tests across 25 suites ✅
- **Overall coverage:** 49.04% (need +30.96 percentage points)
- **Well-covered modules:** Cache (90.62%), Parser (93.68%), Reports (92.82%), Timeline (86.12%)
- **Critical gaps:** Testing utilities (7.01%), Framework detection (4.81%), Config (8.62%)

---

## 🎯 Coverage Breakdown by Module

### Excellent Coverage (>80%) ✅

| Module                     | Coverage | Status       |
| -------------------------- | -------- | ------------ |
| cache/CacheManager.ts      | 90.62%   | ✅ Excellent |
| parser/TypeScriptParser.ts | 93.68%   | ✅ Excellent |
| reports/\*\*               | 92.82%   | ✅ Excellent |
| timeline/\*\*              | 86.12%   | ✅ Excellent |

### Good Coverage (70-80%) ✔️

| Module                          | Coverage | Status     |
| ------------------------------- | -------- | ---------- |
| graph/\*\*                      | 74.76%   | ✔️ Good    |
| cli/ErrorHandler.ts             | 100%     | ✅ Perfect |
| cli/ProgressBar.ts              | 100%     | ✅ Perfect |
| composition/RuleComposer.ts     | 72.46%   | ✔️ Good    |
| metrics/ArchitecturalMetrics.ts | 72.27%   | ✔️ Good    |

### Needs Improvement (40-70%) ⚠️

| Module                            | Current | Target | Gap     | Priority |
| --------------------------------- | ------- | ------ | ------- | -------- |
| **analysis/ViolationAnalyzer.ts** | 55.9%   | 70%    | +14.1%  | HIGH     |
| **lang/ArchRuleDefinition.ts**    | 69.71%  | 75%    | +5.29%  | MEDIUM   |
| **analyzer/CodeAnalyzer.ts**      | 38.18%  | 70%    | +31.82% | HIGH     |
| **analysis/SuggestionEngine.ts**  | 33.61%  | 60%    | +26.39% | HIGH     |
| **lang/syntax/ClassesShould.ts**  | 37.42%  | 80%    | +42.58% | CRITICAL |

### Critical Gaps (<40%) 🔴

| Module                             | Current | Target | Gap     | Priority |
| ---------------------------------- | ------- | ------ | ------- | -------- |
| **lang/syntax/ClassesThat.ts**     | 4.68%   | 80%    | +75.32% | CRITICAL |
| **library/Architectures.ts**       | 5.71%   | 75%    | +69.29% | CRITICAL |
| **library/PatternLibrary.ts**      | 4.04%   | 75%    | +70.96% | CRITICAL |
| **testing/JestMatchers.ts**        | 2.63%   | 50%    | +47.37% | HIGH     |
| **testing/TestFixtures.ts**        | 9.09%   | 50%    | +40.91% | HIGH     |
| **testing/TestHelpers.ts**         | 13.72%  | 50%    | +36.28% | HIGH     |
| **testing/TestSuiteBuilder.ts**    | 4.25%   | 50%    | +45.75% | HIGH     |
| **dashboard/MetricsDashboard.ts**  | 4.16%   | 50%    | +45.84% | MEDIUM   |
| **framework/FrameworkDetector.ts** | 4.81%   | 65%    | +60.19% | HIGH     |
| **config/ConfigLoader.ts**         | 8.62%   | 60%    | +51.38% | HIGH     |
| **templates/RuleTemplates.ts**     | 11.9%   | 65%    | +53.1%  | HIGH     |
| **cli/WatchMode.ts**               | 14.11%  | 60%    | +45.89% | HIGH     |

---

## 📈 Strategic Implementation Plan

### Phase 1: Core DSL & Fluent API (Week 1) 🔴 CRITICAL

**Impact:** +15-20% overall coverage
**Priority:** Highest - These are the most-used APIs

#### 1.1 ClassesThat.ts (4.68% → 80%)

**Estimated effort:** 6-8 hours
**Lines to cover:** ~150 uncovered lines

```typescript
// Test areas needed:
- resideInPackage() with wildcards (*, **)
- resideInAnyPackage() multiple packages
- areAnnotatedWith() decorator matching
- haveSimpleNameStartingWith() prefix matching
- haveSimpleNameEndingWith() suffix matching
- haveSimpleNameContaining() substring matching
- haveSimpleNameMatching() regex patterns
- haveNameMatching() full name patterns
- areInterfaces() filtering
- areAbstract() filtering
- areAssignableTo() inheritance
- implement() interface implementation
- extend() class extension
- Logical operators: and(), or(), not()
- Complex filter chains
- Edge cases: empty results, no matches
```

#### 1.2 ClassesShould.ts (37.42% → 80%)

**Estimated effort:** 8-10 hours
**Lines to cover:** ~600 uncovered lines

```typescript
// Priority test areas:
High Priority:
- resideInPackage() enforcement
- resideInAnyPackage() multi-package rules
- notResideInPackage() negative rules
- haveSimpleNameEndingWith() naming conventions
- haveSimpleNameStartingWith() prefix rules
- beAnnotatedWith() decorator requirements
- notBeAnnotatedWith() forbidden decorators
- onlyDependOn() dependency restrictions
- notDependOn() forbidden dependencies
- dependOnClassesThat() conditional dependencies
- beFreeOfCycles() circular dependency detection
- beInterfaces() type enforcement
- beAbstract() abstract class rules

Medium Priority:
- Custom predicates with shouldSatisfy()
- Complex rule combinations
- Error message generation
- Violation creation and formatting
- Multiple violation scenarios

Low Priority (can skip for 80%):
- Edge cases with empty class sets
- Complex nested conditions
- Performance optimization paths
```

### Phase 2: Architecture Patterns Library (Week 2) 🔴 CRITICAL

**Impact:** +10-15% overall coverage
**Priority:** High - Core architectural testing features

#### 2.1 Architectures.ts (5.71% → 75%)

**Estimated effort:** 10-12 hours
**Lines to cover:** ~400 uncovered lines

```typescript
// Test all 5 architectural patterns:

1. Layered Architecture:
   - layer() definition
   - definedBy() package patterns
   - whereLayer() access rules
   - mayNotAccessLayers() restrictions
   - mayOnlyAccessLayers() allowed dependencies
   - Layer violation detection
   - Multiple layer configurations

2. Onion Architecture:
   - domainModelLayer() core business logic
   - applicationServicesLayer() use cases
   - applicationServicesLayer() adapters
   - infrastructureLayer() external services
   - Dependency direction enforcement (inner→outer forbidden)
   - Each layer access rules

3. Clean Architecture (Uncle Bob):
   - entitiesLayer() enterprise rules
   - useCasesLayer() application business rules
   - interfaceAdaptersLayer() converters
   - frameworksAndDriversLayer() external interfaces
   - Dependency inversion verification
   - Layer isolation

4. DDD Architecture:
   - domainLayer() core domain
   - applicationLayer() use cases
   - infrastructureLayer() technical services
   - presentationLayer() UI/API
   - Aggregate boundary enforcement
   - Domain service isolation

5. Microservices Architecture:
   - service() definition
   - mayNotDependOnEachOther() service isolation
   - Service boundary enforcement
   - Shared kernel patterns
```

#### 2.2 PatternLibrary.ts (4.04% → 75%)

**Estimated effort:** 8-10 hours
**Lines to cover:** ~500 uncovered lines

```typescript
// Test all pattern templates:

Naming Conventions (10 templates):
1. serviceShouldEndWithService()
2. controllersShouldEndWithController()
3. repositoriesShouldEndWithRepository()
4. dtosShouldEndWithDTO()
5. validatorsShouldEndWithValidator()
6. middlewareShouldEndWithMiddleware()
7. guardsShouldEndWithGuard()
8. handlersShouldEndWithHandler()
9. factoriesShouldEndWithFactory()
10. utilsShouldEndWithUtil()

Framework-Specific Patterns:
- NestJS decorators (@Controller, @Injectable, @Module)
- Express middleware patterns
- Repository patterns
- Service layer patterns

Dependency Direction Rules:
- Domain should not depend on infrastructure
- Controllers should depend on services
- Services should depend on repositories
- UI should not leak into domain
```

### Phase 3: Code Analysis & Intelligence (Week 2-3) ⚠️ HIGH

**Impact:** +8-10% overall coverage
**Priority:** High - Core functionality

#### 3.1 CodeAnalyzer.ts (38.18% → 70%)

**Estimated effort:** 6-8 hours
**Lines to cover:** ~200 uncovered lines

```typescript
// Test comprehensive analysis features:

Core Analysis:
- analyzeWithErrors() detailed results
- Error categorization (parse, security, io, unknown)
- Graceful error handling
- Parallel file parsing
- Cache integration

Incremental Analysis:
- analyzeIncremental() change detection
- File modification tracking
- Incremental update optimization
- Delta computation

Dependency Analysis:
- analyzeDependencies() extraction
- Import resolution
- Dependency graph building
- Circular dependency detection

Advanced Features:
- findCycles() algorithm
- getDependencyGraph() generation
- getStatistics() metrics
- Large codebase handling (100+ files)
- Performance benchmarks
```

#### 3.2 SuggestionEngine.ts (33.61% → 60%)

**Estimated effort:** 4-6 hours
**Lines to cover:** ~150 uncovered lines

```typescript
// Test AI-powered suggestions:

Violation Analysis:
- generateSuggestions() for all violation types
- Naming violation fixes
- Package violation fixes
- Dependency violation fixes
- Decorator violation fixes

Suggestion Quality:
- Actionable fix steps
- Code examples in suggestions
- Multiple alternatives
- Root cause analysis
- Pattern recognition

Edge Cases:
- Complex violations
- Multiple simultaneous violations
- Ambiguous fixes
- No clear fix available
```

### Phase 4: Configuration & Framework Detection (Week 3) ⚠️ HIGH

**Impact:** +5-8% overall coverage
**Priority:** High - User experience features

#### 4.1 ConfigLoader.ts (8.62% → 60%)

**Estimated effort:** 4-5 hours

```typescript
// Test configuration loading:
- loadConfig() from archunit.config.js
- Default configuration
- Configuration validation
- Merge with CLI options
- Environment-specific configs
- Invalid config handling
- Missing config fallback
```

#### 4.2 FrameworkDetector.ts (4.81% → 65%)

**Estimated effort:** 5-6 hours

```typescript
// Test framework detection:
- detectFramework() for NestJS
- detectFramework() for Express
- detectFramework() for Next.js
- Framework-specific rule suggestions
- Multiple framework detection
- No framework detected scenario
- Custom framework configuration
```

#### 4.3 WatchMode.ts (14.11% → 60%)

**Estimated effort:** 5-6 hours

```typescript
// Test file watching:
- startWatch() initialization
- File change detection
- Debouncing (avoid duplicate triggers)
- Incremental re-analysis
- Error handling in watch mode
- Graceful shutdown
- Performance with large projects
```

### Phase 5: Rule Templates & Testing Utilities (Week 4) ⚠️ MEDIUM

**Impact:** +3-5% overall coverage
**Priority:** Medium - Developer experience

#### 5.1 RuleTemplates.ts (11.9% → 65%)

**Estimated effort:** 6-8 hours

```typescript
// Test all template functions:
- All naming convention templates
- Framework-specific templates
- Dependency direction templates
- Template customization
- Template composition
```

#### 5.2 Testing Utilities (7.01% → 50%)

**Estimated effort:** 6-8 hours

```typescript
// Test testing helpers:
JestMatchers.ts:
- toPassArchRule() matcher
- toHaveViolations() matcher
- toSatisfy() custom predicate matcher

TestFixtures.ts:
- Mock class generation
- Fixture data creation
- Sample project structures

TestHelpers.ts:
- Test utilities
- Helper functions
- Setup/teardown helpers

TestSuiteBuilder.ts:
- Test suite DSL
- Batch test generation
```

### Phase 6: Dashboard & Advanced Features (Week 4) 📊 OPTIONAL

**Impact:** +2-3% overall coverage
**Priority:** Low - Nice to have for 80%

#### 6.1 MetricsDashboard.ts (4.16% → 50%)

**Estimated effort:** 4-5 hours

- Basic dashboard generation
- Metrics visualization
- HTML output
- Skip complex features if time-constrained

---

## 🎯 Projected Coverage After Each Phase

| Phase               | Module Focus                   | Current      | After | Cumulative |
| ------------------- | ------------------------------ | ------------ | ----- | ---------- |
| **Start**           | -                              | 49.04%       | -     | 49.04%     |
| **Phase 1**         | ClassesThat, ClassesShould     | 31.93% → 75% | +15%  | **64%**    |
| **Phase 2**         | Architectures, PatternLibrary  | 14.67% → 72% | +12%  | **76%**    |
| **Phase 3**         | CodeAnalyzer, SuggestionEngine | 38-46% → 65% | +5%   | **81%**    |
| **Phase 4**         | Config, Framework, WatchMode   | 8-14% → 60%  | +4%   | **85%**    |
| **Target Achieved** | ✅ 80% Coverage                |              |       | **85%**    |

---

## ⏱️ Time Estimates

### Total Effort Breakdown

- **Phase 1 (Critical):** 14-18 hours → **+15% coverage**
- **Phase 2 (Critical):** 18-22 hours → **+12% coverage**
- **Phase 3 (High):** 10-14 hours → **+5% coverage**
- **Phase 4 (High):** 14-17 hours → **+4% coverage**

**Total to 80%:** 56-71 hours (~7-9 working days)
**Total to 85%:** 66-81 hours (~8-10 working days) - includes Phase 5-6

### Recommended Approach

1. ✅ **Days 1-2:** Phase 1 (ClassesThat + ClassesShould) → Reach ~64%
2. ✅ **Days 3-5:** Phase 2 (Architectures + PatternLibrary) → Reach ~76%
3. ✅ **Days 6-7:** Phase 3 (CodeAnalyzer + SuggestionEngine) → Reach ~81%
4. ✅ **Days 8-9:** Phase 4 (Config + Framework + WatchMode) → Reach ~85%

---

## 🔍 Quality Assurance Checklist

### For Each New Test Suite:

- [ ] Test covers happy path scenarios
- [ ] Test covers error scenarios
- [ ] Test covers edge cases
- [ ] Test uses meaningful test data
- [ ] Test assertions are specific
- [ ] Test names are descriptive
- [ ] Test is isolated (no dependencies on other tests)
- [ ] Test runs quickly (<100ms per test)
- [ ] Test is maintainable and readable

### Coverage Quality:

- [ ] Coverage report shows meaningful tests
- [ ] All critical paths are tested
- [ ] Error handling is tested
- [ ] Integration points are tested
- [ ] Complex logic has multiple test cases
- [ ] Avoid testing only trivial getters/setters

---

## 🚀 Implementation Strategy

### Testing Best Practices to Follow:

1. **Start with the Fluent API (Phase 1)**
   - Most important for users
   - Highest visibility
   - Good foundation for other tests

2. **Use Fixture-Based Testing**
   - Create realistic sample codebases in test/fixtures/
   - Reuse fixtures across tests
   - Test with real TypeScript code

3. **Test Violation Detection**
   - Each rule should have tests for both pass and fail scenarios
   - Verify violation messages are helpful
   - Test violation severity levels

4. **Test Rule Composition**
   - Combine rules with AND, OR, NOT
   - Test complex rule chains
   - Verify composed rules report correctly

5. **Performance Testing**
   - Test with large codebases (100+ files)
   - Verify caching works correctly
   - Measure and document performance

6. **Integration Testing**
   - Test complete workflows
   - Test CLI integration
   - Test report generation end-to-end

---

## 📋 Success Criteria

### Minimum for 80% Coverage:

- ✅ Phases 1-3 completed
- ✅ Core fluent API >75% covered
- ✅ All architectural patterns >70% covered
- ✅ CodeAnalyzer >70% covered
- ✅ All tests passing
- ✅ No false positive tests
- ✅ Coverage is meaningful (not just trivial tests)

### Ideal for 85% Coverage:

- ✅ Phases 1-4 completed
- ✅ Config and Framework detection >60% covered
- ✅ Watch mode >60% covered
- ✅ Rule templates >65% covered
- ✅ Documentation updated with new test examples

---

## 📚 Next Steps

1. **Start with Phase 1:** Focus on ClassesThat and ClassesShould - these are critical
2. **Run coverage after each module:** Track progress and adjust plan
3. **Commit frequently:** Small, focused commits for each module
4. **Update this plan:** Adjust estimates based on actual progress
5. **Document patterns:** Create test patterns that can be reused

---

## 🎓 Testing Patterns to Reuse

### Pattern 1: Rule Testing Template

```typescript
describe('Rule Name', () => {
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze('./test/fixtures/sample-code');
  });

  it('should pass when rule is followed', () => {
    const rule = classes()
      .that()
      .resideInPackage('services')
      .should()
      .haveSimpleNameEndingWith('Service');

    const violations = rule.check(classes);
    expect(violations).toHaveLength(0);
  });

  it('should detect violations when rule is broken', () => {
    const rule = classes()
      .that()
      .resideInPackage('services')
      .should()
      .haveSimpleNameEndingWith('Service');

    // Add test case with violation
    const violations = rule.check(classesWithViolation);
    expect(violations).toHaveLength(1);
    expect(violations[0].message).toContain('Service');
  });
});
```

### Pattern 2: Architecture Pattern Testing

```typescript
describe('Architecture Pattern', () => {
  it('should enforce layer dependencies', async () => {
    const architecture = layeredArchitecture()
      .layer('Controllers')
      .definedBy('controllers..')
      .layer('Services')
      .definedBy('services..')
      .layer('Repositories')
      .definedBy('repositories..')
      .whereLayer('Controllers')
      .mayNotAccessLayers('Repositories')
      .whereLayer('Services')
      .mayNotAccessLayers('Controllers');

    const violations = architecture.check(classes);
    expect(violations).toHaveLength(0);
  });
});
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-18
**Status:** Ready for Implementation ✅
