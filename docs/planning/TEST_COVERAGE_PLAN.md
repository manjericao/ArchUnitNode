# Test Coverage Implementation Plan

**Goal:** Reach 80% code coverage
**Current:** 29.77%
**Gap:** 50.23%

## Quick Reference: Coverage Targets by Module

| Module             | Current | Target | Gap     | Priority    | Est. Hours |
| ------------------ | ------- | ------ | ------- | ----------- | ---------- |
| CLI                | 0%      | 60%    | +60%    | 🔴 Critical | 8h         |
| Reports            | 8.61%   | 70%    | +61.39% | 🔴 Critical | 6h         |
| Analysis           | 1.07%   | 60%    | +58.93% | 🔴 Critical | 8h         |
| Library            | 5.13%   | 65%    | +59.87% | 🟡 High     | 10h        |
| Templates          | 4.76%   | 65%    | +60.24% | 🟡 High     | 4h         |
| Framework          | 4.81%   | 65%    | +60.19% | 🟡 High     | 6h         |
| Utils              | 7.84%   | 70%    | +62.16% | 🟡 Medium   | 4h         |
| Testing            | 7.01%   | 60%    | +52.99% | 🟡 Medium   | 6h         |
| Config             | 8.62%   | 65%    | +56.38% | 🟡 Medium   | 4h         |
| ClassesThat        | 4.68%   | 70%    | +65.32% | 🟡 Medium   | 4h         |
| ClassesShould      | 25.15%  | 75%    | +49.85% | 🟡 Medium   | 4h         |
| ArchRuleDefinition | 58.28%  | 80%    | +21.72% | 🟢 Low      | 4h         |
| CodeAnalyzer       | 38.18%  | 80%    | +41.82% | 🟢 Low      | 4h         |
| **TOTAL**          | 29.77%  | 80%    | +50.23% | -           | **72h**    |

---

## Phase 1: Critical Modules (🔴 Priority)

### 1.1 CLI Modules (0% → 60%) - 8 hours

#### ErrorHandler.ts (0% → 70%)

**Test File:** `test/cli/ErrorHandler.test.ts`

```typescript
describe('ErrorHandler', () => {
  describe('Error Categorization', () => {
    test('should categorize security errors (path traversal)');
    test('should categorize IO errors (ENOENT, EACCES)');
    test('should categorize syntax errors');
    test('should categorize parse errors');
    test('should categorize unknown errors');
  });

  describe('Error Formatting', () => {
    test('should format error with file context');
    test('should format error with line numbers');
    test('should format error without context when unavailable');
    test('should truncate very long error messages');
    test('should escape special characters in error messages');
  });

  describe('Error Logging', () => {
    test('should log to console by default');
    test('should log to file when configured');
    test('should include stack traces in verbose mode');
    test('should batch errors for summary');
  });

  describe('Error Recovery', () => {
    test('should continue after recoverable errors');
    test('should stop after fatal errors');
    test('should collect all errors in lenient mode');
  });
});
```

**Key Functions to Test:**

- `categorizeError(error: Error): ErrorCategory`
- `formatError(error: Error, options: FormatOptions): string`
- `logError(error: Error): void`
- `handleError(error: Error): void`

**Coverage Goal:** 70% (0% → 70% = +70%)

#### ProgressBar.ts (0% → 60%)

**Test File:** `test/cli/ProgressBar.test.ts`

```typescript
describe('ProgressBar', () => {
  describe('Progress Display', () => {
    test('should initialize with total count');
    test('should update progress correctly');
    test('should show percentage');
    test('should show elapsed time');
    test('should show estimated time remaining');
  });

  describe('Rendering', () => {
    test('should render bar with correct width');
    test('should handle terminal width limits');
    test('should show completion at 100%');
    test('should update in place (no line breaks)');
  });

  describe('Messages', () => {
    test('should display custom messages');
    test('should truncate long messages');
    test('should show file being processed');
  });

  describe('Edge Cases', () => {
    test('should handle zero total');
    test('should handle progress > total');
    test('should handle negative values gracefully');
  });
});
```

**Coverage Goal:** 60%

#### WatchMode.ts (0% → 50%)

**Test File:** `test/cli/WatchMode.test.ts`

