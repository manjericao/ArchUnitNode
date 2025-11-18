/**
 * Test Fixtures and Generators
 *
 * Utilities for generating test data and fixtures
 *
 * @module testing/TestFixtures
 */

import { TSClass } from '../core/TSClass';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation, TSDecorator, TSMethod, TSProperty, Severity } from '../types';

/**
 * Test fixture builder for TSClass
 */
export class TSClassBuilder {
  private name: string = 'TestClass';
  private filePath: string = '/test/TestClass.ts';
  private packagePath: string = 'test';
  private dependencies: string[] = [];
  private decorators: TSDecorator[] = [];
  private isInterface: boolean = false;
  private isAbstract: boolean = false;
  private methods: TSMethod[] = [];
  private properties: TSProperty[] = [];

  /**
   * Set class name
   */
  withName(name: string): this {
    this.name = name;
    return this;
  }

  /**
   * Set file path
   */
  withFilePath(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  /**
   * Set package path
   */
  withPackagePath(packagePath: string): this {
    this.packagePath = packagePath;
    return this;
  }

  /**
   * Add dependencies
   */
  withDependencies(...dependencies: string[]): this {
    this.dependencies.push(...dependencies);
    return this;
  }

  /**
   * Add decorators
   */
  withDecorators(...decorators: string[]): this {
    this.decorators.push(
      ...decorators.map((name) => ({
        name,
        arguments: [],
        location: { filePath: this.filePath, line: 1, column: 1 },
      }))
    );
    return this;
  }

  /**
   * Mark as interface
   */
  asInterface(): this {
    this.isInterface = true;
    return this;
  }

  /**
   * Mark as abstract
   */
  asAbstract(): this {
    this.isAbstract = true;
    return this;
  }

  /**
   * Add methods
   */
  withMethods(...methods: string[]): this {
    this.methods.push(
      ...methods.map((name) => ({
        name,
        parameters: [],
        isPublic: true,
        isPrivate: false,
        isProtected: false,
        isStatic: false,
        isAsync: false,
        decorators: [],
        location: { filePath: this.filePath, line: 1, column: 1 },
      }))
    );
    return this;
  }

  /**
   * Add properties
   */
  withProperties(...properties: string[]): this {
    this.properties.push(
      ...properties.map((name) => ({
        name,
        isPublic: true,
        isPrivate: false,
        isProtected: false,
        isStatic: false,
        isReadonly: false,
        decorators: [],
        location: { filePath: this.filePath, line: 1, column: 1 },
      }))
    );
    return this;
  }

  /**
   * Build the TSClass instance
   */
  build(): TSClass {
    return new TSClass({
      name: this.name,
      filePath: this.filePath,
      module: this.packagePath,
      implements: [],
      decorators: this.decorators,
      isAbstract: this.isAbstract,
      isExported: true,
      methods: this.methods,
      properties: this.properties,
      location: { filePath: this.filePath, line: 1, column: 1 },
      imports: [],
      dependencies: this.dependencies,
    });
  }
}

/**
 * Create a new TSClass builder
 */
export function createClass(): TSClassBuilder {
  return new TSClassBuilder();
}

/**
 * Test fixture builder for TSClasses collection
 */
export class TSClassesBuilder {
  private classes: TSClass[] = [];

  /**
   * Add a class to the collection
   */
  addClass(tsClass: TSClass | TSClassBuilder): this {
    if (tsClass instanceof TSClassBuilder) {
      this.classes.push(tsClass.build());
    } else {
      this.classes.push(tsClass);
    }
    return this;
  }

  /**
   * Add multiple classes
   */
  addClasses(...tsClasses: Array<TSClass | TSClassBuilder>): this {
    for (const tsClass of tsClasses) {
      this.addClass(tsClass);
    }
    return this;
  }

  /**
   * Generate a service class
   */
  addService(name: string, packagePath: string = 'services'): this {
    this.addClass(
      createClass()
        .withName(name)
        .withFilePath(`/${packagePath}/${name}.ts`)
        .withPackagePath(packagePath)
        .withDecorators('Injectable', 'Service')
    );
    return this;
  }

