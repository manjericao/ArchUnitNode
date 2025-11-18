# Test Coverage Improvement Plan - Path to 80%

**Generated**: November 18, 2025
**Current Coverage**: 47.45% lines (1728/3641)
**Target Coverage**: 80% lines
**Gap**: +32.55% (1185 additional lines need coverage)

## Current Coverage Summary

```
Statements   : 46.5%  (1799/3868) - Target: 80%  - Gap: +33.5%
Branches     : 38.38% (580/1511)  - Target: 70%  - Gap: +31.62%
Functions    : 43.88% (416/948)   - Target: 75%  - Gap: +31.12%
Lines        : 47.45% (1728/3641) - Target: 80%  - Gap: +32.55%
```

## Module-by-Module Coverage Analysis

### 🔴 CRITICAL PRIORITY (0-30% coverage - High Impact)

| Module        | Current Coverage | Lines Missing | Impact | Effort |
| ------------- | ---------------- | ------------- | ------ | ------ |
| **CLI**       | 0%               | ~500 lines    | HIGH   | Medium |
| **Testing**   | 7.4%             | ~450 lines    | MEDIUM | Low    |
| **Templates** | 11.9%            | ~480 lines    | HIGH   | Medium |
| **Action**    | 0%               | ~200 lines    | MEDIUM | Medium |
| **Dashboard** | 0%               | ~950 lines    | MEDIUM | High   |
| **Config**    | 0%               | ~300 lines    | MEDIUM | Low    |
| **Framework** | 0%               | ~200 lines    | LOW    | Low    |

**Total Critical**: ~3,080 lines needing coverage

### 🟡 HIGH PRIORITY (30-60% coverage - Moderate Impact)

| Module          | Current Coverage | Lines Missing | Impact | Effort |
| --------------- | ---------------- | ------------- | ------ | ------ |
| **Analysis**    | 28.42%           | ~300 lines    | HIGH   | Medium |
| **Utils**       | 66.66%           | ~100 lines    | MEDIUM | Low    |
| **Core**        | 41.25%           | ~200 lines    | HIGH   | Medium |
| **Composition** | 40.9%            | ~130 lines    | MEDIUM | Low    |
| **Library**     | 48.45%           | ~160 lines    | HIGH   | Medium |

**Total High Priority**: ~890 lines needing coverage

### 🟢 MEDIUM PRIORITY (60-80% coverage - Polish)

| Module       | Current Coverage | Lines Missing | Impact | Effort |
| ------------ | ---------------- | ------------- | ------ | ------ |
| **Graph**    | 69.78%           | ~185 lines    | MEDIUM | Medium |
| **Metrics**  | 72.27%           | ~192 lines    | MEDIUM | Medium |
| **Cache**    | 73.95%           | ~100 lines    | LOW    | Low    |
| **Timeline** | 85.8%            | ~45 lines     | LOW    | Low    |

**Total Medium Priority**: ~522 lines needing coverage

### ✅ LOW PRIORITY (80%+ coverage - Maintain)

| Module      | Current Coverage | Status       |
| ----------- | ---------------- | ------------ |
| **Parser**  | 93.68%           | ✅ Excellent |
| **Reports** | 93.56%           | ✅ Excellent |
| **Lang**    | 83.6%            | ✅ Good      |

---

## Strategic Implementation Plan

### Phase 1: Quick Wins (Est: 2-3 days) - Target: +15% coverage

**Focus**: Low-effort, high-impact modules

#### 1.1 CLI Module Tests (0% → 70%) - **+3.5%**

**Effort**: 6-8 hours

**Files to test**:

- `ErrorHandler.ts` - Error categorization and formatting
- `ProgressBar.ts` - Progress rendering and updates
- `WatchMode.ts` - File watching and debouncing
- `index.ts` - CLI argument parsing and execution

**Test scenarios**:

```typescript
// ErrorHandler.test.ts
- Error type detection (configuration, file system, validation)
- Error message formatting with colors
- Suggestion generation for common errors
- Stack trace handling

// ProgressBar.test.ts
- Progress bar initialization
- Progress updates (0%, 50%, 100%)
- Multi-bar management
- Duration formatting

// WatchMode.test.ts
- File watch initialization
- Debounce mechanism
- Change detection
- Stop/start lifecycle
```

#### 1.2 Config Module Tests (0% → 80%) - **+2.4%**

**Effort**: 3-4 hours

**Files to test**:

- `ConfigLoader.ts` - Configuration loading and validation

**Test scenarios**:

```typescript
// ConfigLoader.test.ts
- Load from archunit.config.js
- Load from package.json
- Default configuration fallback
- Configuration validation
- Merge strategies
- Invalid config handling
```

#### 1.3 Framework Detection Tests (0% → 80%) - **+1.6%**

**Effort**: 2-3 hours

**Files to test**:

- `FrameworkDetector.ts` - Framework detection logic

**Test scenarios**:

```typescript
// FrameworkDetector.test.ts
- Detect React projects
- Detect Angular projects
- Detect Vue projects
- Detect NestJS projects
- Detect Express projects
- No framework detection
```

#### 1.4 Testing Utilities (7.4% → 60%) - **+2.4%**

**Effort**: 4-5 hours

**Files to test**:

- `JestMatchers.ts` - Custom Jest matchers
- `TestFixtures.ts` - Test data generation
- `TestHelpers.ts` - Test utilities
- `TestSuiteBuilder.ts` - Suite builder

**Test scenarios**:

```typescript
// JestMatchers.test.ts
- toViolateArchitectureRule matcher
- toHaveViolations matcher
- toPassArchitectureRule matcher

// TestFixtures.test.ts
- Generate sample TSClass
- Generate sample violations
- Generate sample architectures
```

**Phase 1 Total**: ~+10% coverage increase

---

### Phase 2: Core Functionality (Est: 4-5 days) - Target: +12% coverage

**Focus**: Core modules and templates

#### 2.1 Templates Module (11.9% → 80%) - **+6.5%**

**Effort**: 8-10 hours

**Files to test**:

- `RuleTemplates.ts` - All 40+ rule templates

**Test scenarios**:

```typescript
// RuleTemplates.test.ts - Naming Conventions
-serviceNamingConvention() -
  controllerNamingConvention() -
  repositoryNamingConvention() -
  modelNamingConvention() -
  dtoNamingConvention() -
  interfaceNamingConvention() -
  abstractClassNamingConvention() -
  exceptionNamingConvention() -
  enumNamingConvention() -
  // Architectural Patterns
  layeredArchitecture() -
  hexagonalArchitecture() -
  cleanArchitecture() -
  onionArchitecture() -
  // Dependency Rules
  noCircularDependencies() -
  noCyclesInPackages() -
  servicesShouldNotDependOnControllers() -
  repositoriesShouldNotDependOnServices() -
  controllersShouldOnlyDependOnServices();
```

#### 2.2 Core Module Enhancement (41.25% → 75%) - **+3.4%**

**Effort**: 6-8 hours

**Files to enhance**:

- `TSClass.ts` - Method/property edge cases
- `TSClasses.ts` - Collection operations
- `ArchRule.ts` - Rule composition edge cases

**Test scenarios**:

```typescript
// TSClass.test.ts - Additional tests
- hasOnlyReadonlyFields() with mixed fields
- hasOnlyPrivateConstructors() edge cases
- hasOnlyPublicMethods() with getters/setters
- isAssignableTo() inheritance chains
- Decorator with arguments parsing
- Generic type handling
- Complex inheritance scenarios

// TSClasses.test.ts
- whereNot() filtering
- allOf() combinations
- anyOf() combinations
- isEmpty() checks
- Chaining operations
```

#### 2.3 Library Module (48.45% → 80%) - **+2.5%**

**Effort**: 5-6 hours

**Files to test**:

- `LayeredArchitecture.ts` - Complex layer rules
- `Architectures.ts` - Architectural patterns
- `PatternLibrary.ts` - Pattern matching