```typescript
describe('WatchMode', () => {
  describe('File Watching', () => {
    test('should detect file changes');
    test('should detect file additions');
    test('should detect file deletions');
    test('should ignore node_modules');
    test('should ignore .d.ts files');
  });

  describe('Debouncing', () => {
    test('should debounce rapid changes');
    test('should batch multiple file changes');
    test('should respect debounce timeout');
  });

  describe('Analysis Triggering', () => {
    test('should run analysis on change');
    test('should show files that changed');
    test('should display analysis results');
  });

  describe('Lifecycle', () => {
    test('should start watching correctly');
    test('should stop gracefully on Ctrl+C');
    test('should cleanup watchers on exit');
  });
});
```

**Coverage Goal:** 50%

---

### 1.2 Report Generators (8.61% → 70%) - 6 hours

#### HtmlReportGenerator.ts (2.56% → 75%)

**Test File:** `test/reports/HtmlReportGenerator.test.ts`

```typescript
describe('HtmlReportGenerator', () => {
  describe('HTML Structure', () => {
    test('should generate valid HTML5');
    test('should include DOCTYPE');
    test('should include required meta tags');
    test('should include inline CSS');
  });

  describe('Content Rendering', () => {
    test('should render report title');
    test('should render timestamp');
    test('should render summary statistics');
    test('should render violations list');
    test('should group violations by file');
    test('should group violations by rule');
  });

  describe('Formatting', () => {
    test('should escape HTML entities in messages');
    test('should format file paths as links');
    test('should syntax highlight code context');
    test('should apply color coding to severity');
  });

  describe('Edge Cases', () => {
    test('should handle empty violations');
    test('should handle very long file paths');
    test('should handle special characters in class names');
    test('should handle missing location information');
  });

  describe('Options', () => {
    test('should respect includeStats option');
    test('should respect includeTimestamp option');
    test('should use custom title');
  });
});
```

**Coverage Goal:** 75%

#### JsonReportGenerator.ts (4.54% → 75%)

**Test File:** `test/reports/JsonReportGenerator.test.ts`

```typescript
describe('JsonReportGenerator', () => {
  describe('JSON Structure', () => {
    test('should generate valid JSON');
    test('should include metadata');
    test('should include violations array');
    test('should include summary statistics');
  });

  describe('Data Integrity', () => {
    test('should preserve all violation data');
    test('should include source locations');
    test('should include rule descriptions');
    test('should serialize dates correctly');
  });

  describe('Formatting', () => {
    test('should format with indentation when pretty=true');
    test('should minify when pretty=false');
    test('should escape special characters');
  });
});
```

**Coverage Goal:** 75%

#### JUnitReportGenerator.ts (2.50% → 75%)

**Test File:** `test/reports/JUnitReportGenerator.test.ts`

```typescript
describe('JUnitReportGenerator', () => {
  describe('XML Structure', () => {
    test('should generate valid JUnit XML');
    test('should include testsuites root');
    test('should include testsuite elements');
    test('should include testcase elements');
  });

  describe('Test Results', () => {
    test('should create testcase for each rule');
    test('should mark failed tests for violations');
    test('should mark passed tests for clean rules');
    test('should include failure messages');
  });

  describe('CI/CD Integration', () => {
    test('should be parseable by Jenkins');
    test('should be parseable by GitHub Actions');
    test('should include timing information');
    test('should include file paths in failure messages');
  });
});
```

**Coverage Goal:** 75%

#### MarkdownReportGenerator.ts (1.88% → 70%)

**Test File:** `test/reports/MarkdownReportGenerator.test.ts`

```typescript
describe('MarkdownReportGenerator', () => {
  describe('Markdown Structure', () => {
    test('should generate valid markdown');
    test('should include headings');
    test('should include tables');
    test('should include code blocks');
  });

  describe('Content', () => {
    test('should render summary section');
    test('should render violations by file');
    test('should render violations by rule');
    test('should include statistics');
  });

  describe('GitHub Integration', () => {
    test('should format for GitHub PR comments');
    test('should include collapsible sections');
    test('should highlight severity levels');
  });
});
```

**Coverage Goal:** 70%

#### ReportManager.ts (18% → 75%)

