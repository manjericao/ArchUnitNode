import { TSClass as ITSClass, TSDecorator, TSMethod, TSProperty } from '../types';

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
    // This will be populated by the analyzer
    return [];
  }
}
