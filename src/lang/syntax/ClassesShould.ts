import { TSClasses } from '../../core/TSClasses';
import { TSClass } from '../../core/TSClass';
import { ArchRule, BaseArchRule } from '../../core/ArchRule';
import { ArchitectureViolation } from '../../types';

/**
 * Fluent API for defining "should" conditions on classes
 */
export class ClassesShould {
  private tsClasses: TSClasses;

  constructor(classes: TSClasses) {
    this.tsClasses = classes;
  }

  /**
   * Classes should reside in a specific package
   */
  public resideInPackage(packagePattern: string): ArchRule {
    return new PackageRule(this.tsClasses, packagePattern, false);
  }

  /**
   * Classes should reside outside a specific package
   */
  public resideOutsideOfPackage(packagePattern: string): ArchRule {
    return new PackageRule(this.tsClasses, packagePattern, true);
  }

  /**
   * Classes should NOT reside in a specific package (alias for resideOutsideOfPackage)
   */
  public notResideInPackage(packagePattern: string): ArchRule {
    return new PackageRule(this.tsClasses, packagePattern, true);
  }

  /**
   * Classes should be annotated with a decorator
   */
  public beAnnotatedWith(decoratorName: string): ArchRule {
    return new DecoratorRule(this.tsClasses, decoratorName, true);
  }

  /**
   * Classes should NOT be annotated with a decorator
   */
  public notBeAnnotatedWith(decoratorName: string): ArchRule {
    return new DecoratorRule(this.tsClasses, decoratorName, false);
  }

  /**
   * Classes should have names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): ArchRule {
    return new NamingRule(this.tsClasses, pattern, 'matching');
  }

  /**
   * Classes should have names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): ArchRule {
    return new NamingRule(this.tsClasses, suffix, 'endingWith');
  }

  /**
   * Classes should have names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): ArchRule {
    return new NamingRule(this.tsClasses, prefix, 'startingWith');
  }

  /**
   * Classes should NOT have a specific simple name (exact match)
   */
  public notHaveSimpleName(name: string): ArchRule {
    return new NotSimpleNameRule(this.tsClasses, name);
  }

  /**
   * Classes should NOT have names matching a pattern
   */
  public notHaveSimpleNameMatching(pattern: RegExp | string): ArchRule {
    return new NotNamingRule(this.tsClasses, pattern, 'matching');
  }

  /**
   * Classes should NOT have names ending with a suffix
   */
  public notHaveSimpleNameEndingWith(suffix: string): ArchRule {
    return new NotNamingRule(this.tsClasses, suffix, 'endingWith');
  }

  /**
   * Classes should NOT have names starting with a prefix
   */
  public notHaveSimpleNameStartingWith(prefix: string): ArchRule {
    return new NotNamingRule(this.tsClasses, prefix, 'startingWith');
  }

  /**
   * Classes should only depend on classes in specific packages
   */
  public onlyDependOnClassesThat(): ClassesDependencyShould {
    return new ClassesDependencyShould(this.tsClasses);
  }

  /**
   * Classes should not depend on classes in specific packages
   */
  public notDependOnClassesThat(): ClassesDependencyShould {
    return new ClassesDependencyShould(this.tsClasses, true);
  }

  /**
   * Classes should not form cyclic dependencies
   */
  public notFormCycles(): ArchRule {
    return new CyclicDependencyRule(this.tsClasses, true);
  }

  /**
   * Classes should form cycles (rarely used, for testing)
   */
  public formCycles(): ArchRule {
    return new CyclicDependencyRule(this.tsClasses, false);
  }

  /**
   * Classes should be interfaces
   */
  public beInterfaces(): ArchRule {
    return new InterfaceRule(this.tsClasses, true);
  }

  /**
   * Classes should NOT be interfaces
   */
  public notBeInterfaces(): ArchRule {
    return new InterfaceRule(this.tsClasses, false);
  }

  /**
   * Classes should be abstract
   */
  public beAbstract(): ArchRule {
    return new AbstractRule(this.tsClasses, true);
  }

  /**
   * Classes should NOT be abstract (should be concrete)
   */
  public notBeAbstract(): ArchRule {
    return new AbstractRule(this.tsClasses, false);
  }

