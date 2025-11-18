import { TSClasses } from '../core/TSClasses';
import { TSClass } from '../core/TSClass';
import { ArchitectureViolation } from '../types';
import { DependencyGraph, DependencyType } from '../graph/DependencyGraph';

/**
 * Coupling metrics for a package/module
 */
export interface CouplingMetrics {
  /** Afferent Coupling - number of classes outside this package that depend on classes inside */
  ca: number;

  /** Efferent Coupling - number of classes inside this package that depend on classes outside */
  ce: number;

  /** Instability - I = Ce / (Ca + Ce), range [0,1] */
  instability: number;

  /** Number of abstract classes/interfaces */
  abstractCount: number;

  /** Total number of classes */
  totalCount: number;

  /** Abstractness - A = abstracts / total, range [0,1] */
  abstractness: number;

  /** Distance from main sequence - D = |A + I - 1|, range [0,1] */
  distance: number;
}

/**
 * Cohesion metrics
 */
export interface CohesionMetrics {
  /** Lack of Cohesion of Methods - measures how well methods belong together */
  lcom: number;

  /** Average methods per class */
  averageMethodsPerClass: number;

  /** Average properties per class */
  averagePropertiesPerClass: number;
}

/**
 * Complexity metrics
 */
export interface ComplexityMetrics {
  /** Average dependencies per class */
  averageDependencies: number;

  /** Maximum dependencies of any single class */
  maxDependencies: number;

  /** Dependency depth - longest path in dependency graph */
  dependencyDepth: number;

  /** Number of circular dependencies */
  circularDependencies: number;

  /** Fan-in: classes that depend on this */
  fanIn: Map<string, number>;

  /** Fan-out: classes this depends on */
  fanOut: Map<string, number>;
}

/**
 * Technical debt assessment
 */
export interface TechnicalDebt {
  /** Overall debt score (0-100, higher is worse) */
  totalDebtScore: number;

  /** Estimated hours to fix all violations */
  estimatedHoursToFix: number;

  /** Debt by category */
  debtByCategory: Map<string, number>;

  /** Trend direction */
  trend: 'improving' | 'stable' | 'worsening';

  /** Debt items */
  items: DebtItem[];
}

/**
 * Individual debt item
 */
export interface DebtItem {
  /** Description of the debt */
  description: string;

  /** Severity */
  severity: 'critical' | 'high' | 'medium' | 'low';

  /** Estimated hours to fix */
  estimatedHours: number;

  /** Location */
  location: string;
}

/**
 * Architecture fitness score
 */
export interface ArchitectureFitness {
  /** Overall fitness score (0-100, higher is better) */
  overallScore: number;

  /** Layering adherence score */
  layeringScore: number;

  /** Naming convention score */
  namingScore: number;

  /** Dependency management score */
  dependencyScore: number;

  /** Maintainability index */
  maintainabilityIndex: number;

  /** Breakdown of scores */
  breakdown: {
    couplingScore: number;
    cohesionScore: number;
    complexityScore: number;
    violationScore: number;
  };
}

/**
 * Complete architectural metrics
 */
export interface ArchitecturalMetricsResult {
  /** Coupling metrics by package */
  coupling: Map<string, CouplingMetrics>;

  /** Cohesion metrics */
  cohesion: CohesionMetrics;

  /** Complexity metrics */
  complexity: ComplexityMetrics;

  /** Technical debt */
  technicalDebt: TechnicalDebt;

  /** Architecture fitness */
  fitness: ArchitectureFitness;

  /** Summary statistics */
  summary: {
    totalClasses: number;
    totalPackages: number;
    averageInstability: number;
    averageAbstractness: number;
    worstPackages: Array<{ package: string; distance: number }>;
    bestPackages: Array<{ package: string; distance: number }>;
  };
}