**Test scenarios**:

```typescript
// LayeredArchitecture.test.ts - Enhanced
- Multiple layer dependencies
- Bidirectional restrictions
- Layer aliasing
- Wildcard layer matching
- Nested package patterns

// Architectures.test.ts
- Hexagonal architecture validation
- Clean architecture rules
- Onion architecture layers
```

**Phase 2 Total**: ~+12% coverage increase

---

### Phase 3: Analysis & Reporting (Est: 3-4 days) - Target: +8% coverage

**Focus**: Analysis, visualization, and reporting

#### 3.1 Analysis Module Enhancement (28.42% → 70%) - **+3.5%**

**Effort**: 6-7 hours

**Files to enhance**:

- `ViolationAnalyzer.ts` - Grouping and analysis
- `SuggestionEngine.ts` - Suggestion generation

**Test scenarios**:

```typescript
// ViolationAnalyzer.test.ts - Comprehensive
- Group by file
- Group by rule
- Group by severity
- Trend analysis
- Hot spot detection
- Violation clustering
- Pattern recognition

// SuggestionEngine.test.ts - Enhanced
- Fix suggestions for naming violations
- Fix suggestions for dependency violations
- Fix suggestions for annotation violations
- Fix suggestions for cyclic dependencies
- Alternative pattern suggestions
- Quick fix generation
```

#### 3.2 Dashboard Module (0% → 60%) - **+5.7%**

**Effort**: 7-8 hours

**Files to test**:

- `MetricsDashboard.ts` - Dashboard generation and data

**Test scenarios**:

```typescript
// MetricsDashboard.test.ts
- Dashboard HTML generation
- Metrics calculation
- Chart data generation
- Trend visualization
- Violation distribution charts
- Module dependency graphs
- Real-time update simulation
```

**Phase 3 Total**: ~+9% coverage increase

---

### Phase 4: GitHub Actions & Edge Cases (Est: 2-3 days) - Target: +5% coverage

**Focus**: GitHub Actions integration and remaining gaps

#### 4.1 GitHub Actions (0% → 70%) - **+1.4%**

**Effort**: 4-5 hours

**Files to test**:

- `action/index.ts` - GitHub Actions integration

**Test scenarios**:

```typescript
// action/index.test.ts
- Parse action inputs
- Run architecture checks
- Post PR comments
- Handle failures
- Format action outputs
- Set action outputs
- Error handling
```

#### 4.2 Fill Remaining Gaps - **+3.6%**

**Effort**: 6-8 hours

**Focus areas**:

- Utils ViolationFormatter missing branches
- Graph builders edge cases
- Metrics calculation edge cases
- Cache eviction scenarios
- Composition NOT/XOR/complex rules
- Parser error scenarios

**Phase 4 Total**: ~+5% coverage increase

---

## Execution Strategy

### Week 1: Foundation (Days 1-3)

- **Day 1**: Phase 1.1 & 1.2 (CLI + Config tests)
- **Day 2**: Phase 1.3 & 1.4 (Framework + Testing utilities)
- **Day 3**: Phase 2.1 start (Templates - naming conventions)

**Checkpoint**: Coverage should be ~57% (+10%)

### Week 2: Core & Templates (Days 4-8)

- **Day 4-5**: Phase 2.1 complete (Templates - all patterns)
- **Day 6-7**: Phase 2.2 (Core module enhancement)
- **Day 8**: Phase 2.3 (Library module)

**Checkpoint**: Coverage should be ~69% (+22%)

### Week 3: Analysis & Polish (Days 9-14)

- **Day 9-10**: Phase 3.1 (Analysis module)
- **Day 11-12**: Phase 3.2 (Dashboard module)
- **Day 13-14**: Phase 4.1 & 4.2 (GitHub Actions + gaps)

**Checkpoint**: Coverage should be ~80%+ (+32.55%)

---

## Test Quality Standards

### 1. Test Structure

