# Intelligent Violation Analysis Guide

ArchUnit-TS provides an intelligent violation analysis system that goes beyond simple error reporting. It analyzes violations to provide root cause analysis, actionable suggestions, impact scoring, and smart grouping.

## Features

- **Root Cause Analysis** - Groups related violations by their underlying cause
- **Smart Suggestions** - Provides "did you mean?" alternatives and fix recommendations
- **Impact Scoring** - Prioritizes violations by their architectural impact (0-100)
- **Category Detection** - Automatically categorizes violations (layering, naming, dependency, security, organization)
- **Hotspot Detection** - Identifies files and packages with the most violations
- **Related Violation Linking** - Shows how violations are connected

---

## Quick Start

```typescript
import { ViolationAnalyzer } from 'archunit-ts';

// Run your architecture rules
const violations = myRule.check(classes);

// Analyze violations with intelligence
const analyzer = new ViolationAnalyzer(violations);
const analysis = analyzer.analyze();

// Display insights
console.log(ViolationAnalyzer.formatAnalysis(analysis));

// Output:
// Architecture Violation Analysis
// ============================================================
//
// Total Violations: 15
// Unique Root Causes: 3
//
// Root Causes (by impact):
// ------------------------------------------------------------
//   • Forbidden layer dependency (8 violations) - Impact: 85
//     Fix: Remove infrastructure dependencies from domain layer
//   • Incorrect naming suffix (5 violations) - Impact: 65
//     Fix: Rename classes to end with 'Service'
//   • Incorrect package structure (2 violations) - Impact: 45
//     Fix: Move classes to the correct package
```

---

## Core APIs

### ViolationAnalyzer

Main class for analyzing violations.

#### `analyze(): ViolationAnalysis`

Performs full analysis with all insights.

```typescript
const analyzer = new ViolationAnalyzer(violations);
const analysis = analyzer.analyze();

console.log(`Total violations: ${analysis.total}`);
console.log(`Root causes: ${analysis.uniqueRootCauses}`);
console.log(`Top priority:`, analysis.topPriority);
console.log(`Hotspot files:`, analysis.hotspotFiles);
```

#### `enhance(): EnhancedViolation[]`

Enhances violations with intelligence features.

```typescript
const enhanced = analyzer.enhance();

for (const violation of enhanced) {
  console.log(violation.message);
  console.log(`  Category: ${violation.category}`);
  console.log(`  Impact: ${violation.impactScore}/100`);

  if (violation.suggestedFix) {
    console.log(`  Fix: ${violation.suggestedFix.description}`);
  }

  if (violation.suggestions && violation.suggestions.length > 0) {
    console.log(`  Did you mean: ${violation.suggestions.join(', ')}`);
  }
}
```

#### `groupByRootCause(): ViolationGroup[]`

Groups violations by their root cause.

```typescript
const groups = analyzer.groupByRootCause();

for (const group of groups) {
  console.log(`\n${group.rootCause} (${group.count} violations)`);
  console.log(`Impact Score: ${group.groupImpactScore}/100`);

  if (group.groupFix) {
    console.log(`Group Fix: ${group.groupFix}`);
  }

  for (const violation of group.violations) {
    console.log(`  - ${violation.filePath}: ${violation.message}`);
  }
}
```

---

## Enhanced Violation Features

### Suggested Fixes

Each violation can include an actionable fix:

```typescript
const enhanced = analyzer.enhance();

for (const violation of enhanced) {
  if (violation.suggestedFix) {
    console.log(`Problem: ${violation.message}`);
    console.log(`Fix: ${violation.suggestedFix.description}`);
    console.log(`Auto-fixable: ${violation.suggestedFix.autoFixable}`);

    if (violation.suggestedFix.expectedPattern) {
      console.log(`Expected: ${violation.suggestedFix.expectedPattern}`);
    }
  }
}

// Example output:
// Problem: Class 'UserService' does not end with 'Service'
// Fix: Rename class to end with 'Service' (e.g., 'UserServiceService')
// Auto-fixable: true
// Expected: *Service
```

### Impact Scoring

Violations are scored 0-100 based on:
- Severity (error = +30, warning = +10)
- Category (security = +20, layering = +15, dependency = +10, naming = +5)
- Base score = 50

```typescript
const analysis = analyzer.analyze();

// Top priority violations (highest impact)
for (const violation of analysis.topPriority) {
  console.log(`[${violation.impactScore}] ${violation.message}`);
}

// Example output:
// [100] Path traversal detected in file handling
// [95] Domain layer depends on infrastructure
// [80] Controller directly accesses repository
```

### Category Detection

Violations are automatically categorized:

```typescript
const analysis = analyzer.analyze();

for (const [category, violations] of analysis.byCategory) {
  console.log(`\n${category.toUpperCase()}: ${violations.length} violations`);

  for (const v of violations) {
    console.log(`  - ${v.message}`);
  }
}

// Example output:
// LAYERING: 8 violations
//   - Class 'UserController' depends on 'UserRepository'
//   - Class 'Domain' depends on 'Infrastructure'
//
// NAMING: 5 violations
//   - Class 'User' does not end with 'Service'
//
// SECURITY: 2 violations
//   - Path traversal detected
```

---

## Advanced Features

### Root Cause Analysis

Groups violations that share the same underlying architectural problem:

```typescript
const groups = analyzer.groupByRootCause();

console.log(`Found ${groups.length} root causes:`);

for (const group of groups) {
  console.log(`\n${group.rootCause}`);
  console.log(`  Violations: ${group.count}`);
  console.log(`  Impact: ${group.groupImpactScore}/100`);
  console.log(`  Group Fix: ${group.groupFix}`);
}

// Example:
// Found 3 root causes:
//
// Forbidden layer dependency
//   Violations: 8
//   Impact: 85/100
//   Group Fix: Refactor to follow layered architecture
//
// Incorrect naming suffix
//   Violations: 5
//   Impact: 65/100
//   Group Fix: Apply the same fix to all 5 violations: Rename to end with 'Service'
```

