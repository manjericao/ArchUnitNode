/**
 * Core types for ArchUnit TypeScript
 */

export interface SourceLocation {
  filePath: string;
  line: number;
  column: number;
}

export interface TSImport {
  source: string;
  specifiers: string[];
  isDefault: boolean;
  isNamespace: boolean;
  location: SourceLocation;
}

export interface TSExport {
  name: string;
  isDefault: boolean;
  location: SourceLocation;
}

export interface TSDecorator {
  name: string;
  arguments: unknown[];
  location: SourceLocation;
}

export interface TSMethod {
  name: string;
  parameters: string[];
  returnType?: string;
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isAsync: boolean;
  decorators: TSDecorator[];
  location: SourceLocation;
}

export interface TSProperty {
  name: string;
  type?: string;
  isPublic: boolean;
  isPrivate: boolean;
  isProtected: boolean;
  isStatic: boolean;
  isReadonly: boolean;
  decorators: TSDecorator[];
  location: SourceLocation;
}

export interface TSClass {
  name: string;
  filePath: string;
  module: string;
  extends?: string;
  implements: string[];
  decorators: TSDecorator[];
  methods: TSMethod[];
  properties: TSProperty[];
  isAbstract: boolean;
  isExported: boolean;
  location: SourceLocation;
  imports?: TSImport[]; // Imports in the module where this class is defined
  dependencies?: string[]; // Resolved dependency class names
}

export interface TSInterface {
  name: string;
  filePath: string;
  module: string;
  extends: string[];
  methods: TSMethod[];
  properties: TSProperty[];
  isExported: boolean;
  location: SourceLocation;
}

export interface TSFunction {
  name: string;
  filePath: string;
  module: string;
  parameters: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
  location: SourceLocation;
}

export interface TSModule {
  name: string;
  filePath: string;
  imports: TSImport[];
  exports: TSExport[];
  classes: TSClass[];
  interfaces: TSInterface[];
  functions: TSFunction[];
}

export interface Dependency {
  from: string;
  to: string;
  type: 'import' | 'inheritance' | 'implementation' | 'usage';
  location: SourceLocation;
}

/**
 * Severity levels for architecture violations
 */
export enum Severity {
  ERROR = 'error',
  WARNING = 'warning',
}

export interface ArchitectureViolation {
  message: string;
  filePath: string;
  location?: SourceLocation;
  rule: string;
  severity: Severity;
}

export type PredicateFunction<T> = (item: T) => boolean;
export type ConditionFunction<T> = (item: T) => boolean;

/**
 * Custom predicate function for filtering classes
 * Provides access to TSClass class instance for custom filtering logic
 * Note: Uses the TSClass class type, not the interface
 */
export type ClassPredicate = (cls: {
  readonly name: string;
  readonly filePath: string;
  readonly module: string;
  readonly extends?: string;
  readonly implements: string[];
  readonly decorators: TSDecorator[];
  readonly methods: TSMethod[];
  readonly properties: TSProperty[];
  readonly isAbstract: boolean;
  readonly isExported: boolean;
}) => boolean;
