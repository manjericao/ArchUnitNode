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

  constructor(classes: TSClasses, predicates: PredicateFunction[] = [], operator: 'AND' | 'OR' = 'AND') {
    this.tsClasses = classes;
    this.predicates = predicates;
    this.operator = operator;
  }

  /**
   * Combine conditions with OR operator
   */
  public or(): ClassesThat {
    return new ClassesThat(this.tsClasses, this.predicates, 'OR');
  }

  /**
   * Combine conditions with AND operator (default)
   */
  public and(): ClassesThat {
    return new ClassesThat(this.tsClasses, this.predicates, 'AND');
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
        return this.predicates.some(predicate => predicate(cls));
      });
    } else {
      // AND: class matches if ALL predicates are true
      return this.tsClasses.that((cls) => {
        return this.predicates.every(predicate => predicate(cls));
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
   * Filter classes that reside in a specific package
   */
  public resideInPackage(packagePattern: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.residesInPackage(packagePattern)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that reside outside a specific package
   */
  public resideOutsideOfPackage(packagePattern: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => !cls.residesInPackage(packagePattern)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with a specific decorator/annotation
   */
  public areAnnotatedWith(decoratorName: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.isAnnotatedWith(decoratorName)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that are NOT annotated with a decorator
   */
  public areNotAnnotatedWith(decoratorName: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => !cls.isAnnotatedWith(decoratorName)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.hasSimpleNameMatching(pattern)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.hasSimpleNameEndingWith(suffix)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes with names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.hasSimpleNameStartingWith(prefix)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that implement or extend a specific type
   */
  public areAssignableTo(className: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.isAssignableTo(className)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that implement a specific interface
   */
  public implement(interfaceName: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.implements.includes(interfaceName)];
    return new ClassesThatShould(this.tsClasses, newPredicates, this.operator);
  }

  /**
   * Filter classes that extend a specific class
   */
  public extend(className: string): ClassesThatShould {
    const newPredicates = [...this.predicates, (cls: TSClass) => cls.extends === className];
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