  /**
   * Generate a controller class
   */
  addController(name: string, packagePath: string = 'controllers'): this {
    this.addClass(
      createClass()
        .withName(name)
        .withFilePath(`/${packagePath}/${name}.ts`)
        .withPackagePath(packagePath)
        .withDecorators('Controller', 'Injectable')
    );
    return this;
  }

  /**
   * Generate a repository class
   */
  addRepository(name: string, packagePath: string = 'repositories'): this {
    this.addClass(
      createClass()
        .withName(name)
        .withFilePath(`/${packagePath}/${name}.ts`)
        .withPackagePath(packagePath)
        .withDecorators('Repository')
    );
    return this;
  }

  /**
   * Generate a model class
   */
  addModel(name: string, packagePath: string = 'models'): this {
    this.addClass(
      createClass()
        .withName(name)
        .withFilePath(`/${packagePath}/${name}.ts`)
        .withPackagePath(packagePath)
    );
    return this;
  }

  /**
   * Generate a complete layered architecture
   */
  withLayeredArchitecture(): this {
    // Controllers
    this.addController('UserController', 'presentation/controllers');
    this.addController('ProductController', 'presentation/controllers');

    // Services
    this.addService('UserService', 'application/services');
    this.addService('ProductService', 'application/services');

    // Repositories
    this.addRepository('UserRepository', 'infrastructure/repositories');
    this.addRepository('ProductRepository', 'infrastructure/repositories');

    // Models
    this.addModel('User', 'domain/models');
    this.addModel('Product', 'domain/models');

    // Add dependencies (using any cast for test fixtures to bypass readonly)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[0] as any).dependencies = ['UserService']; // UserController -> UserService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[1] as any).dependencies = ['ProductService']; // ProductController -> ProductService
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[2] as any).dependencies = ['UserRepository']; // UserService -> UserRepository
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[3] as any).dependencies = ['ProductRepository']; // ProductService -> ProductRepository
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[4] as any).dependencies = ['User']; // UserRepository -> User
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this.classes[5] as any).dependencies = ['Product']; // ProductRepository -> Product

    return this;
  }

  /**
   * Build the TSClasses collection
   */
  build(): TSClasses {
    return new TSClasses(this.classes);
  }
}

/**
 * Create a new TSClasses builder
 */
export function createClasses(): TSClassesBuilder {
  return new TSClassesBuilder();
}

/**
 * Violation builder for creating test violations
 */
export class ViolationBuilder {
  private className: string = 'TestClass';
  private message: string = 'Test violation';
  private filePath: string = '/test/TestClass.ts';
  private severity: Severity = Severity.ERROR;
  private lineNumber?: number;
  private codeContext?: string;

  /**
   * Set class name
   */
  forClass(className: string): this {
    this.className = className;
    return this;
  }

  /**
   * Set message
   */
  withMessage(message: string): this {
    this.message = message;
    return this;
  }

  /**
   * Set file path
   */
  inFile(filePath: string): this {
    this.filePath = filePath;
    return this;
  }

  /**
   * Set as warning
   */
  asWarning(): this {
    this.severity = Severity.WARNING;
    return this;
  }

  /**
   * Set as error
   */
  asError(): this {
    this.severity = Severity.ERROR;
    return this;
  }

  /**
   * Set line number
   */
  atLine(lineNumber: number): this {
    this.lineNumber = lineNumber;
    return this;
  }

  /**
   * Set code context
   */
  withContext(context: string): this {
    this.codeContext = context;
    return this;
  }

  /**
   * Build the violation
   */
  build(): ArchitectureViolation {
    return {
      message: `${this.message} (class: ${this.className})${this.codeContext ? ', ' + this.codeContext : ''}`,
      filePath: this.filePath,
      location: this.lineNumber
        ? { filePath: this.filePath, line: this.lineNumber, column: 1 }
        : undefined,
      rule: 'Test Rule',
      severity: this.severity,
    };
  }
}

/**
 * Create a new violation builder
 */
export function createViolation(): ViolationBuilder {
  return new ViolationBuilder();
}

/**
 * Predefined fixtures
 */
