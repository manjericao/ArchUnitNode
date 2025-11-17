import { TSClasses } from '../../core/TSClasses';
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
    super(
      `Classes should ${shouldHave ? 'be' : 'not be'} annotated with '@${decoratorName}'`
    );
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
  constructor(private classes: TSClasses, private negated: boolean = false) {}

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

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    // This would need to be implemented with actual dependency analysis
    // For now, returning empty array as placeholder
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

  check(): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    // This would need to be implemented with actual dependency analysis
    // For now, returning empty array as placeholder
    return violations;
  }
}