  /**
   * Classes should be assignable to a specific type
   */
  public beAssignableTo(className: string): ArchRule {
    return new AssignableRule(this.tsClasses, className, true);
  }

  /**
   * Classes should NOT be assignable to a specific type
   */
  public notBeAssignableTo(className: string): ArchRule {
    return new AssignableRule(this.tsClasses, className, false);
  }

  /**
   * Classes should have only readonly fields (immutable)
   */
  public haveOnlyReadonlyFields(): ArchRule {
    return new ReadonlyFieldsRule(this.tsClasses);
  }

  /**
   * Classes should have only private constructors
   */
  public haveOnlyPrivateConstructors(): ArchRule {
    return new PrivateConstructorsRule(this.tsClasses);
  }

  /**
   * Classes should have only public methods
   */
  public haveOnlyPublicMethods(): ArchRule {
    return new PublicMethodsRule(this.tsClasses);
  }

  /**
   * Classes should have a specific fully qualified name
   */
  public haveFullyQualifiedName(fqn: string): ArchRule {
    return new FullyQualifiedNameRule(this.tsClasses, fqn);
  }

  /**
   * Classes should have a specific simple name (exact match)
   */
  public haveSimpleName(name: string): ArchRule {
    return new SimpleNameRule(this.tsClasses, name);
  }

  /**
   * Classes should be assignable from a specific type
   */
  public beAssignableFrom(className: string): ArchRule {
    return new AssignableFromRule(this.tsClasses, className);
  }
}

/**
 * Rule for checking package location
 */
class PackageRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private packagePattern: string,
    private outside: boolean
  ) {
    super(
      `Classes should ${outside ? 'reside outside of' : 'reside in'} package '${packagePattern}'`
    );
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const residesIn = cls.residesInPackage(this.packagePattern);
      const violates = this.outside ? residesIn : !residesIn;

      if (violates) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' ${this.outside ? 'resides in' : 'does not reside in'} package '${this.packagePattern}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking decorators/annotations
 */
class DecoratorRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private decoratorName: string,
    private shouldHave: boolean
  ) {
    super(`Classes should ${shouldHave ? 'be' : 'not be'} annotated with '@${decoratorName}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const hasDecorator = cls.isAnnotatedWith(this.decoratorName);
      const violates = this.shouldHave ? !hasDecorator : hasDecorator;

      if (violates) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' ${this.shouldHave ? 'is not' : 'is'} annotated with '@${this.decoratorName}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking naming conventions
 */
class NamingRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private pattern: RegExp | string,
    private type: 'matching' | 'endingWith' | 'startingWith'
  ) {
    super(`Classes should have simple name ${type} '${pattern}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      let matches = false;

      switch (this.type) {
        case 'matching':
          matches = cls.hasSimpleNameMatching(this.pattern);
          break;
        case 'endingWith':
          matches = cls.hasSimpleNameEndingWith(this.pattern as string);
          break;
        case 'startingWith':
          matches = cls.hasSimpleNameStartingWith(this.pattern as string);
          break;
      }

      if (!matches) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' does not have simple name ${this.type} '${this.pattern}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Dependency condition builder
 */
export class ClassesDependencyShould {
  constructor(
    private classes: TSClasses,
    private negated: boolean = false
  ) {}

  public resideInPackage(packagePattern: string): ArchRule {
    return new DependencyPackageRule(this.classes, packagePattern, this.negated);
  }

  public resideInAnyPackage(...packagePatterns: string[]): ArchRule {
    return new DependencyMultiPackageRule(this.classes, packagePatterns, this.negated);
  }
}

/**
 * Rule for checking dependencies on packages
 */
class DependencyPackageRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private packagePattern: string,
    private negated: boolean
  ) {
    super(
      `Classes should ${negated ? 'not depend on' : 'only depend on'} classes in package '${packagePattern}'`
    );
  }

  /**
   * Check if a dependency path matches a package pattern using path segments
   * This prevents false positives from substring matching
   */
  private matchesPackagePattern(dependency: string, pattern: string): boolean {
    // Normalize path separators
    const normalizedDep = dependency.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\./g, '/');

    // Split into segments
    const depSegments = normalizedDep.split('/').filter((s) => s.length > 0);
    const patternSegments = normalizedPattern.split('/').filter((s) => s.length > 0);

    // Check if pattern segments appear consecutively in dependency path
    for (let i = 0; i <= depSegments.length - patternSegments.length; i++) {
      let match = true;
      for (let j = 0; j < patternSegments.length; j++) {
        // Support wildcards
        if (patternSegments[j] === '**') {
          continue; // ** matches any number of segments
        } else if (patternSegments[j] === '*') {
          continue; // * matches one segment
        } else if (depSegments[i + j] !== patternSegments[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return true;
      }
    }

    return false;
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const dependencies = cls.getDependencies();

      if (this.negated) {
        // Should NOT depend on classes in this package
        const forbiddenDeps = dependencies.filter((dep) =>
          this.matchesPackagePattern(dep, this.packagePattern)
        );

        if (forbiddenDeps.length > 0) {
          violations.push(
            this.createViolation(
              `Class '${cls.name}' should not depend on classes in package '${this.packagePattern}' but has dependencies: ${forbiddenDeps.join(', ')}`,
              cls.filePath,
              this.description
            )
          );
        }
      } else {
        // Should ONLY depend on classes in this package
        const invalidDeps = dependencies.filter((dep) => {
          // Allow relative imports (internal to the module)
          if (dep.startsWith('.') || dep.startsWith('..')) {
            return false;
          }

          // Allow node_modules dependencies
          if (!dep.startsWith('/') && !dep.includes('/')) {
            return false; // Likely a package name like 'lodash'
          }

          return !this.matchesPackagePattern(dep, this.packagePattern);
        });

        if (invalidDeps.length > 0) {
          violations.push(
            this.createViolation(
              `Class '${cls.name}' should only depend on classes in package '${this.packagePattern}' but depends on: ${invalidDeps.join(', ')}`,
              cls.filePath,
              this.description
            )
          );
        }
      }
    }

    return violations;
  }
}

