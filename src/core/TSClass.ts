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
    return this.module.includes(pathPattern) || this.filePath.includes(pathPattern);
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
}