/**
 * Analyzer for calculating comprehensive architectural metrics
 *
 * @example
 * ```typescript
 * const analyzer = new ArchitecturalMetricsAnalyzer(classes, violations);
 * const metrics = analyzer.calculateMetrics();
 *
 * console.log(`Architecture Fitness: ${metrics.fitness.overallScore}/100`);
 * console.log(`Technical Debt: ${metrics.technicalDebt.estimatedHoursToFix} hours`);
 * console.log(`Average Instability: ${metrics.summary.averageInstability}`);
 * ```
 */
export class ArchitecturalMetricsAnalyzer {
  private classes: TSClasses;
  private violations: ArchitectureViolation[];
  private graph: DependencyGraph;

  constructor(classes: TSClasses, violations: ArchitectureViolation[] = []) {
    this.classes = classes;
    this.violations = violations;
    this.graph = new DependencyGraph();

    // Build dependency graph
    this.buildGraph();
  }

  /**
   * Calculate all architectural metrics
   */
  public calculateMetrics(): ArchitecturalMetricsResult {
    const coupling = this.calculateCouplingMetrics();
    const cohesion = this.calculateCohesionMetrics();
    const complexity = this.calculateComplexityMetrics();
    const technicalDebt = this.calculateTechnicalDebt();
    const fitness = this.calculateFitnessScore(coupling, cohesion, complexity);

    // Calculate summary statistics
    const packages = Array.from(coupling.keys());
    const instabilities = Array.from(coupling.values()).map((m) => m.instability);
    const abstractnesses = Array.from(coupling.values()).map((m) => m.abstractness);

    const averageInstability = instabilities.reduce((a, b) => a + b, 0) / instabilities.length || 0;
    const averageAbstractness =
      abstractnesses.reduce((a, b) => a + b, 0) / abstractnesses.length || 0;

    // Find worst and best packages (by distance from main sequence)
    const packageDistances = Array.from(coupling.entries())
      .map(([pkg, metrics]) => ({ package: pkg, distance: metrics.distance }))
      .sort((a, b) => b.distance - a.distance);

    const worstPackages = packageDistances.slice(0, 5);
    const bestPackages = packageDistances.slice(-5).reverse();

    return {
      coupling,
      cohesion,
      complexity,
      technicalDebt,
      fitness,
      summary: {
        totalClasses: this.classes.size(),
        totalPackages: packages.length,
        averageInstability,
        averageAbstractness,
        worstPackages,
        bestPackages,
      },
    };
  }

  /**
   * Build dependency graph from classes
   */
  private buildGraph(): void {
    const allClasses = this.classes.getAll();

    for (const cls of allClasses) {
      // Add class as node with proper GraphNode structure
      this.graph.addNode({
        id: cls.name,
        name: cls.name,
        type: 'class',
        filePath: cls.filePath,
        module: this.extractPackage(cls.filePath),
        metadata: {
          isAbstract: cls.isAbstract,
          isExported: true,
          decorators: cls.decorators.map((d) => d.name),
        },
      });

      // Add edges for dependencies
      const dependencies = cls.getDependencies();
      for (const dep of dependencies) {
        // Find the class that matches this dependency
        const depClass = allClasses.find((c) => c.name === dep || c.filePath.includes(dep));
        if (depClass) {
          this.graph.addEdge({
            from: cls.name,
            to: depClass.name,
            type: DependencyType.IMPORT,
          });
        }
      }
    }
  }

  /**
   * Calculate coupling metrics for each package
   */
  private calculateCouplingMetrics(): Map<string, CouplingMetrics> {
    const metrics = new Map<string, CouplingMetrics>();
    const allClasses = this.classes.getAll();

    // Group classes by package
    const packageMap = new Map<string, TSClass[]>();
    for (const cls of allClasses) {
      const pkg = this.extractPackage(cls.filePath);
      if (!packageMap.has(pkg)) {
        packageMap.set(pkg, []);
      }
      packageMap.get(pkg)!.push(cls);
    }

    // Calculate metrics for each package
    for (const [pkg, classes] of packageMap) {
      const ca = this.calculateAfferentCoupling(pkg, classes, allClasses);
      const ce = this.calculateEfferentCoupling(pkg, classes, allClasses);
      const totalCount = classes.length;
      const abstractCount = classes.filter((c) => c.isAbstract).length;

      const instability = ca + ce === 0 ? 0 : ce / (ca + ce);
      const abstractness = totalCount === 0 ? 0 : abstractCount / totalCount;
      const distance = Math.abs(abstractness + instability - 1);

      metrics.set(pkg, {
        ca,
        ce,
        instability,
        abstractCount,
        totalCount,
        abstractness,
        distance,
      });
    }

    return metrics;
  }