/**
 * Rule for checking dependencies on multiple packages
 */
class DependencyMultiPackageRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private packagePatterns: string[],
    private negated: boolean
  ) {
    super(
      `Classes should ${negated ? 'not depend on' : 'only depend on'} classes in packages [${packagePatterns.join(', ')}]`
    );
  }

  /**
   * Check if a dependency path matches any of the package patterns using path segments
   * This prevents false positives from substring matching
   */
  private matchesAnyPackagePattern(dependency: string, patterns: string[]): boolean {
    return patterns.some((pattern) => this.matchesPackagePattern(dependency, pattern));
  }

  /**
   * Check if a dependency path matches a package pattern using path segments
   * This prevents false positives from substring matching
   */
  private matchesPackagePattern(dependency: string, pattern: string): boolean {
    // Normalize path separators
    const normalizedDep = dependency.replace(/\\/g, '/');
    const normalizedPattern = pattern.replace(/\./g, '/');

    // Split into segments
    const depSegments = normalizedDep.split('/').filter((s) => s.length > 0);
    const patternSegments = normalizedPattern.split('/').filter((s) => s.length > 0);

    // Check if pattern segments appear consecutively in dependency path
    for (let i = 0; i <= depSegments.length - patternSegments.length; i++) {
      let match = true;
      for (let j = 0; j < patternSegments.length; j++) {
        // Support wildcards
        if (patternSegments[j] === '**') {
          continue; // ** matches any number of segments
        } else if (patternSegments[j] === '*') {
          continue; // * matches one segment
        } else if (depSegments[i + j] !== patternSegments[j]) {
          match = false;
          break;
        }
      }
      if (match) {
        return true;
      }
    }

    return false;
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const dependencies = cls.getDependencies();

      if (this.negated) {
        // Should NOT depend on classes in these packages
        const forbiddenDeps = dependencies.filter((dep) =>
          this.matchesAnyPackagePattern(dep, this.packagePatterns)
        );

        if (forbiddenDeps.length > 0) {
          violations.push(
            this.createViolation(
              `Class '${cls.name}' should not depend on classes in packages [${this.packagePatterns.join(', ')}] but depends on: ${forbiddenDeps.join(', ')}`,
              cls.filePath,
              this.description
            )
          );
        }
      } else {
        // Should ONLY depend on classes in these packages
        const invalidDeps = dependencies.filter((dep) => {
          // Allow relative imports (internal to the module)
          if (dep.startsWith('.') || dep.startsWith('..')) {
            return false;
          }

          // Allow node_modules dependencies
          if (!dep.startsWith('/') && !dep.includes('/')) {
            return false; // Likely a package name like 'lodash'
          }

          return !this.matchesAnyPackagePattern(dep, this.packagePatterns);
        });

        if (invalidDeps.length > 0) {
          violations.push(
            this.createViolation(
              `Class '${cls.name}' should only depend on classes in packages [${this.packagePatterns.join(', ')}] but depends on: ${invalidDeps.join(', ')}`,
              cls.filePath,
              this.description
            )
          );
        }
      }
    }

    return violations;
  }
}

