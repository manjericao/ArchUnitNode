import { TSClasses } from '../../core/TSClasses';
import { TSClass } from '../../core/TSClass';
import { ClassesShould } from './ClassesShould';

type PredicateFunction = (cls: TSClass) => boolean;

/**
 * Fluent API for filtering classes with "that" conditions
 */
export class ClassesThat {
  protected tsClasses: TSClasses;
  protected predicates: PredicateFunction[];
  protected operator: 'AND' | 'OR';
  protected negateNext: boolean;

  constructor(
    classes: TSClasses,
    predicates: PredicateFunction[] = [],
    operator: 'AND' | 'OR' = 'AND',
    negateNext: boolean = false
  ) {
    this.tsClasses = classes;
    this.predicates = predicates;
    this.operator = operator;
    this.negateNext = negateNext;
  }

  /**
   * Negate the next condition
   * Example: classes().that().not().resideInPackage('test')
   */
  public not(): ClassesThat {
    return new ClassesThat(this.tsClasses, this.predicates, this.operator, true);
  }

  /**
   * Combine conditions with OR operator
   */
  public or(): ClassesThat {
    return new ClassesThat(this.tsClasses, this.predicates, 'OR', false);
  }

  /**
   * Combine conditions with AND operator (default)
   */
  public and(): ClassesThat {
    return new ClassesThat(this.tsClasses, this.predicates, 'AND', false);
  }

  /**
   * Apply predicates and return filtered classes
   */
  protected applyPredicates(): TSClasses {
    if (this.predicates.length === 0) {
      return this.tsClasses;
    }

    if (this.operator === 'OR') {
      // OR: class matches if ANY predicate is true
      return this.tsClasses.that((cls) => {
        return this.predicates.some((predicate) => predicate(cls));
      });
    } else {
      // AND: class matches if ALL predicates are true
      return this.tsClasses.that((cls) => {
        return this.predicates.every((predicate) => predicate(cls));
      });
    }
  }

  /**
   * Create should() method that applies predicates
   */
  protected should(): ClassesShould {
    const filtered = this.applyPredicates();
    return new ClassesShould(filtered);
  }

  /**
   * Helper to apply negation if needed
   */
  private applyNegation(predicate: PredicateFunction): PredicateFunction {
    return this.negateNext ? (cls: TSClass): boolean => !predicate(cls) : predicate;
  }

  /**
   * Filter classes that reside in a specific package
   */
  public resideInPackage(packagePattern: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.residesInPackage(packagePattern));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that reside outside a specific package
   */
  public resideOutsideOfPackage(packagePattern: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => !cls.residesInPackage(packagePattern));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with a specific decorator/annotation
   */
  public areAnnotatedWith(decoratorName: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.isAnnotatedWith(decoratorName));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that are NOT annotated with a decorator
   */
  public areNotAnnotatedWith(decoratorName: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => !cls.isAnnotatedWith(decoratorName));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.hasSimpleNameMatching(pattern));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.hasSimpleNameEndingWith(suffix));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.hasSimpleNameStartingWith(prefix));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that implement or extend a specific type
   */
  public areAssignableTo(className: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.isAssignableTo(className));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that implement a specific interface
   */
  public implement(interfaceName: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.implements.includes(interfaceName));
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that extend a specific class
   */
  public extend(className: string): ClassesThatShould {
    const predicate = this.applyNegation((cls: TSClass) => cls.extends === className);
    const newPredicates = [...this.predicates, predicate];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }
}

/**
 * Intermediate class that supports both .should() and .or()/.and()
 */
export class ClassesThatShould extends ClassesThat {
  /**
   * Transition to ClassesShould for defining assertions
   */
  public should(): ClassesShould {
    return super.should();
  }
}