export const Fixtures = {
  /**
   * Simple service class
   */
  simpleService(): TSClass {
    return createClass()
      .withName('UserService')
      .withFilePath('/services/UserService.ts')
      .withPackagePath('services')
      .withDecorators('Injectable')
      .withMethods('getUser', 'createUser', 'updateUser', 'deleteUser')
      .build();
  },

  /**
   * Simple controller class
   */
  simpleController(): TSClass {
    return createClass()
      .withName('UserController')
      .withFilePath('/controllers/UserController.ts')
      .withPackagePath('controllers')
      .withDecorators('Controller')
      .withDependencies('UserService')
      .withMethods('getUser', 'createUser', 'updateUser', 'deleteUser')
      .build();
  },

  /**
   * Simple repository class
   */
  simpleRepository(): TSClass {
    return createClass()
      .withName('UserRepository')
      .withFilePath('/repositories/UserRepository.ts')
      .withPackagePath('repositories')
      .withDecorators('Repository')
      .withDependencies('User')
      .withMethods('findById', 'findAll', 'save', 'delete')
      .build();
  },

  /**
   * Simple model class
   */
  simpleModel(): TSClass {
    return createClass()
      .withName('User')
      .withFilePath('/models/User.ts')
      .withPackagePath('models')
      .withProperties('id', 'name', 'email', 'createdAt', 'updatedAt')
      .build();
  },

  /**
   * Layered architecture (Controller -> Service -> Repository -> Model)
   */
  layeredArchitecture(): TSClasses {
    return createClasses().withLayeredArchitecture().build();
  },

  /**
   * Violation for naming convention
   */
  namingViolation(): ArchitectureViolation {
    return createViolation()
      .forClass('UserSvc')
      .withMessage('Class should have simple name ending with "Service"')
      .inFile('/services/UserSvc.ts')
      .asError()
      .build();
  },

  /**
   * Violation for dependency rule
   */
  dependencyViolation(): ArchitectureViolation {
    return createViolation()
      .forClass('UserController')
      .withMessage('Class should not depend on classes in package "repositories"')
      .inFile('/controllers/UserController.ts')
      .asError()
      .build();
  },

  /**
   * Warning violation
   */
  warningViolation(): ArchitectureViolation {
    return createViolation()
      .forClass('UserService')
      .withMessage('Class has too many dependencies (15)')
      .inFile('/services/UserService.ts')
      .asWarning()
      .build();
  },
};

/**
 * Random data generators
 */
export class Generator {
  /**
   * Generate random class name
   */
  static className(prefix?: string): string {
    const suffixes = ['Service', 'Controller', 'Repository', 'Model', 'Handler', 'Processor'];
    const baseName = prefix || `Test${Math.floor(Math.random() * 1000)}`;
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    return `${baseName}${suffix}`;
  }

  /**
   * Generate random package path
   */
  static packagePath(): string {
    const packages = [
      'services',
      'controllers',
      'repositories',
      'models',
      'handlers',
      'utils',
      'dto',
      'validators',
    ];
    return packages[Math.floor(Math.random() * packages.length)];
  }

  /**
   * Generate random violation message
   */
  static violationMessage(): string {
    const messages = [
      'Class should have simple name ending with "Service"',
      'Class should not depend on classes in package "repositories"',
      'Class should be annotated with "@Injectable"',
      'Class has too many dependencies',
      'Circular dependency detected',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  /**
   * Generate random TSClass
   */
  static randomClass(): TSClass {
    return createClass().withName(this.className()).withPackagePath(this.packagePath()).build();
  }

  /**
   * Generate multiple random classes
   */
  static randomClasses(count: number): TSClasses {
    const builder = createClasses();
    for (let i = 0; i < count; i++) {
      builder.addClass(this.randomClass());
    }
    return builder.build();
  }

  /**
   * Generate random violation
   */
  static randomViolation(): ArchitectureViolation {
    return createViolation()
      .forClass(this.className())
      .withMessage(this.violationMessage())
      .build();
  }

  /**
   * Generate multiple random violations
   */
  static randomViolations(count: number): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    for (let i = 0; i < count; i++) {
      violations.push(this.randomViolation());
    }
    return violations;
  }
}
