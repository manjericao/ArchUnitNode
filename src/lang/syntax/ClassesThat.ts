import { TSClasses } from '../../core/TSClasses';
import { ClassesShould } from './ClassesShould';

/**
 * Fluent API for filtering classes with "that" conditions
 */
export class ClassesThat {
  private tsClasses: TSClasses;

  constructor(classes: TSClasses) {
    this.tsClasses = classes;
  }

  /**
   * Filter classes that reside in a specific package
   */
  public resideInPackage(packagePattern: string): ClassesShould {
    const filtered = this.tsClasses.resideInPackage(packagePattern);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes that reside outside a specific package
   */
  public resideOutsideOfPackage(packagePattern: string): ClassesShould {
    const filtered = this.tsClasses.that((cls) => !cls.residesInPackage(packagePattern));
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes with a specific decorator/annotation
   */
  public areAnnotatedWith(decoratorName: string): ClassesShould {
    const filtered = this.tsClasses.areAnnotatedWith(decoratorName);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes that are NOT annotated with a decorator
   */
  public areNotAnnotatedWith(decoratorName: string): ClassesShould {
    const filtered = this.tsClasses.that((cls) => !cls.isAnnotatedWith(decoratorName));
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes with names matching a pattern
   */
  public haveSimpleNameMatching(pattern: RegExp | string): ClassesShould {
    const filtered = this.tsClasses.haveSimpleNameMatching(pattern);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes with names ending with a suffix
   */
  public haveSimpleNameEndingWith(suffix: string): ClassesShould {
    const filtered = this.tsClasses.haveSimpleNameEndingWith(suffix);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes with names starting with a prefix
   */
  public haveSimpleNameStartingWith(prefix: string): ClassesShould {
    const filtered = this.tsClasses.haveSimpleNameStartingWith(prefix);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes that implement or extend a specific type
   */
  public areAssignableTo(className: string): ClassesShould {
    const filtered = this.tsClasses.areAssignableTo(className);
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes that implement a specific interface
   */
  public implement(interfaceName: string): ClassesShould {
    const filtered = this.tsClasses.that((cls) => cls.implements.includes(interfaceName));
    return new ClassesShould(filtered);
  }

  /**
   * Filter classes that extend a specific class
   */
  public extend(className: string): ClassesShould {
    const filtered = this.tsClasses.that((cls) => cls.extends === className);
    return new ClassesShould(filtered);
  }
}
