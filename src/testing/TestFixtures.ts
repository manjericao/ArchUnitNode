/**
 * Test Fixtures and Generators
 *
 * Utilities for generating test data and fixtures
 *
 * @module testing/TestFixtures
 */

import { TSClass } from '../core/TSClass';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation } from '../core/ArchRule';

/**
 * Test fixture builder for TSClass
 */
export class TSClassBuilder {
  private name: string = 'TestClass';
  private filePath: string = '/test/TestClass.ts';
  private packagePath: string = 'test';
  private dependencies: string[] = [];
  private decorators: string[] = [];
  private isInterface: boolean = false;
  private isAbstract: boolean = false;
  private methods: string[] = [];
  private properties: string[] = [];

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
    this.decorators.push(...decorators);
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
    this.methods.push(...methods);
    return this;
  }

  /**
   * Add properties
   */
  withProperties(...properties: string[]): this {
    this.properties.push(...properties);
    return this;
  }

  /**
   * Build the TSClass instance
   */
  build(): TSClass {
    return {
      name: this.name,
      filePath: this.filePath,
      packagePath: this.packagePath,
      dependencies: this.dependencies,
      decorators: this.decorators,
      isInterface: this.isInterface,
      isAbstract: this.isAbstract,
      methods: this.methods,
      properties: this.properties,
      imports: [],
      exports: [],
      sourceCode: `// Generated test fixture for ${this.name}`,
    };
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

    // Add dependencies
    this.classes[0].dependencies = ['UserService']; // UserController -> UserService
    this.classes[1].dependencies = ['ProductService']; // ProductController -> ProductService
    this.classes[2].dependencies = ['UserRepository']; // UserService -> UserRepository
    this.classes[3].dependencies = ['ProductRepository']; // ProductService -> ProductRepository
    this.classes[4].dependencies = ['User']; // UserRepository -> User
    this.classes[5].dependencies = ['Product']; // ProductRepository -> Product

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
  private severity: 'error' | 'warning' = 'error';
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
    this.severity = 'warning';
    return this;
  }

  /**
   * Set as error
   */
  asError(): this {
    this.severity = 'error';
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
      className: this.className,
      message: this.message,
      filePath: this.filePath,
      severity: this.severity,
      lineNumber: this.lineNumber,
      codeContext: this.codeContext,
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
    return createClass()
      .withName(this.className())
      .withPackagePath(this.packagePath())
      .build();
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