**Test File:** `test/reports/ReportManager.test.ts`

```typescript
describe('ReportManager', () => {
  describe('Single Report Generation', () => {
    test('should generate HTML report');
    test('should generate JSON report');
    test('should generate JUnit report');
    test('should generate Markdown report');
  });

  describe('Multiple Report Generation', () => {
    test('should generate multiple formats at once');
    test('should write to different files');
    test('should handle output directory creation');
  });

  describe('Error Handling', () => {
    test('should handle write permission errors');
    test('should handle invalid paths');
    test('should validate report format');
  });
});
```

**Coverage Goal:** 75%

---

### 1.3 Analysis Modules (1.07% → 60%) - 8 hours

#### SuggestionEngine.ts (0.84% → 65%)

**Test File:** `test/analysis/SuggestionEngine.test.ts`

```typescript
describe('SuggestionEngine', () => {
  describe('Package Placement Suggestions', () => {
    test('should suggest moving misplaced services');
    test('should suggest moving misplaced controllers');
    test('should suggest moving misplaced repositories');
    test('should provide multiple move options');
  });

  describe('Naming Convention Suggestions', () => {
    test('should suggest renaming to match convention');
    test('should suggest decorator additions');
    test('should suggest removing incorrect prefixes/suffixes');
  });

  describe('Dependency Suggestions', () => {
    test('should suggest breaking cyclic dependencies');
    test('should suggest dependency injection');
    test('should suggest interface extraction');
  });

  describe('Architecture Suggestions', () => {
    test('should suggest layer separation');
    test('should suggest module boundaries');
    test('should suggest applying patterns');
  });

  describe('Suggestion Ranking', () => {
    test('should rank by impact');
    test('should rank by ease of fix');
    test('should prioritize security issues');
  });

  describe('Fix Examples', () => {
    test('should provide code examples for fixes');
    test('should show before/after comparison');
    test('should include import updates');
  });
});
```

**Coverage Goal:** 65%

#### ViolationAnalyzer.ts (1.24% → 65%)

**Test File:** `test/analysis/ViolationAnalyzer.test.ts`

```typescript
describe('ViolationAnalyzer', () => {
  describe('Pattern Detection', () => {
    test('should detect repeated violations');
    test('should detect violation clusters');
    test('should detect architectural smells');
  });

  describe('Trend Analysis', () => {
    test('should compare with previous runs');
    test('should detect increasing violation trends');
    test('should detect decreasing violation trends');
  });

  describe('Impact Analysis', () => {
    test('should calculate affected files');
    test('should calculate affected modules');
    test('should estimate refactoring effort');
  });

  describe('Root Cause Analysis', () => {
    test('should identify common causes');
    test('should group related violations');
    test('should suggest systemic fixes');
  });
});
```

**Coverage Goal:** 65%

---

## Phase 2: High-Value Modules (🟡 Priority)

### 2.1 Library/Templates - 14 hours

#### LayeredArchitecture.ts (8.21% → 75%)

**Estimated:** 4 hours

```typescript
describe('LayeredArchitecture', () => {
  test('should define layers correctly');
  test('should validate layer dependencies');
  test('should detect layer violations');
  test('should allow configured access');
  test('should handle optional layers');
  test('should check may-only-access rules');
  test('should check may-not-access rules');
  test('should generate violation descriptions');
});
```

#### PatternLibrary.ts (4.04% → 70%)

**Estimated:** 4 hours

```typescript
describe('PatternLibrary', () => {
  describe('Architectural Patterns', () => {
    test('should validate MVC pattern');
    test('should validate MVVM pattern');
    test('should validate clean architecture');
    test('should validate hexagonal architecture');
    test('should validate onion architecture');
  });

  describe('Design Patterns', () => {
    test('should detect singleton violations');
    test('should detect factory pattern');
    test('should detect repository pattern');
    test('should detect service pattern');
  });
});
```

#### Architectures.ts (5.71% → 70%)

**Estimated:** 3 hours

```typescript
describe('Architectures', () => {
  test('should create layered architecture');
  test('should create onion architecture');
  test('should create hexagonal architecture');
  test('should create clean architecture');
  test('should configure architecture rules');
});
```

#### RuleTemplates.ts (4.76% → 70%)