  /**
   * Calculate afferent coupling (Ca) - incoming dependencies
   */
  private calculateAfferentCoupling(
    pkg: string,
    classes: TSClass[],
    allClasses: TSClass[]
  ): number {
    const classesInPackage = new Set(classes.map((c) => c.name));
    let ca = 0;

    // Count classes outside this package that depend on classes inside
    for (const cls of allClasses) {
      const clsPkg = this.extractPackage(cls.filePath);
      if (clsPkg === pkg) continue; // Skip classes in same package

      const dependencies = cls.getDependencies();
      for (const dep of dependencies) {
        const depClass = classes.find((c) => c.name === dep || c.filePath.includes(dep));
        if (depClass && classesInPackage.has(depClass.name)) {
          ca++;
          break; // Count each external class only once
        }
      }
    }

    return ca;
  }

  /**
   * Calculate efferent coupling (Ce) - outgoing dependencies
   */
  private calculateEfferentCoupling(
    pkg: string,
    classes: TSClass[],
    allClasses: TSClass[]
  ): number {
    let ce = 0;
    const externalDeps = new Set<string>();

    // Count unique external dependencies
    for (const cls of classes) {
      const dependencies = cls.getDependencies();
      for (const dep of dependencies) {
        const depClass = allClasses.find((c) => c.name === dep || c.filePath.includes(dep));
        if (depClass) {
          const depPkg = this.extractPackage(depClass.filePath);
          if (depPkg !== pkg) {
            externalDeps.add(depClass.name);
          }
        }
      }
    }

    ce = externalDeps.size;
    return ce;
  }

  /**
   * Calculate cohesion metrics
   */
  private calculateCohesionMetrics(): CohesionMetrics {
    const allClasses = this.classes.getAll();

    if (allClasses.length === 0) {
      return {
        lcom: 0,
        averageMethodsPerClass: 0,
        averagePropertiesPerClass: 0,
      };
    }

    const totalMethods = allClasses.reduce((sum, cls) => sum + cls.methods.length, 0);
    const totalProperties = allClasses.reduce((sum, cls) => sum + cls.properties.length, 0);

    const averageMethodsPerClass = totalMethods / allClasses.length;
    const averagePropertiesPerClass = totalProperties / allClasses.length;

    // Calculate LCOM (simplified version)
    let totalLcom = 0;
    for (const cls of allClasses) {
      totalLcom += this.calculateClassLCOM(cls);
    }
    const lcom = totalLcom / allClasses.length;

    return {
      lcom,
      averageMethodsPerClass,
      averagePropertiesPerClass,
    };
  }

  /**
   * Calculate LCOM for a single class
   */
  private calculateClassLCOM(cls: TSClass): number {
    const methods = cls.methods.length;
    const properties = cls.properties.length;

    if (methods === 0 || properties === 0) return 0;

    // Simplified LCOM: ratio of methods to properties
    // Higher values indicate lower cohesion
    const lcom = methods / properties;

    return Math.min(lcom, 10); // Cap at 10
  }

