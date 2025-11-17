import { TSClass } from './TSClass';
import { PredicateFunction } from '../types';

/**
 * Collection of TypeScript classes with filtering capabilities
 */
export class TSClasses {
  private classes: TSClass[];

  constructor(classes: TSClass[] = []) {
    this.classes = classes;
  }

  /**
   * Get all classes
   */
  public getAll(): TSClass[] {
    return this.classes;
  }

  /**
   * Filter classes by a predicate
   */
  public that(predicate: PredicateFunction<TSClass>): TSClasses {
    return new TSClasses(this.classes.filter(predicate));
  }

  /**
   * Filter classes that reside in a specific package
   */
  public resideInPackage(packagePattern: string): TSClasses {
    return this.that((cls) => cls.residesInPackage(packagePattern));
  }

  /**
   * Filter classes that have a specific decorator
   */
  public areAnnotatedWith(decoratorName: string): TSClasses {
    return this.that((cls) => cls.isAnnotatedWith(decoratorName));
  }

  /**
   * Filter classes with names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): TSClasses {
    return this.that((cls) => cls.hasSimpleNameMatching(pattern));
  }

  /**
   * Filter classes with names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): TSClasses {
    return this.that((cls) => cls.hasSimpleNameEndingWith(suffix));
  }

  /**
   * Filter classes with names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): TSClasses {
    return this.that((cls) => cls.hasSimpleNameStartingWith(prefix));
  }

  /**
   * Filter classes that implement or extend a specific type
   */
  public areAssignableTo(className: string): TSClasses {
    return this.that((cls) => cls.isAssignableTo(className));
  }

  /**
   * Get count of classes
   */
  public size(): number {
    return this.classes.length;
  }

  /**
   * Check if collection is empty
   */
  public isEmpty(): boolean {
    return this.classes.length === 0;
  }

  /**
   * Add a class to the collection
   */
  public add(tsClass: TSClass): void {
    this.classes.push(tsClass);
  }

  /**
   * Merge with another collection
   */
  public merge(other: TSClasses): TSClasses {
    return new TSClasses([...this.classes, ...other.getAll()]);
  }
}
