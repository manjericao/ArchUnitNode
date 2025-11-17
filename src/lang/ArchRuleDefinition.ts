import { TSClasses } from '../core/TSClasses';
import { ClassesThat } from './syntax/ClassesThat';
import { ClassesShould } from './syntax/ClassesShould';

/**
 * Entry point for defining architecture rules using fluent API
 */
export class ArchRuleDefinition {
  /**
   * Start defining a rule about classes
   */
  public static classes(): ClassesSelector {
    return new ClassesSelector();
  }

  /**
   * Start defining a rule with no classes selected
   */
  public static noClasses(): NoClassesSelector {
    return new NoClassesSelector();
  }

  /**
   * Start defining a rule about all classes
   */
  public static allClasses(): ClassesShould {
    return new ClassesShould(new TSClasses());
  }
}

/**
 * Selector for "classes()" syntax
 */
export class ClassesSelector {
  /**
   * Filter classes with "that" conditions
   */
  public that(): ClassesThatStatic {
    return new ClassesThatStatic();
  }

  /**
   * Apply "should" conditions to all classes
   */
  public should(): ClassesShould {
    return new ClassesShould(new TSClasses());
  }
}

/**
 * Selector for "noClasses()" syntax
 */
export class NoClassesSelector {
  /**
   * Filter classes with "that" conditions
   */
  public that(): ClassesThatStatic {
    return new ClassesThatStatic(true);
  }
}

/**
 * Static version of ClassesThat that works before analysis
 */
export class ClassesThatStatic {
  private filters: Array<(classes: TSClasses) => TSClasses> = [];
  private negated: boolean;

  constructor(negated: boolean = false) {
    this.negated = negated;
  }

  /**
   * Filter classes that reside in a specific package
   */
  public resideInPackage(packagePattern: string): ClassesShouldStatic {
    this.filters.push((classes) => classes.resideInPackage(packagePattern));
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes that reside in any of the specified packages
   */
  public resideInAnyPackage(...packagePatterns: string[]): ClassesShouldStatic {
    this.filters.push((classes) => {
      let result = new TSClasses();
      for (const pattern of packagePatterns) {
        result = result.merge(classes.resideInPackage(pattern));
      }
      return result;
    });
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes with a specific decorator/annotation
   */
  public areAnnotatedWith(decoratorName: string): ClassesShouldStatic {
    this.filters.push((classes) => classes.areAnnotatedWith(decoratorName));
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes with names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): ClassesShouldStatic {
    this.filters.push((classes) => classes.haveSimpleNameMatching(pattern));
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes with names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): ClassesShouldStatic {
    this.filters.push((classes) => classes.haveSimpleNameEndingWith(suffix));
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes with names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): ClassesShouldStatic {
    this.filters.push((classes) => classes.haveSimpleNameStartingWith(prefix));
    return new ClassesShouldStatic(this.filters, this.negated);
  }

  /**
   * Filter classes that implement or extend a specific type
   */
  public areAssignableTo(className: string): ClassesShouldStatic {
    this.filters.push((classes) => classes.areAssignableTo(className));
    return new ClassesShouldStatic(this.filters, this.negated);
  }
}

/**
 * Static version of ClassesShould that works before analysis
 */
export class ClassesShouldStatic {
  constructor(
    private filters: Array<(classes: TSClasses) => TSClasses>,
    private negated: boolean = false
  ) {}

  /**
   * Apply filters to classes
   */
  private applyFilters(classes: TSClasses): TSClasses {
    let result = classes;
    for (const filter of this.filters) {
      result = filter(result);
    }
    return result;
  }

  /**
   * Return self for fluent API continuation
   */
  public should(): ClassesShouldStatic {
    return this;
  }

  /**
   * Classes should reside in a specific package
   */
  public resideInPackage(packagePattern: string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered).resideInPackage(packagePattern);
      },
      `Classes should ${this.negated ? 'not ' : ''}reside in package '${packagePattern}'`
    );
  }

  /**
   * Classes should be annotated with a decorator
   */
  public beAnnotatedWith(decoratorName: string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered).beAnnotatedWith(decoratorName);
      },
      `Classes should be annotated with '@${decoratorName}'`
    );
  }

  /**
   * Classes should NOT be annotated with a decorator
   */
  public notBeAnnotatedWith(decoratorName: string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered).notBeAnnotatedWith(decoratorName);
      },
      `Classes should not be annotated with '@${decoratorName}'`
    );
  }

  /**
   * Classes should have names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered).haveSimpleNameMatching(pattern);
      },
      `Classes should have simple name matching '${pattern}'`
    );
  }

  /**
   * Classes should have names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered).haveSimpleNameEndingWith(suffix);
      },
      `Classes should have simple name ending with '${suffix}'`
    );
  }

  /**
   * Classes should only depend on classes in specific packages
   */
  public onlyDependOnClassesThat(): StaticClassesDependencyShould {
    return new StaticClassesDependencyShould(this.filters, false);
  }

  /**
   * Classes should not depend on classes in specific packages
   */
  public notDependOnClassesThat(): StaticClassesDependencyShould {
    return new StaticClassesDependencyShould(this.filters, true);
  }
}

/**
 * Static dependency condition builder
 */
export class StaticClassesDependencyShould {
  constructor(
    private filters: Array<(classes: TSClasses) => TSClasses>,
    private negated: boolean
  ) {}

  private applyFilters(classes: TSClasses): TSClasses {
    let result = classes;
    for (const filter of this.filters) {
      result = filter(result);
    }
    return result;
  }

  public resideInPackage(packagePattern: string): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered)
          .onlyDependOnClassesThat()
          .resideInPackage(packagePattern);
      },
      `Classes should ${this.negated ? 'not depend on' : 'only depend on'} classes in package '${packagePattern}'`
    );
  }

  public resideInAnyPackage(...packagePatterns: string[]): StaticArchRule {
    return new StaticArchRule(
      (classes) => {
        const filtered = this.applyFilters(classes);
        return new ClassesShould(filtered)
          .onlyDependOnClassesThat()
          .resideInAnyPackage(...packagePatterns);
      },
      `Classes should ${this.negated ? 'not depend on' : 'only depend on'} classes in packages [${packagePatterns.join(', ')}]`
    );
  }
}

/**
 * Static architecture rule that can be evaluated later
 */
export class StaticArchRule {
  constructor(
    private ruleFactory: (classes: TSClasses) => import('../core/ArchRule').ArchRule,
    private description: string
  ) {}

  /**
   * Evaluate this rule against a set of classes
   */
  public check(classes: TSClasses): import('../types').ArchitectureViolation[] {
    const rule = this.ruleFactory(classes);
    return rule.check(classes);
  }

  /**
   * Get rule description
   */
  public getDescription(): string {
    return this.description;
  }
}