  /**
   * Calculate complexity metrics
   */
  private calculateComplexityMetrics(): ComplexityMetrics {
    const allClasses = this.classes.getAll();

    const fanIn = new Map<string, number>();
    const fanOut = new Map<string, number>();

    let totalDeps = 0;
    let maxDeps = 0;

    // Calculate fan-in and fan-out
    for (const cls of allClasses) {
      const deps = cls.getDependencies();
      const depCount = deps.length;

      totalDeps += depCount;
      maxDeps = Math.max(maxDeps, depCount);

      fanOut.set(cls.name, depCount);

      // Count fan-in
      for (const dep of deps) {
        fanIn.set(dep, (fanIn.get(dep) || 0) + 1);
      }
    }

    const averageDependencies = allClasses.length > 0 ? totalDeps / allClasses.length : 0;

    // Calculate dependency depth (longest path)
    const dependencyDepth = this.calculateDependencyDepth();

    // Count circular dependencies
    const cycles = this.graph.findCycles();
    const circularDependencies = cycles.length;

    return {
      averageDependencies,
      maxDependencies: maxDeps,
      dependencyDepth,
      circularDependencies,
      fanIn,
      fanOut,
    };
  }

  /**
   * Calculate maximum dependency depth
   */
  private calculateDependencyDepth(): number {
    // Use DFS to find longest path
    let maxDepth = 0;

    const visited = new Set<string>();

    const dfs = (nodeId: string, depth: number): void => {
      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      maxDepth = Math.max(maxDepth, depth);

      const neighbors = this.graph.getDependencies(nodeId);
      for (const neighbor of neighbors) {
        dfs(neighbor, depth + 1);
      }

      visited.delete(nodeId);
    };

    const nodes = this.graph.getNodes();
    for (const node of nodes) {
      dfs(node.id, 0);
    }

    return maxDepth;
  }

  /**
   * Calculate technical debt
   */
  private calculateTechnicalDebt(): TechnicalDebt {
    const items: DebtItem[] = [];
    const debtByCategory = new Map<string, number>();

    let totalHours = 0;

    // Analyze violations
    for (const violation of this.violations) {
      const category = this.categorizeViolation(violation);
      const hours = this.estimateFixTime(violation);

      debtByCategory.set(category, (debtByCategory.get(category) || 0) + hours);
      totalHours += hours;

      items.push({
        description: violation.message,
        severity: violation.severity === 'error' ? 'high' : 'medium',
        estimatedHours: hours,
        location: violation.filePath,
      });
    }

    // Calculate debt score (0-100)
    const totalDebtScore = Math.min(100, (totalHours / 10) * 10); // 10+ hours = 100 score

    return {
      totalDebtScore,
      estimatedHoursToFix: totalHours,
      debtByCategory,
      trend: 'stable', // TODO: Calculate trend from history
      items: items.slice(0, 20), // Top 20 debt items
    };
  }

  /**
   * Categorize a violation
   */
  private categorizeViolation(violation: ArchitectureViolation): string {
    const message = violation.message.toLowerCase();

    if (message.includes('layer') || message.includes('depend')) return 'layering';
    if (message.includes('name') || message.includes('suffix')) return 'naming';
    if (message.includes('package') || message.includes('reside')) return 'organization';
    if (message.includes('decorator') || message.includes('annotated')) return 'decoration';

    return 'other';
  }

  /**
   * Estimate time to fix a violation
   */
  private estimateFixTime(violation: ArchitectureViolation): number {
    const message = violation.message.toLowerCase();

    // Naming violations: quick fix (0.25 hours)
    if (message.includes('name') || message.includes('suffix')) return 0.25;

    // Decorator violations: quick fix (0.25 hours)
    if (message.includes('decorator') || message.includes('annotated')) return 0.25;

    // Package organization: medium fix (0.5 hours)
    if (message.includes('package') || message.includes('reside')) return 0.5;

    // Dependency violations: longer fix (1 hour)
    if (message.includes('depend')) return 1.0;

    // Layer violations: significant refactoring (2 hours)
    if (message.includes('layer')) return 2.0;

    return 0.5; // default
  }

