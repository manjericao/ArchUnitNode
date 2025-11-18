import { TSClass as ITSClass, TSDecorator, TSMethod, TSProperty, TSImport } from '../types';

/**
 * Represents a TypeScript class in the codebase
 */
export class TSClass {
  public readonly name: string;
  public readonly filePath: string;
  public readonly module: string;
  public readonly extends?: string;
  public readonly implements: string[];
  public readonly decorators: TSDecorator[];
  public readonly methods: TSMethod[];
  public readonly properties: TSProperty[];
  public readonly isAbstract: boolean;
  public readonly isExported: boolean;
  private readonly imports: TSImport[];
  private readonly dependencies: string[];

  constructor(classData: ITSClass) {
    this.name = classData.name;
    this.filePath = classData.filePath;
    this.module = classData.module;
    this.extends = classData.extends;
    this.implements = classData.implements;
    this.decorators = classData.decorators;
    this.methods = classData.methods;
    this.properties = classData.properties;
    this.isAbstract = classData.isAbstract;
    this.isExported = classData.isExported;
    this.imports = classData.imports || [];
    this.dependencies = classData.dependencies || this.extractDependencies();
  }

  /**
   * Extract dependencies from imports, extends, and implements
   */
  private extractDependencies(): string[] {
    const deps: string[] = [];

    // Add imports as dependencies
    for (const imp of this.imports) {
      deps.push(imp.source);
    }

    // Add inheritance dependencies
    if (this.extends) {
      deps.push(this.extends);
    }

    // Add implementation dependencies
    deps.push(...this.implements);

    return Array.from(new Set(deps)); // Remove duplicates
  }

  /**
   * Check if this class resides in a specific package/folder
   */
  public residesInPackage(packagePattern: string): boolean {
    // Convert package pattern to path pattern
    // e.g., "com.example.services" -> "com/example/services"
    const pathPattern = packagePattern.replace(/\./g, '/');

    // Normalize paths for comparison (handle both / and \)
    const normalizedModule = this.module.replace(/\\/g, '/');
    const normalizedFilePath = this.filePath.replace(/\\/g, '/');
    const normalizedPattern = pathPattern.replace(/\\/g, '/');

    // Check if the pattern matches as a complete path segment
    // This prevents "services" from matching "services-impl"
    const moduleSegments = normalizedModule.split('/');
    const filePathSegments = normalizedFilePath.split('/');
    const patternSegments = normalizedPattern.split('/');

    // Check if pattern segments appear consecutively in the path
    const matchesInModule = this.matchesPathSegments(moduleSegments, patternSegments);
    const matchesInFilePath = this.matchesPathSegments(filePathSegments, patternSegments);

    return matchesInModule || matchesInFilePath;
  }

  /**
   * Check if pattern segments match consecutively in path segments
   */
  private matchesPathSegments(pathSegments: string[], patternSegments: string[]): boolean {
    // Handle wildcard patterns
    if (patternSegments.includes('**')) {
      return this.matchesWithDoubleWildcard(pathSegments, patternSegments);
    }

    // For single wildcard or exact matches
    for (let i = 0; i <= pathSegments.length - patternSegments.length; i++) {
      let matches = true;
      for (let j = 0; j < patternSegments.length; j++) {
        const patternSeg = patternSegments[j];
        const pathSeg = pathSegments[i + j];

        if (patternSeg === '*') {
          // * matches any single segment
          continue;
        } else if (patternSeg !== pathSeg) {
          matches = false;
          break;
        }
      }
      if (matches) {
        return true;
      }
    }

    return false;
  }