### Hotspot Detection

Identifies files with the most violations:

```typescript
const analysis = analyzer.analyze();

console.log('Files with most violations:');
for (const hotspot of analysis.hotspotFiles) {
  console.log(`  ${hotspot.file}: ${hotspot.count} violations`);
}

// Example:
// Files with most violations:
//   src/api/UserController.ts: 8 violations
//   src/domain/User.ts: 5 violations
//   src/services/OrderService.ts: 3 violations
```

### Related Violations

Each violation tracks related violations (same category/rule):

```typescript
const enhanced = analyzer.enhance();

for (const violation of enhanced) {
  if (violation.relatedViolations && violation.relatedViolations.length > 0) {
    console.log(`${violation.message}`);
    console.log(`  Related violations: ${violation.relatedViolations.length}`);
  }
}
```

---

## SuggestionEngine

Generates intelligent fix suggestions.

### Naming Violations

```typescript
// Input: "Class 'User' should end with 'Service'"
// Output:
{
  description: "Rename class to end with 'Service' (e.g., 'UserService')",
  autoFixable: true,
  expectedPattern: "*Service",
  codeAction: "rename:UserService"
}
```

### Dependency Violations

```typescript
// Input: "Class 'UserController' depends on 'UserRepository'"
// Output:
{
  description: "Remove direct dependency on repositories. Inject a service layer instead",
  autoFixable: false,
  expectedPattern: "Controller → Service → Repository"
}
```

### Package Organization Violations

```typescript
// Input: "Class 'UserService' should reside in package 'services'"
// Output:
{
  description: "Move UserService to package 'services'",
  autoFixable: true,
  expectedPattern: "services/UserService",
  codeAction: "move:services"
}
```

### Decorator Violations

```typescript
// Input: "Class 'UserService' should be annotated with '@Injectable'"
// Output:
{
  description: "Add @Injectable decorator to UserService",
  autoFixable: true,
  expectedPattern: "@Injectable",
  codeAction: "addDecorator:Injectable"
}
```

---

## Integration Examples

### CI/CD Pipeline

```typescript
import { ArchUnitTS, ViolationAnalyzer } from 'archunit-ts';

const archunit = new ArchUnitTS();
const violations = await archunit.checkRules('./src', [
  layeringRule,
  namingRule,
  dependencyRule
]);

if (violations.length > 0) {
  const analyzer = new ViolationAnalyzer(violations);
  const analysis = analyzer.analyze();

  // Fail build if high-impact violations
  const criticalViolations = analysis.topPriority.filter(v => v.impactScore! > 80);

  if (criticalViolations.length > 0) {
    console.error(`❌ ${criticalViolations.length} critical violations found`);
    console.error(ViolationAnalyzer.formatAnalysis(analysis));
    process.exit(1);
  }

  // Warn about other violations
  console.warn(`⚠️  ${violations.length} architectural issues found`);
  console.warn(ViolationAnalyzer.formatAnalysis(analysis));
}
```

### Custom Reporting

```typescript
const analyzer = new ViolationAnalyzer(violations);
const analysis = analyzer.analyze();

// Generate custom report
const report = {
  summary: {
    total: analysis.total,
    rootCauses: analysis.uniqueRootCauses,
    criticalCount: analysis.topPriority.filter(v => v.impactScore! > 80).length
  },
  categories: Object.fromEntries(
    Array.from(analysis.byCategory.entries()).map(([cat, viols]) => [cat, viols.length])
  ),
  hotspots: analysis.hotspotFiles,
  groups: analysis.groups.map(g => ({
    cause: g.rootCause,
    count: g.count,
    impact: g.groupImpactScore,
    fix: g.groupFix
  }))
};

// Send to monitoring/dashboards
await sendToDatadog(report);
```

---

## Best Practices

### 1. Focus on Root Causes

Instead of fixing 50 individual violations, identify and fix the 3 root causes:

```typescript
const groups = analyzer.groupByRootCause();

// Fix root causes in order of impact
for (const group of groups) {
  console.log(`Priority ${group.groupImpactScore}: ${group.rootCause}`);
  console.log(`Affects ${group.count} violations`);
  console.log(`Fix: ${group.groupFix}`);
}
```

### 2. Use Impact Scores for Prioritization

```typescript
const analysis = analyzer.analyze();

// Fix high-impact violations first
const highImpact = analysis.topPriority.filter(v => v.impactScore! > 70);
const mediumImpact = analysis.topPriority.filter(v => v.impactScore! > 40 && v.impactScore! <= 70);

console.log(`Fix these first (high impact): ${highImpact.length}`);
console.log(`Then fix these (medium impact): ${mediumImpact.length}`);
```

### 3. Monitor Hotspots

```typescript
const analysis = analyzer.analyze();

// Refactor files with many violations
const criticalFiles = analysis.hotspotFiles.filter(h => h.count > 5);

if (criticalFiles.length > 0) {
  console.log('These files need refactoring:');
  for (const file of criticalFiles) {
    console.log(`  ${file.file}: ${file.count} violations`);
  }
}
```

---

## Next Steps

- [Rule Composition](./RULE_COMPOSITION.md) - Create complex rules
- [Architectural Metrics](./ARCHITECTURAL_METRICS.md) - Measure architecture quality
- [Testing Guide](./TESTING.md) - Test your architecture rules