  /**
   * Calculate architecture fitness score
   */
  private calculateFitnessScore(
    coupling: Map<string, CouplingMetrics>,
    cohesion: CohesionMetrics,
    complexity: ComplexityMetrics
  ): ArchitectureFitness {
    // Coupling score (0-100, higher is better)
    const avgDistance =
      Array.from(coupling.values()).reduce((sum, m) => sum + m.distance, 0) / coupling.size || 0;
    const couplingScore = Math.max(0, 100 - avgDistance * 100);

    // Cohesion score (0-100, higher is better)
    const cohesionScore = Math.max(0, 100 - cohesion.lcom * 10);

    // Complexity score (0-100, higher is better)
    const complexityScore = Math.max(
      0,
      100 - complexity.circularDependencies * 10 - Math.min(complexity.averageDependencies * 2, 50)
    );

    // Violation score (0-100, higher is better)
    const violationCount = this.violations.length;
    const violationScore = Math.max(0, 100 - violationCount * 2);

    // Overall scores
    const layeringScore = couplingScore;
    const dependencyScore = (complexityScore + couplingScore) / 2;
    const namingScore = violationScore; // Simplified

    const overallScore = (couplingScore + cohesionScore + complexityScore + violationScore) / 4;
    const maintainabilityIndex = (overallScore + cohesionScore) / 2;

    return {
      overallScore,
      layeringScore,
      namingScore,
      dependencyScore,
      maintainabilityIndex,
      breakdown: {
        couplingScore,
        cohesionScore,
        complexityScore,
        violationScore,
      },
    };
  }

  /**
   * Extract package name from file path
   */
  private extractPackage(filePath: string): string {
    const parts = filePath.split('/');

    // Find src or lib index
    const srcIndex = parts.findIndex((p) => p === 'src' || p === 'lib');

    if (srcIndex >= 0 && srcIndex < parts.length - 1) {
      return parts[srcIndex + 1];
    }

    return parts[parts.length - 2] || 'unknown';
  }

  /**
   * Format metrics for console output
   */
  public static formatMetrics(metrics: ArchitecturalMetricsResult): string {
    const lines: string[] = [];

    lines.push('Architectural Metrics Report');
    lines.push('='.repeat(70));
    lines.push('');

    // Architecture Fitness
    lines.push('Architecture Fitness Score: ' + metrics.fitness.overallScore.toFixed(1) + '/100');
    lines.push('-'.repeat(70));
    lines.push(`  Layering:        ${metrics.fitness.layeringScore.toFixed(1)}/100`);
    lines.push(`  Dependencies:    ${metrics.fitness.dependencyScore.toFixed(1)}/100`);
    lines.push(`  Naming:          ${metrics.fitness.namingScore.toFixed(1)}/100`);
    lines.push(`  Maintainability: ${metrics.fitness.maintainabilityIndex.toFixed(1)}/100`);
    lines.push('');

    // Summary
    lines.push('Summary');
    lines.push('-'.repeat(70));
    lines.push(`  Total Classes:        ${metrics.summary.totalClasses}`);
    lines.push(`  Total Packages:       ${metrics.summary.totalPackages}`);
    lines.push(`  Avg Instability:      ${metrics.summary.averageInstability.toFixed(3)}`);
    lines.push(`  Avg Abstractness:     ${metrics.summary.averageAbstractness.toFixed(3)}`);
    lines.push(`  Circular Deps:        ${metrics.complexity.circularDependencies}`);
    lines.push('');

    // Technical Debt
    lines.push('Technical Debt');
    lines.push('-'.repeat(70));
    lines.push(`  Debt Score:           ${metrics.technicalDebt.totalDebtScore.toFixed(0)}/100`);
    lines.push(`  Est. Hours to Fix:    ${metrics.technicalDebt.estimatedHoursToFix.toFixed(1)}h`);
    lines.push(`  Trend:                ${metrics.technicalDebt.trend}`);
    lines.push('');

    // Worst packages
    if (metrics.summary.worstPackages.length > 0) {
      lines.push('Packages Needing Attention (furthest from main sequence):');
      lines.push('-'.repeat(70));
      for (const pkg of metrics.summary.worstPackages) {
        lines.push(`  ${pkg.package}: ${pkg.distance.toFixed(3)}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