**Estimated:** 3 hours

```typescript
describe('RuleTemplates', () => {
  describe('Common Rule Templates', () => {
    test('should create service naming rules');
    test('should create controller naming rules');
    test('should create repository naming rules');
    test('should create model naming rules');
  });

  describe('Framework Templates', () => {
    test('should create NestJS rules');
    test('should create Express rules');
    test('should create React rules');
  });
});
```

---

### 2.2 Framework Detector (4.81% → 65%) - 6 hours

```typescript
describe('FrameworkDetector', () => {
  describe('NestJS Detection', () => {
    test('should detect from @nestjs decorators');
    test('should detect from module structure');
    test('should detect from dependencies');
  });

  describe('Express Detection', () => {
    test('should detect from express imports');
    test('should detect from app.get/post calls');
    test('should detect from middleware usage');
  });

  describe('React Detection', () => {
    test('should detect from JSX syntax');
    test('should detect from React imports');
    test('should detect from component patterns');
  });

  describe('Vue Detection', () => {
    test('should detect from .vue files');
    test('should detect from Vue imports');
  });

  describe('Framework-Specific Rules', () => {
    test('should generate NestJS-specific rules');
    test('should generate Express-specific rules');
  });
});
```

---

## Phase 3: Supporting Modules - 14 hours

### 3.1 ViolationFormatter (7.84% → 70%) - 4 hours

```typescript
describe('ViolationFormatter', () => {
  describe('Formatting', () => {
    test('should format single violation');
    test('should format multiple violations');
    test('should format violation summary');
    test('should format with colors');
    test('should format without colors');
  });

  describe('Context Extraction', () => {
    test('should extract source code context');
    test('should highlight violation line');
    test('should handle missing source files');
  });

  describe('Grouping', () => {
    test('should group by file');
    test('should group by rule');
    test('should group by severity');
  });
});
```

---

### 3.2 Testing Utilities - 6 hours

#### TestFixtures.ts (9.09% → 65%)

**Estimated:** 2 hours

```typescript
describe('TestFixtures', () => {
  test('should create sample TSClass');
  test('should create sample TSModule');
  test('should create violation fixture');
  test('should create codebase fixture');
});
```

#### TestHelpers.ts (13.72% → 70%)

**Estimated:** 2 hours

```typescript
describe('TestHelpers', () => {
  test('should create temporary directory');
  test('should create temporary file');
  test('should cleanup after tests');
  test('should mock file system');
});
```

#### JestMatchers.ts (2.63% → 65%)

**Estimated:** 2 hours

```typescript
describe('JestMatchers', () => {
  test('should provide toHaveViolations matcher');
  test('should provide toPassRule matcher');
  test('should provide toResideInPackage matcher');
  test('should provide custom error messages');
});
```

---

### 3.3 ConfigLoader (8.62% → 65%) - 4 hours

```typescript
describe('ConfigLoader', () => {
  describe('Config File Loading', () => {
    test('should load from .archunitrc');
    test('should load from archunit.config.js');
    test('should load from package.json');
    test('should use defaults when no config');
  });

  describe('Config Validation', () => {
    test('should validate file patterns');
    test('should validate ignore patterns');
    test('should validate rule configurations');
  });

  describe('Config Merging', () => {
    test('should merge with defaults');
    test('should override with env variables');
    test('should merge multiple config sources');
  });
});
```

---

## Phase 4: Rule System Enhancement - 12 hours

### 4.1 ClassesThat.ts (4.68% → 70%) - 4 hours

```typescript
describe('ClassesThat', () => {
  describe('Package Filters', () => {
    test('should filter by package');
    test('should filter by multiple packages');
    test('should filter outside package');
  });

  describe('Naming Filters', () => {
    test('should filter by name pattern');
    test('should filter by prefix');
    test('should filter by suffix');
  });

  describe('Decorator Filters', () => {
    test('should filter by decorator');
    test('should filter by multiple decorators');
  });

  describe('Type Filters', () => {
    test('should filter abstract classes');
    test('should filter interfaces');
    test('should filter by assignability');
  });

  describe('Custom Filters', () => {
    test('should apply custom predicate');
    test('should chain multiple filters');
  });
});
```

---