```typescript
describe('ModuleName', () => {
  describe('FeatureGroup', () => {
    beforeEach(() => {
      // Setup
    });

    it('should handle normal case', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw on invalid input', () => {
      // Test error scenarios
    });
  });
});
```

### 2. Coverage Requirements

- **Lines**: 80%+
- **Branches**: 70%+ (test both true/false paths)
- **Functions**: 75%+ (all public methods)
- **Statements**: 80%+

### 3. Test Scenarios to Include

For each module:

- ✅ Happy path (normal usage)
- ✅ Edge cases (empty input, null, undefined)
- ✅ Error handling (invalid input, exceptions)
- ✅ Boundary conditions (min/max values)
- ✅ Integration points (module interactions)

### 4. Avoid

- ❌ Testing implementation details
- ❌ Brittle tests (dependent on specific formatting)
- ❌ Flaky tests (time-dependent, random data)
- ❌ Duplicate tests (DRY principle)

---

## Tools & Commands

### Run Coverage Report

```bash
npm run test:coverage -- --maxWorkers=1
```

### Coverage by Module

```bash
npm run test:coverage -- --maxWorkers=1 --collectCoverageFrom='src/cli/**/*.ts'
```

### Watch Mode for Development

```bash
npm test -- --watch --coverage
```

### HTML Coverage Report

```bash
npm run test:coverage -- --maxWorkers=1
open coverage/lcov-report/index.html
```

---

## Success Metrics

### Coverage Targets

- **Statements**: 80%+ ✅
- **Branches**: 70%+ ✅
- **Functions**: 75%+ ✅
- **Lines**: 80%+ ✅

### Quality Metrics

- All tests pass (299/299 ✅)
- No flaky tests
- Test execution time < 30s
- Coverage report generated successfully

---

## Risk Mitigation

### Potential Challenges

1. **Flaky Performance Tests**
   - **Risk**: Cache benchmark tests may fail intermittently
   - **Mitigation**: Use wider margins, add retries, or skip in CI

2. **Jest Worker Issues**
   - **Risk**: File system errors with multiple workers
   - **Mitigation**: Run with `--maxWorkers=1` in CI

3. **Git Timeline Tests**
   - **Risk**: Tests fail with uncommitted changes
   - **Mitigation**: Ensure clean working directory before tests

4. **Time Constraints**
   - **Risk**: 80% coverage may take 2-3 weeks
   - **Mitigation**: Prioritize high-impact modules, parallelize work

---

## Next Steps

1. ✅ **Commit current test fixes** (DONE)
2. ✅ **Generate baseline coverage report** (DONE - 47.45%)
3. 🔄 **Start Phase 1** - CLI & Config tests
4. 📊 **Track progress** - Update coverage after each phase
5. 🎯 **Iterate** - Adjust plan based on coverage gains

---

## Appendix: Quick Reference

### Modules by Priority

**Do First** (Biggest Impact):

1. Templates (11.9% → 80%) = **+6.5% coverage**
2. CLI (0% → 70%) = **+3.5% coverage**
3. Dashboard (0% → 60%) = **+5.7% coverage**
4. Analysis (28.42% → 70%) = **+3.5% coverage**

**Do Second** (Medium Impact):

1. Core (41.25% → 75%) = **+3.4% coverage**
2. Library (48.45% → 80%) = **+2.5% coverage**
3. Config (0% → 80%) = **+2.4% coverage**

**Do Last** (Polish):

1. Graph, Metrics, Utils edge cases
2. Framework detection
3. GitHub Actions integration

### Coverage Commands Cheat Sheet

```bash
# Full coverage report
npm run test:coverage -- --maxWorkers=1

# Specific module
npm test -- --coverage --collectCoverageFrom='src/cli/**/*.ts' --maxWorkers=1

# Watch mode
npm test -- --watch --coverage

# No cache (if issues)
npm test -- --no-cache --coverage --maxWorkers=1
```

---

**Document Owner**: AI Test Coverage Improvement Team
**Last Updated**: November 18, 2025
**Status**: Active Implementation Plan