  /**
   * Match path with double wildcard pattern
   */
  private matchesWithDoubleWildcard(pathSegments: string[], patternSegments: string[]): boolean {
    // ** matches any number of segments
    const doubleStarIndex = patternSegments.indexOf('**');

    if (doubleStarIndex === 0 && patternSegments.length === 1) {
      // Pattern is just "**", matches everything
      return true;
    }

    // Match segments before **
    const beforePattern = patternSegments.slice(0, doubleStarIndex);
    const afterPattern = patternSegments.slice(doubleStarIndex + 1);

    // Check if beginning matches
    if (beforePattern.length > 0) {
      for (let i = 0; i < beforePattern.length; i++) {
        if (
          i >= pathSegments.length ||
          (beforePattern[i] !== '*' && beforePattern[i] !== pathSegments[i])
        ) {
          return false;
        }
      }
    }

    // Check if end matches
    if (afterPattern.length > 0) {
      const startIndex = pathSegments.length - afterPattern.length;
      if (startIndex < beforePattern.length) {
        return false;
      }
      for (let i = 0; i < afterPattern.length; i++) {
        if (afterPattern[i] !== '*' && afterPattern[i] !== pathSegments[startIndex + i]) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if this class has a specific decorator
   */
  public isAnnotatedWith(decoratorName: string): boolean {
    return this.decorators.some((dec) => dec.name === decoratorName);
  }

  /**
   * Check if this class name matches a pattern
   */
  public hasSimpleName(name: string): boolean {
    return this.name === name;
  }

  /**
   * Check if this class name matches a regex pattern
   */
  public hasSimpleNameMatching(pattern: RegExp | string): boolean {
    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    return regex.test(this.name);
  }

  /**
   * Check if this class inherits from a specific class
   */
  public isAssignableTo(className: string): boolean {
    return this.extends === className || this.implements.includes(className);
  }

  /**
   * Check if class name ends with specific suffix
   */
  public hasSimpleNameEndingWith(suffix: string): boolean {
    return this.name.endsWith(suffix);
  }

  /**
   * Check if class name starts with specific prefix
   */
  public hasSimpleNameStartingWith(prefix: string): boolean {
    return this.name.startsWith(prefix);
  }

  /**
   * Get all dependencies (imports) from this class's module
   */
  public getDependencies(): string[] {
    return this.dependencies;
  }

  /**
   * Get all import statements from this class's module
   */
  public getImports(): TSImport[] {
    return this.imports;
  }

  /**
   * Check if this class depends on a specific package/module
   */
  public dependsOn(packagePattern: string): boolean {
    const pathPattern = packagePattern.replace(/\./g, '/');
    return this.dependencies.some((dep) => {
      return dep.includes(pathPattern) || dep.includes(packagePattern);
    });
  }

  /**
   * Check if this class depends on a class in a specific package
   */
  public dependsOnClassInPackage(packagePattern: string): boolean {
    return this.dependsOn(packagePattern);
  }

  /**
   * Check if this class is an interface
   * Note: In TypeScript, we detect interfaces by checking if class has no implementation
   */
  public get isInterface(): boolean {
    // TypeScript interfaces don't have methods with implementations
    // and don't have concrete properties (only declarations)
    // This is a heuristic - true interfaces are stripped at runtime
    return this.methods.length === 0 && this.properties.every((p) => !p.type);
  }

  /**
   * Check if all properties are readonly (immutable class)
   */
  public hasOnlyReadonlyFields(): boolean {
    if (this.properties.length === 0) {
      return false; // No fields to check
    }
    return this.properties.every((prop) => prop.isReadonly);
  }

  /**
   * Check if all methods are public
   */
  public hasOnlyPublicMethods(): boolean {
    if (this.methods.length === 0) {
      return false; // No methods to check
    }
    return this.methods.every(
      (method) => method.isPublic && !method.isPrivate && !method.isProtected
    );
  }

  /**
   * Check if class has any private constructors
   */
  public hasPrivateConstructor(): boolean {
    const constructors = this.methods.filter((m) => m.name === 'constructor');
    return constructors.some((c) => c.isPrivate);
  }

  /**
   * Check if class has ONLY private constructors
   */
  public hasOnlyPrivateConstructors(): boolean {
    const constructors = this.methods.filter((m) => m.name === 'constructor');
    if (constructors.length === 0) {
      return false; // No constructors
    }
    return constructors.every((c) => c.isPrivate);
  }

  /**
   * Check if class has any public constructors
   */
  public hasPublicConstructor(): boolean {
    const constructors = this.methods.filter((m) => m.name === 'constructor');
    return constructors.some((c) => c.isPublic && !c.isPrivate && !c.isProtected);
  }

  /**
   * Check if class has specific field matching predicate
   */
  public hasFieldMatching(predicate: (prop: TSProperty) => boolean): boolean {
    return this.properties.some(predicate);
  }

  /**
   * Check if class has specific method matching predicate
   */
  public hasMethodMatching(predicate: (method: TSMethod) => boolean): boolean {
    return this.methods.some(predicate);
  }

  /**
   * Get fully qualified name (module path + class name)
   */
  public getFullyQualifiedName(): string {
    return `${this.module}.${this.name}`;
  }
}