### 4.2 ClassesShould.ts (25.15% → 75%) - 4 hours

```typescript
describe('ClassesShould', () => {
  describe('Negation Methods', () => {
    test('should validate notHaveSimpleName');
    test('should validate notHaveSimpleNameMatching');
    test('should validate notHaveSimpleNameEndingWith');
    test('should validate notHaveSimpleNameStartingWith');
    test('should validate notResideInPackage');
  });

  describe('Dependency Rules', () => {
    test('should validate dependency restrictions');
    test('should check cyclic dependencies');
    test('should allow specific dependencies');
  });

  describe('Structural Rules', () => {
    test('should validate readonly fields');
    test('should validate private constructors');
    test('should validate public methods');
  });

  describe('Complex Rules', () => {
    test('should combine multiple conditions');
    test('should handle edge cases');
  });
});
```

---

### 4.3 ArchRuleDefinition.ts (58.28% → 80%) - 4 hours

```typescript
describe('ArchRuleDefinition', () => {
  describe('Static Rule Building', () => {
    test('should build rules with static classes');
    test('should apply filters correctly');
    test('should create rule instances');
  });

  describe('Fluent API', () => {
    test('should chain that() and should()');
    test('should use and() for complex filters');
    test('should negate rules');
  });

  describe('Rule Execution', () => {
    test('should execute against TSClasses');
    test('should return violations');
    test('should handle empty classes');
  });

  describe('Rule Composition', () => {
    test('should combine rules with and');
    test('should combine rules with or');
    test('should create rule sets');
  });
});
```

---

## Quick Start Guide

### Step 1: Setup Test Infrastructure

```bash
# Ensure all dependencies are installed
npm install

# Run existing tests to establish baseline
npm test

# Generate coverage report
npm run test:coverage
```

### Step 2: Create Test File Structure

```bash
# Create missing test directories
mkdir -p test/cli
mkdir -p test/analysis
mkdir -p test/reports
mkdir -p test/library
mkdir -p test/testing
mkdir -p test/config

# Create test files (use templates provided above)
```

### Step 3: Implement Tests Incrementally

1. Start with **Phase 1** (critical modules)
2. Aim for 60-75% coverage per module
3. Focus on happy paths first, then edge cases
4. Verify coverage improvement after each module

### Step 4: Track Progress

```bash
# Run coverage after each module
npm run test:coverage

# Check coverage for specific file
npm run test:coverage -- --collectCoverageFrom="src/cli/ErrorHandler.ts"
```

---

## Coverage Verification Checklist

After implementing each phase, verify:

- [ ] All new tests pass
- [ ] Module coverage meets target percentage
- [ ] No regressions in existing tests
- [ ] Overall coverage increased
- [ ] Code quality maintained (no TODOs, proper assertions)

---

## Success Metrics

### Phase 1 Complete

- [ ] Overall coverage: 50%+
- [ ] CLI modules: 60%+
- [ ] Reports: 70%+
- [ ] Analysis: 60%+

### Phase 2 Complete

- [ ] Overall coverage: 65%+
- [ ] Library: 65%+
- [ ] Framework: 65%+

### Phase 3 Complete

- [ ] Overall coverage: 75%+
- [ ] Utils: 70%+
- [ ] Testing: 60%+
- [ ] Config: 65%+

### Phase 4 Complete

- [ ] Overall coverage: 80%+
- [ ] All modules: 60%+
- [ ] Critical modules: 75%+

---

## Estimated Timeline

| Week | Focus                            | Target Coverage | Hours |
| ---- | -------------------------------- | --------------- | ----- |
| 1    | Phase 1 (CLI, Reports, Analysis) | 50%             | 22h   |
| 2    | Phase 2 (Library, Framework)     | 65%             | 20h   |
| 3    | Phase 3 (Utils, Testing, Config) | 75%             | 14h   |
| 4    | Phase 4 (Rule System) + Polish   | 80%+            | 16h   |

**Total Estimated Effort:** 72 hours (9 working days)

---

## Notes

- All coverage targets are minimum goals
- Some modules may exceed targets during implementation
- Integration tests will provide additional coverage
- Focus on quality over quantity - aim for meaningful tests
- Use test-driven development where appropriate
- Keep tests maintainable and well-documented