/**
 * Rule for checking cyclic dependencies
 */
class CyclicDependencyRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private shouldNotFormCycles: boolean
  ) {
    super(`Classes should ${shouldNotFormCycles ? 'not form' : 'form'} cyclic dependencies`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const cycles = this.findCycles();

    if (this.shouldNotFormCycles && cycles.length > 0) {
      // Report each cycle as a violation
      for (const cycle of cycles) {
        const cycleDescription = cycle.map((c) => c.name).join(' -> ');
        violations.push(
          this.createViolation(
            `Cyclic dependency detected: ${cycleDescription}`,
            cycle[0].filePath,
            this.description
          )
        );
      }
    } else if (!this.shouldNotFormCycles && cycles.length === 0) {
      // This is rarely used, but for completeness
      violations.push(
        this.createViolation(
          'No cyclic dependencies found, but cycles were expected',
          '',
          this.description
        )
      );
    }

    return violations;
  }

  private findCycles(): TSClass[][] {
    const graph = new Map<string, TSClass>();
    const cycles: TSClass[][] = [];

    // Build class graph
    for (const cls of this.classes.getAll()) {
      graph.set(cls.name, cls);
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (className: string, path: TSClass[]): void => {
      visited.add(className);
      recursionStack.add(className);
      const currentClass = graph.get(className);

      if (!currentClass) return;

      path.push(currentClass);

      // Get dependencies that are other classes in our analyzed set
      const classDeps = currentClass
        .getDependencies()
        .map((dep) => {
          // Extract class name from dependency path
          const match = dep.match(/([^/]+)$/);
          return match ? match[1].replace(/\.(ts|js|tsx|jsx)$/, '') : null;
        })
        .filter((name): name is string => name !== null && graph.has(name));

      for (const depName of classDeps) {
        if (!visited.has(depName)) {
          dfs(depName, [...path]);
        } else if (recursionStack.has(depName)) {
          // Found a cycle
          const cycleStart = path.findIndex((c) => c.name === depName);
          if (cycleStart !== -1) {
            const cycle = [...path.slice(cycleStart), currentClass];
            // Avoid duplicate cycles
            const cycleKey = cycle
              .map((c) => c.name)
              .sort()
              .join('->');
            if (
              !cycles.some(
                (existing) =>
                  existing
                    .map((c) => c.name)
                    .sort()
                    .join('->') === cycleKey
              )
            ) {
              cycles.push(cycle);
            }
          }
        }
      }

      recursionStack.delete(className);
    };

    for (const className of graph.keys()) {
      if (!visited.has(className)) {
        dfs(className, []);
      }
    }

    return cycles;
  }
}

/**
 * Rule for checking if classes are interfaces
 */
class InterfaceRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private shouldBeInterface: boolean
  ) {
    super(`Classes should ${shouldBeInterface ? 'be' : 'not be'} interfaces`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const isInterface = cls.isInterface;
      const violates = this.shouldBeInterface ? !isInterface : isInterface;

      if (violates) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' ${this.shouldBeInterface ? 'is not' : 'is'} an interface`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes are abstract
 */
class AbstractRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private shouldBeAbstract: boolean
  ) {
    super(`Classes should ${shouldBeAbstract ? 'be' : 'not be'} abstract`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const isAbstract = cls.isAbstract;
      const violates = this.shouldBeAbstract ? !isAbstract : isAbstract;

      if (violates) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' ${this.shouldBeAbstract ? 'is not' : 'is'} abstract`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes are assignable to a type
 */
class AssignableRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private className: string,
    private shouldBeAssignable: boolean
  ) {
    super(`Classes should ${shouldBeAssignable ? 'be' : 'not be'} assignable to '${className}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      const isAssignable = cls.isAssignableTo(this.className);
      const violates = this.shouldBeAssignable ? !isAssignable : isAssignable;

      if (violates) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' ${this.shouldBeAssignable ? 'is not' : 'is'} assignable to '${this.className}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes have only readonly fields
 */
class ReadonlyFieldsRule extends BaseArchRule {
  constructor(private classes: TSClasses) {
    super('Classes should have only readonly fields');
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (!cls.hasOnlyReadonlyFields() && cls.properties.length > 0) {
        const mutableFields = cls.properties.filter((p) => !p.isReadonly);
        violations.push(
          this.createViolation(
            `Class '${cls.name}' has mutable fields: ${mutableFields.map((f) => f.name).join(', ')}`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes have only private constructors
 */
class PrivateConstructorsRule extends BaseArchRule {
  constructor(private classes: TSClasses) {
    super('Classes should have only private constructors');
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (!cls.hasOnlyPrivateConstructors()) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' does not have only private constructors`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes have only public methods
 */
class PublicMethodsRule extends BaseArchRule {
  constructor(private classes: TSClasses) {
    super('Classes should have only public methods');
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (!cls.hasOnlyPublicMethods() && cls.methods.length > 0) {
        const nonPublicMethods = cls.methods.filter(
          (m) => !m.isPublic || m.isPrivate || m.isProtected
        );
        violations.push(
          this.createViolation(
            `Class '${cls.name}' has non-public methods: ${nonPublicMethods.map((m) => m.name).join(', ')}`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking fully qualified name
 */
class FullyQualifiedNameRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private fqn: string
  ) {
    super(`Classes should have fully qualified name '${fqn}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (cls.getFullyQualifiedName() !== this.fqn) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' has fully qualified name '${cls.getFullyQualifiedName()}' but expected '${this.fqn}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking simple name (exact match)
 */
class SimpleNameRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private name: string
  ) {
    super(`Classes should have simple name '${name}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (cls.name !== this.name) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' does not have simple name '${this.name}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking if classes are assignable from a type
 */
class AssignableFromRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private className: string
  ) {
    super(`Classes should be assignable from '${className}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      // Check if the specified className can be assigned to this class
      // This means checking if className extends or implements cls
      // For now, we check if cls is in the implements or extends chain
      const isAssignableFrom =
        cls.extends === this.className || cls.implements.includes(this.className);

      if (!isAssignableFrom) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' is not assignable from '${this.className}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking that classes do NOT match naming patterns
 */
class NotNamingRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private pattern: RegExp | string,
    private type: 'matching' | 'endingWith' | 'startingWith'
  ) {
    super(`Classes should not have simple name ${type} '${pattern}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      let matches = false;

      switch (this.type) {
        case 'matching':
          matches = cls.hasSimpleNameMatching(this.pattern);
          break;
        case 'endingWith':
          matches = cls.hasSimpleNameEndingWith(this.pattern as string);
          break;
        case 'startingWith':
          matches = cls.hasSimpleNameStartingWith(this.pattern as string);
          break;
      }

      if (matches) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' should not have simple name ${this.type} '${this.pattern}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}

/**
 * Rule for checking that classes do NOT have a specific simple name (exact match)
 */
class NotSimpleNameRule extends BaseArchRule {
  constructor(
    private classes: TSClasses,
    private name: string
  ) {
    super(`Classes should not have simple name '${name}'`);
  }

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    for (const cls of this.classes.getAll()) {
      if (cls.name === this.name) {
        violations.push(
          this.createViolation(
            `Class '${cls.name}' should not have simple name '${this.name}'`,
            cls.filePath,
            this.description
          )
        );
      }
    }

    return violations;
  }
}
