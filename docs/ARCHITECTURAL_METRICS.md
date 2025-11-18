# Architectural Metrics Guide

ArchUnit-TS provides comprehensive architectural metrics to measure and track the quality of your codebase. These metrics help you identify architectural issues, track technical debt, and maintain healthy software architecture over time.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Metric Categories](#metric-categories)
  - [Coupling Metrics](#coupling-metrics)
  - [Cohesion Metrics](#cohesion-metrics)
  - [Complexity Metrics](#complexity-metrics)
  - [Technical Debt](#technical-debt)
  - [Architecture Fitness](#architecture-fitness)
- [Understanding the Results](#understanding-the-results)
- [Best Practices](#best-practices)
- [Integration](#integration)
- [Examples](#examples)
- [API Reference](#api-reference)

---

## Overview

Architectural metrics provide objective measurements of code quality that help you:

- **Identify architectural hotspots** - packages with poor coupling/cohesion
- **Track technical debt** - estimate time to fix violations
- **Measure maintainability** - overall architecture fitness score
- **Make data-driven decisions** - prioritize refactoring efforts
- **Monitor trends** - track architecture quality over time

**Why Metrics Matter:**

- Prevent architecture erosion
- Justify refactoring investments
- Set measurable quality goals
- Enable continuous architecture validation

---

## Getting Started

### Basic Usage

```typescript
import { ArchUnitTS, ArchitecturalMetricsAnalyzer } from 'archunit-ts';

const archUnit = new ArchUnitTS();

// Analyze your codebase
const classes = await archUnit.analyzeCode('./src');

// Run architecture rules
const violations = await archUnit.checkRules('./src', rules);

// Calculate metrics
const analyzer = new ArchitecturalMetricsAnalyzer(classes, violations);
const metrics = analyzer.calculateMetrics();

// Print report
console.log(ArchitecturalMetricsAnalyzer.formatMetrics(metrics));
```

### Output Example

```
Architectural Metrics Report
======================================================================

Architecture Fitness Score: 87.3/100
----------------------------------------------------------------------
  Layering:        92.1/100
  Dependencies:    85.4/100
  Naming:          95.0/100
  Maintainability: 89.2/100

Summary
----------------------------------------------------------------------
  Total Classes:        156
  Total Packages:       12
  Avg Instability:      0.437
  Avg Abstractness:     0.215
  Circular Deps:        2

Technical Debt
----------------------------------------------------------------------
  Debt Score:           23/100
  Est. Hours to Fix:    4.5h
  Trend:                stable

Packages Needing Attention (furthest from main sequence):
----------------------------------------------------------------------
  infrastructure: 0.524
  controllers: 0.387
  utils: 0.298
```

---

## Metric Categories

### Coupling Metrics

Coupling metrics measure how interconnected your packages are. Lower coupling is generally better.

#### **Afferent Coupling (Ca)**

Number of classes **outside** a package that depend on classes **inside** the package.

- **Higher Ca** = More dependents (stable package)
- **Good for:** Core libraries, domain models
- **Bad for:** Utilities, infrastructure

#### **Efferent Coupling (Ce)**

Number of classes **inside** a package that depend on classes **outside** the package.

- **Higher Ce** = More dependencies (unstable package)
- **Good for:** Application layer, controllers
- **Bad for:** Domain models, core business logic

#### **Instability (I)**

Measures how resistant to change a package is.

**Formula:** `I = Ce / (Ca + Ce)`

- **Range:** 0 to 1
- **I = 0** → Maximally stable (all incoming dependencies)
- **I = 1** → Maximally unstable (all outgoing dependencies)

**Interpretation:**

- Domain models should have low I (stable)
- Application/UI layers can have high I (flexible)

#### **Abstractness (A)**

Ratio of abstract classes/interfaces to total classes.

**Formula:** `A = Abstract Classes / Total Classes`

- **Range:** 0 to 1
- **A = 0** → Completely concrete
- **A = 1** → Completely abstract

**Interpretation:**

- Stable packages (low I) should be abstract (high A)
- Unstable packages (high I) can be concrete (low A)

#### **Distance from Main Sequence (D)**

Measures how balanced a package is between abstractness and stability.

**Formula:** `D = |A + I - 1|`

- **Range:** 0 to 1
- **D = 0** → Perfectly balanced (on main sequence)
- **D = 1** → Maximally unbalanced

**Zones:**

- **Zone of Pain** (A=0, I=0): Rigid, concrete, stable → Hard to change
- **Zone of Uselessness** (A=1, I=1): Abstract, unstable → No value
- **Main Sequence** (D≈0): Balanced → Healthy architecture

**Example:**

```typescript
// Access coupling metrics by package
for (const [pkg, metrics] of metrics.coupling.entries()) {
  console.log(`Package: ${pkg}`);
  console.log(`  Ca (Afferent): ${metrics.ca}`);
  console.log(`  Ce (Efferent): ${metrics.ce}`);
  console.log(`  Instability: ${metrics.instability.toFixed(3)}`);
  console.log(`  Abstractness: ${metrics.abstractness.toFixed(3)}`);
  console.log(`  Distance: ${metrics.distance.toFixed(3)}`);

  if (metrics.distance > 0.5) {
    console.warn(`  ⚠️ High distance - needs refactoring`);
  }
}
```

---

### Cohesion Metrics

Cohesion measures how well class members belong together. Higher cohesion is better.

#### **LCOM (Lack of Cohesion of Methods)**

Simplified measure of class cohesion.

- **Lower LCOM** = Higher cohesion (good)
- **Higher LCOM** = Lower cohesion (bad)

**Interpretation:**

- LCOM < 2: Good cohesion
- LCOM 2-5: Moderate cohesion
- LCOM > 5: Poor cohesion (consider splitting class)

#### **Average Methods/Properties per Class**

Simple counts that indicate class complexity.

**Example:**

```typescript
const { cohesion } = metrics;

console.log(`LCOM: ${cohesion.lcom.toFixed(2)}`);
console.log(`Avg Methods: ${cohesion.averageMethodsPerClass.toFixed(1)}`);
console.log(`Avg Properties: ${cohesion.averagePropertiesPerClass.toFixed(1)}`);

if (cohesion.lcom > 5) {
  console.warn('⚠️ Low cohesion - classes may have too many responsibilities');
}
```

---

### Complexity Metrics

Complexity metrics measure how intricate the dependency structure is.

#### **Average Dependencies**

Mean number of dependencies per class.

- **< 5**: Good
- **5-10**: Moderate
- **> 10**: High complexity

#### **Maximum Dependencies**

Highest dependency count of any single class.

- Identifies coupling hotspots
- Classes with 15+ dependencies need refactoring

#### **Dependency Depth**

Longest path in the dependency graph.

- **Lower is better**
- Deep dependency chains are fragile
- Indicates tight coupling

#### **Circular Dependencies**

Number of dependency cycles detected.

- **Should be 0**
- Cycles create maintenance nightmares
- Break cycles with dependency inversion

#### **Fan-In / Fan-Out**

- **Fan-In**: How many classes depend on this class
- **Fan-Out**: How many classes this class depends on

**Example:**

```typescript
const { complexity } = metrics;

console.log(`Avg Dependencies: ${complexity.averageDependencies.toFixed(1)}`);
console.log(`Max Dependencies: ${complexity.maxDependencies}`);
console.log(`Dependency Depth: ${complexity.dependencyDepth}`);
console.log(`Circular Dependencies: ${complexity.circularDependencies}`);

// Find classes with highest fan-out (most dependencies)
const highFanOut = Array.from(complexity.fanOut.entries())
  .filter(([_, count]) => count > 10)
  .sort((a, b) => b[1] - a[1]);

console.log('\nClasses with highest coupling:');
highFanOut.forEach(([className, count]) => {
  console.log(`  ${className}: ${count} dependencies`);
});
```

---

### Technical Debt

Technical debt metrics estimate the cost of fixing architectural violations.

#### **Total Debt Score**

Overall debt on a 0-100 scale (higher is worse).

- **0-20**: Low debt
- **20-50**: Moderate debt
- **50-80**: High debt
- **80-100**: Critical debt

#### **Estimated Hours to Fix**

Time estimate to resolve all violations.

**Estimation Rules:**

- Naming violations: 0.25h each
- Decorator violations: 0.25h each
- Package organization: 0.5h each
- Dependency violations: 1h each
- Layer violations: 2h each

#### **Debt by Category**

Breakdown showing where debt is concentrated.

**Example:**

```typescript
const { technicalDebt } = metrics;

console.log(`Total Debt Score: ${technicalDebt.totalDebtScore}/100`);
console.log(`Estimated Fix Time: ${technicalDebt.estimatedHoursToFix}h`);
console.log(`Trend: ${technicalDebt.trend}`);

// Show debt by category
for (const [category, hours] of technicalDebt.debtByCategory.entries()) {
  console.log(`  ${category}: ${hours.toFixed(1)}h`);
}

// Top debt items
console.log('\nTop Technical Debt Items:');
technicalDebt.items.slice(0, 5).forEach((item) => {
  console.log(`  [${item.severity}] ${item.description}`);
  console.log(`    Location: ${item.location}`);
  console.log(`    Estimated: ${item.estimatedHours}h`);
});
```

---

### Architecture Fitness

Overall health score combining all metrics.

#### **Overall Score**

Composite score (0-100, higher is better).

- **90-100**: Excellent
- **70-89**: Good
- **50-69**: Fair
- **< 50**: Poor

#### **Component Scores**

**Layering Score** - How well layers are separated

- Based on coupling metrics
- Penalizes high distance from main sequence

**Dependency Score** - Quality of dependency management

- Based on complexity metrics
- Penalizes circular dependencies and high coupling

**Naming Score** - Adherence to naming conventions

- Based on violation count
- Higher violations = lower score

**Maintainability Index** - Long-term maintainability

- Combines cohesion and overall fitness
- Indicates how easy code is to change

**Example:**

```typescript
const { fitness } = metrics;

console.log(`Overall Fitness: ${fitness.overallScore.toFixed(1)}/100`);
console.log(`  Layering: ${fitness.layeringScore.toFixed(1)}/100`);
console.log(`  Dependencies: ${fitness.dependencyScore.toFixed(1)}/100`);
console.log(`  Naming: ${fitness.namingScore.toFixed(1)}/100`);
console.log(`  Maintainability: ${fitness.maintainabilityIndex.toFixed(1)}/100`);

console.log('\nBreakdown:');
console.log(`  Coupling: ${fitness.breakdown.couplingScore.toFixed(1)}/100`);
console.log(`  Cohesion: ${fitness.breakdown.cohesionScore.toFixed(1)}/100`);
console.log(`  Complexity: ${fitness.breakdown.complexityScore.toFixed(1)}/100`);
console.log(`  Violations: ${fitness.breakdown.violationScore.toFixed(1)}/100`);

if (fitness.overallScore < 70) {
  console.warn('⚠️ Architecture fitness below recommended threshold');
}
```

---

## Understanding the Results

### Interpreting Coupling Metrics

**Example Package Analysis:**

| Package     | Ca  | Ce  | I    | A    | D        | Status                        |
| ----------- | --- | --- | ---- | ---- | -------- | ----------------------------- |
| domain      | 15  | 2   | 0.12 | 0.40 | **0.48** | ⚠️ Too concrete for stability |
| services    | 8   | 12  | 0.60 | 0.15 | **0.25** | ✅ Balanced                   |
| controllers | 0   | 18  | 1.00 | 0.05 | **0.05** | ✅ Appropriate for UI layer   |
| utils       | 20  | 0   | 0.00 | 0.00 | **1.00** | ⚠️ Zone of Pain!              |

**Recommendations:**

1. **domain** (D=0.48): Increase abstractness (add interfaces)
2. **services** (D=0.25): Good balance, maintain current design
3. **controllers** (D=0.05): Acceptable for presentation layer
4. **utils** (D=1.00): **Critical!** Highly coupled and concrete - refactor urgently

### Target Ranges

| Metric           | Excellent | Good    | Fair    | Poor  |
| ---------------- | --------- | ------- | ------- | ----- |
| Distance (D)     | 0.0-0.1   | 0.1-0.3 | 0.3-0.5 | > 0.5 |
| LCOM             | < 2       | 2-3     | 3-5     | > 5   |
| Avg Dependencies | < 5       | 5-8     | 8-12    | > 12  |
| Circular Deps    | 0         | 0       | 1-2     | > 2   |
| Fitness Score    | 90-100    | 70-89   | 50-69   | < 50  |

---

## Best Practices

### 1. Track Metrics Over Time

```typescript
// Save metrics history
import * as fs from 'fs';

const metrics = analyzer.calculateMetrics();

const history = {
  timestamp: new Date().toISOString(),
  overallScore: metrics.fitness.overallScore,
  technicalDebt: metrics.technicalDebt.estimatedHoursToFix,
  circularDeps: metrics.complexity.circularDependencies,
};

fs.appendFileSync('metrics-history.json', JSON.stringify(history) + '\n');
```

### 2. Set Quality Gates

```typescript
// Fail CI if metrics fall below thresholds
const thresholds = {
  minFitnessScore: 70,
  maxCircularDeps: 0,
  maxDebtHours: 8,
  maxDistance: 0.5,
};

if (metrics.fitness.overallScore < thresholds.minFitnessScore) {
  throw new Error(
    `Architecture fitness ${metrics.fitness.overallScore} below threshold ${thresholds.minFitnessScore}`
  );
}

if (metrics.complexity.circularDependencies > thresholds.maxCircularDeps) {
  throw new Error(`Circular dependencies detected: ${metrics.complexity.circularDependencies}`);
}

if (metrics.technicalDebt.estimatedHoursToFix > thresholds.maxDebtHours) {
  throw new Error(
    `Technical debt ${metrics.technicalDebt.estimatedHoursToFix}h exceeds ${thresholds.maxDebtHours}h`
  );
}
```

### 3. Focus on High-Impact Issues

```typescript
// Prioritize packages with worst metrics
const worstPackages = metrics.summary.worstPackages;

console.log('📊 Refactoring Priorities:');
worstPackages.forEach((pkg, index) => {
  const pkgMetrics = metrics.coupling.get(pkg.package);

  console.log(`\n${index + 1}. ${pkg.package} (D=${pkg.distance.toFixed(3)})`);
  console.log(`   Status: ${getZone(pkgMetrics)}`);
  console.log(`   Action: ${getRecommendation(pkgMetrics)}`);
});

function getZone(m: CouplingMetrics): string {
  if (m.instability < 0.2 && m.abstractness < 0.2) return 'Zone of Pain 🔥';
  if (m.instability > 0.8 && m.abstractness > 0.8) return 'Zone of Uselessness 🤷';
  return 'Main Sequence ✅';
}

function getRecommendation(m: CouplingMetrics): string {
  if (m.instability < 0.2 && m.abstractness < 0.5) {
    return 'Extract interfaces, increase abstraction';
  }
  if (m.instability > 0.5 && m.abstractness > 0.5) {
    return 'Add concrete implementations or remove abstractions';
  }
  return 'Maintain current balance';
}
```

### 4. Combine with Violation Analysis

```typescript
import { ViolationAnalyzer } from 'archunit-ts';

// Get enhanced violations with suggestions
const violationAnalyzer = new ViolationAnalyzer(violations);
const analysis = violationAnalyzer.analyze();

// Combine with metrics
console.log('🎯 Architecture Assessment\n');

console.log(`Fitness Score: ${metrics.fitness.overallScore.toFixed(1)}/100`);
console.log(`Technical Debt: ${metrics.technicalDebt.estimatedHoursToFix}h`);
console.log(`Total Violations: ${violations.length}`);
console.log(`High-Impact Violations: ${analysis.highImpact.length}`);

console.log('\n📍 Hotspots:');
analysis.hotspots.forEach((hotspot) => {
  console.log(`  ${hotspot.location}: ${hotspot.count} violations`);
});
```

---

## Integration

### With CI/CD Pipelines

**GitHub Actions Example:**

```yaml
name: Architecture Metrics

on: [push, pull_request]

jobs:
  metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm install
      - run: npm run arch:metrics

      - name: Upload metrics
        uses: actions/upload-artifact@v3
        with:
          name: metrics-report
          path: metrics-report.json
```

**metrics.ts:**

```typescript
import * as fs from 'fs';
import { ArchUnitTS, ArchitecturalMetricsAnalyzer, ArchRuleDefinition } from 'archunit-ts';

async function main() {
  const archUnit = new ArchUnitTS();
  const classes = await archUnit.analyzeCode('./src');

  // Run your rules
  const violations = await archUnit.checkRules('./src', [
    ArchRuleDefinition.classes()
      .that()
      .resideInPackage('domain')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('infrastructure'),
  ]);

  const analyzer = new ArchitecturalMetricsAnalyzer(classes, violations);
  const metrics = analyzer.calculateMetrics();

  // Save report
  fs.writeFileSync('metrics-report.json', JSON.stringify(metrics, null, 2));
  console.log(ArchitecturalMetricsAnalyzer.formatMetrics(metrics));

  // Enforce thresholds
  if (metrics.fitness.overallScore < 70) {
    console.error('❌ Architecture fitness below threshold');
    process.exit(1);
  }
}

main().catch(console.error);
```

### With Jest Tests

```typescript
import { ArchUnitTS, ArchitecturalMetricsAnalyzer } from 'archunit-ts';

describe('Architecture Metrics', () => {
  let metrics: ArchitecturalMetricsResult;

  beforeAll(async () => {
    const archUnit = new ArchUnitTS();
    const classes = await archUnit.analyzeCode('./src');
    const analyzer = new ArchitecturalMetricsAnalyzer(classes);
    metrics = analyzer.calculateMetrics();
  });

  it('should have fitness score above 70', () => {
    expect(metrics.fitness.overallScore).toBeGreaterThanOrEqual(70);
  });

  it('should have no circular dependencies', () => {
    expect(metrics.complexity.circularDependencies).toBe(0);
  });

  it('should have low technical debt', () => {
    expect(metrics.technicalDebt.estimatedHoursToFix).toBeLessThan(10);
  });

  it('should have balanced packages', () => {
    for (const [pkg, coupling] of metrics.coupling.entries()) {
      expect(coupling.distance).toBeLessThan(0.5);
    }
  });
});
```

---

## Examples

### Example 1: Health Check Script

```typescript
#!/usr/bin/env node
import { ArchUnitTS, ArchitecturalMetricsAnalyzer } from 'archunit-ts';

async function healthCheck() {
  console.log('🏥 Running Architecture Health Check...\n');

  const archUnit = new ArchUnitTS();
  const classes = await archUnit.analyzeCode('./src');
  const analyzer = new ArchitecturalMetricsAnalyzer(classes);
  const metrics = analyzer.calculateMetrics();

  const score = metrics.fitness.overallScore;
  const emoji = score >= 90 ? '🟢' : score >= 70 ? '🟡' : '🔴';

  console.log(`${emoji} Architecture Fitness: ${score.toFixed(1)}/100`);

  if (score < 70) {
    console.log('\n⚠️ Issues detected:');

    if (metrics.complexity.circularDependencies > 0) {
      console.log(`  - ${metrics.complexity.circularDependencies} circular dependencies`);
    }

    if (metrics.technicalDebt.estimatedHoursToFix > 5) {
      console.log(`  - High technical debt: ${metrics.technicalDebt.estimatedHoursToFix}h`);
    }

    if (metrics.summary.worstPackages[0].distance > 0.5) {
      console.log(
        `  - Packages need refactoring: ${metrics.summary.worstPackages.map((p) => p.package).join(', ')}`
      );
    }
  }

  process.exit(score >= 70 ? 0 : 1);
}

healthCheck().catch(console.error);
```

### Example 2: Generate HTML Report

```typescript
import * as fs from 'fs';
import { ArchUnitTS, ArchitecturalMetricsAnalyzer } from 'archunit-ts';

async function generateReport() {
  const archUnit = new ArchUnitTS();
  const classes = await archUnit.analyzeCode('./src');
  const analyzer = new ArchitecturalMetricsAnalyzer(classes);
  const metrics = analyzer.calculateMetrics();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Architecture Metrics Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .score { font-size: 48px; font-weight: bold; }
    .good { color: green; }
    .warning { color: orange; }
    .bad { color: red; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
  </style>
</head>
<body>
  <h1>Architecture Metrics Report</h1>
  <p>Generated: ${new Date().toISOString()}</p>

  <h2>Fitness Score</h2>
  <div class="score ${getScoreClass(metrics.fitness.overallScore)}">
    ${metrics.fitness.overallScore.toFixed(1)}/100
  </div>

  <h2>Summary</h2>
  <table>
    <tr><th>Metric</th><th>Value</th></tr>
    <tr><td>Total Classes</td><td>${metrics.summary.totalClasses}</td></tr>
    <tr><td>Total Packages</td><td>${metrics.summary.totalPackages}</td></tr>
    <tr><td>Avg Instability</td><td>${metrics.summary.averageInstability.toFixed(3)}</td></tr>
    <tr><td>Circular Dependencies</td><td>${metrics.complexity.circularDependencies}</td></tr>
    <tr><td>Technical Debt</td><td>${metrics.technicalDebt.estimatedHoursToFix.toFixed(1)}h</td></tr>
  </table>

  <h2>Packages</h2>
  <table>
    <tr><th>Package</th><th>Ca</th><th>Ce</th><th>I</th><th>A</th><th>D</th></tr>
    ${Array.from(metrics.coupling.entries())
      .map(
        ([pkg, m]) => `
        <tr>
          <td>${pkg}</td>
          <td>${m.ca}</td>
          <td>${m.ce}</td>
          <td>${m.instability.toFixed(3)}</td>
          <td>${m.abstractness.toFixed(3)}</td>
          <td class="${m.distance > 0.5 ? 'bad' : 'good'}">${m.distance.toFixed(3)}</td>
        </tr>
      `
      )
      .join('')}
  </table>
</body>
</html>
  `;

  fs.writeFileSync('metrics-report.html', html);
  console.log('✅ Report generated: metrics-report.html');
}

function getScoreClass(score: number): string {
  if (score >= 90) return 'good';
  if (score >= 70) return 'warning';
  return 'bad';
}

generateReport().catch(console.error);
```

---

## API Reference

### ArchitecturalMetricsAnalyzer

```typescript
class ArchitecturalMetricsAnalyzer {
  constructor(classes: TSClasses, violations?: ArchitectureViolation[]);

  calculateMetrics(): ArchitecturalMetricsResult;

  static formatMetrics(metrics: ArchitecturalMetricsResult): string;
}
```

### ArchitecturalMetricsResult

```typescript
interface ArchitecturalMetricsResult {
  coupling: Map<string, CouplingMetrics>;
  cohesion: CohesionMetrics;
  complexity: ComplexityMetrics;
  technicalDebt: TechnicalDebt;
  fitness: ArchitectureFitness;
  summary: {
    totalClasses: number;
    totalPackages: number;
    averageInstability: number;
    averageAbstractness: number;
    worstPackages: Array<{ package: string; distance: number }>;
    bestPackages: Array<{ package: string; distance: number }>;
  };
}
```

### CouplingMetrics

```typescript
interface CouplingMetrics {
  ca: number; // Afferent coupling
  ce: number; // Efferent coupling
  instability: number; // I = Ce / (Ca + Ce)
  abstractCount: number; // Number of abstract classes
  totalCount: number; // Total classes in package
  abstractness: number; // A = abstracts / total
  distance: number; // D = |A + I - 1|
}
```

### CohesionMetrics

```typescript
interface CohesionMetrics {
  lcom: number; // Lack of Cohesion of Methods
  averageMethodsPerClass: number; // Avg methods per class
  averagePropertiesPerClass: number; // Avg properties per class
}
```

### ComplexityMetrics

```typescript
interface ComplexityMetrics {
  averageDependencies: number; // Avg dependencies per class
  maxDependencies: number; // Max dependencies of any class
  dependencyDepth: number; // Longest dependency path
  circularDependencies: number; // Number of cycles
  fanIn: Map<string, number>; // Classes depending on this
  fanOut: Map<string, number>; // Classes this depends on
}
```

### TechnicalDebt

```typescript
interface TechnicalDebt {
  totalDebtScore: number; // 0-100 (higher is worse)
  estimatedHoursToFix: number; // Time to fix all violations
  debtByCategory: Map<string, number>; // Hours by category
  trend: 'improving' | 'stable' | 'worsening';
  items: DebtItem[]; // Individual debt items
}

interface DebtItem {
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  estimatedHours: number;
  location: string;
}
```

### ArchitectureFitness

```typescript
interface ArchitectureFitness {
  overallScore: number; // 0-100 (higher is better)
  layeringScore: number; // Layering adherence
  namingScore: number; // Naming conventions
  dependencyScore: number; // Dependency management
  maintainabilityIndex: number; // Overall maintainability
  breakdown: {
    couplingScore: number;
    cohesionScore: number;
    complexityScore: number;
    violationScore: number;
  };
}
```

---

## Glossary

- **Afferent Coupling (Ca)**: Incoming dependencies to a package
- **Efferent Coupling (Ce)**: Outgoing dependencies from a package
- **Instability (I)**: Resistance to change (0=stable, 1=unstable)
- **Abstractness (A)**: Ratio of abstractions to concrete classes
- **Distance (D)**: How far from ideal balance (0=perfect, 1=worst)
- **LCOM**: Lack of Cohesion of Methods (lower is better)
- **Fan-In**: Number of classes that depend on a class
- **Fan-Out**: Number of classes a class depends on
- **Main Sequence**: Ideal line where D=0 (balanced A and I)
- **Zone of Pain**: Concrete and stable packages (hard to change)
- **Zone of Uselessness**: Abstract and unstable packages (no value)

---

## Next Steps

- [Rule Composition](./RULE_COMPOSITION.md) - Combine rules with logical operators
- [Violation Intelligence](./VIOLATION_INTELLIGENCE.md) - Smart violation analysis
- [Testing Guide](./TESTING_UTILITIES.md) - Test your architecture rules
- [Patterns Library](./PATTERN_LIBRARY.md) - Predefined architectural patterns
