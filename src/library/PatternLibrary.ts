import { BaseArchRule } from '../core/ArchRule';
import { TSClasses } from '../core/TSClasses';
import { ArchitectureViolation } from '../types';
import { LayeredArchitecture, layeredArchitecture } from './LayeredArchitecture';

/**
 * MVC (Model-View-Controller) Architecture Pattern
 *
 * Enforces separation between:
 * - Models: Data and business logic
 * - Views: Presentation layer
 * - Controllers: Request handling and flow control
 */
export class MVCArchitecture extends BaseArchRule {
  private modelsPackages?: string[];
  private viewsPackages?: string[];
  private controllersPackages?: string[];

  constructor() {
    super('MVC Architecture');
  }

  /**
   * Define models layer
   */
  public models(...packages: string[]): this {
    this.modelsPackages = packages;
    return this;
  }

  /**
   * Define views layer
   */
  public views(...packages: string[]): this {
    this.viewsPackages = packages;
    return this;
  }

  /**
   * Define controllers layer
   */
  public controllers(...packages: string[]): this {
    this.controllersPackages = packages;
    return this;
  }

  /**
   * Check MVC architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    return this.toLayeredArchitecture().check(classes);
  }

  /**
   * Convert to layered architecture for rule checking
   */
  private toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.modelsPackages) {
      arch.layer('Models').definedBy(...this.modelsPackages);
    }

    if (this.viewsPackages) {
      arch.layer('Views').definedBy(...this.viewsPackages);
    }

    if (this.controllersPackages) {
      arch.layer('Controllers').definedBy(...this.controllersPackages);
    }

    // MVC Rules:
    // 1. Models should not depend on views or controllers
    if (this.modelsPackages) {
      const forbidden: string[] = [];
      if (this.viewsPackages) forbidden.push('Views');
      if (this.controllersPackages) forbidden.push('Controllers');
      if (forbidden.length > 0) {
        arch.whereLayer('Models').mayNotAccessLayers(...forbidden);
      }
    }

    // 2. Views should not depend on controllers
    if (this.viewsPackages && this.controllersPackages) {
      arch.whereLayer('Views').mayNotAccessLayers('Controllers');
    }

    // 3. Views may access models (for read-only data)
    // (This is implicit - we don't forbid it)

    // 4. Controllers may access models and views
    if (this.controllersPackages) {
      const allowed: string[] = [];
      if (this.modelsPackages) allowed.push('Models');
      if (this.viewsPackages) allowed.push('Views');
      if (allowed.length > 0) {
        arch.whereLayer('Controllers').mayOnlyAccessLayers(...allowed);
      }
    }

    return arch;
  }
}

/**
 * MVVM (Model-View-ViewModel) Architecture Pattern
 *
 * Enforces separation between:
 * - Models: Data and business logic
 * - Views: UI layer
 * - ViewModels: Presentation logic and view state
 */
export class MVVMArchitecture extends BaseArchRule {
  private modelsPackages?: string[];
  private viewsPackages?: string[];
  private viewModelsPackages?: string[];

  constructor() {
    super('MVVM Architecture');
  }

  /**
   * Define models layer
   */
  public models(...packages: string[]): this {
    this.modelsPackages = packages;
    return this;
  }

  /**
   * Define views layer
   */
  public views(...packages: string[]): this {
    this.viewsPackages = packages;
    return this;
  }

  /**
   * Define view models layer
   */
  public viewModels(...packages: string[]): this {
    this.viewModelsPackages = packages;
    return this;
  }

  /**
   * Check MVVM architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    return this.toLayeredArchitecture().check(classes);
  }

  /**
   * Convert to layered architecture for rule checking
   */
  private toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.modelsPackages) {
      arch.layer('Models').definedBy(...this.modelsPackages);
    }

    if (this.viewModelsPackages) {
      arch.layer('ViewModels').definedBy(...this.viewModelsPackages);
    }

    if (this.viewsPackages) {
      arch.layer('Views').definedBy(...this.viewsPackages);
    }

    // MVVM Rules:
    // 1. Models should not depend on ViewModels or Views
    if (this.modelsPackages) {
      const forbidden: string[] = [];
      if (this.viewModelsPackages) forbidden.push('ViewModels');
      if (this.viewsPackages) forbidden.push('Views');
      if (forbidden.length > 0) {
        arch.whereLayer('Models').mayNotAccessLayers(...forbidden);
      }
    }

    // 2. ViewModels may depend on Models but not Views
    if (this.viewModelsPackages) {
      if (this.modelsPackages) {
        arch.whereLayer('ViewModels').mayOnlyAccessLayers('Models');
      }
      if (this.viewsPackages) {
        arch.whereLayer('ViewModels').mayNotAccessLayers('Views');
      }
    }

    // 3. Views may only depend on ViewModels
    if (this.viewsPackages && this.viewModelsPackages) {
      arch.whereLayer('Views').mayOnlyAccessLayers('ViewModels');
    }

    return arch;
  }
}

/**
 * CQRS (Command Query Responsibility Segregation) Architecture Pattern
 *
 * Separates read and write operations:
 * - Commands: Write operations that modify state
 * - Queries: Read operations that return data
 * - Handlers: Execute commands and queries
 * - Domain: Business logic
 */
export class CQRSArchitecture extends BaseArchRule {
  private commandsPackages?: string[];
  private queriesPackages?: string[];
  private handlersPackages?: string[];
  private domainPackages?: string[];
  private readModelPackages?: string[];
  private writeModelPackages?: string[];

  constructor() {
    super('CQRS Architecture');
  }

  /**
   * Define commands layer (write operations)
   */
  public commands(...packages: string[]): this {
    this.commandsPackages = packages;
    return this;
  }

  /**
   * Define queries layer (read operations)
   */
  public queries(...packages: string[]): this {
    this.queriesPackages = packages;
    return this;
  }

  /**
   * Define handlers layer (command and query handlers)
   */
  public handlers(...packages: string[]): this {
    this.handlersPackages = packages;
    return this;
  }

  /**
   * Define domain layer (business logic)
   */
  public domain(...packages: string[]): this {
    this.domainPackages = packages;
    return this;
  }

  /**
   * Define read model layer (query-optimized data structures)
   */
  public readModel(...packages: string[]): this {
    this.readModelPackages = packages;
    return this;
  }

  /**
   * Define write model layer (command-optimized domain model)
   */
  public writeModel(...packages: string[]): this {
    this.writeModelPackages = packages;
    return this;
  }

  /**
   * Check CQRS architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const violations = this.toLayeredArchitecture().check(classes);

    // Additional CQRS-specific validations
    violations.push(...this.checkCommandQuerySeparation(classes));
    violations.push(...this.checkModelSeparation(classes));

    return violations;
  }

  /**
   * Ensure commands and queries are strictly separated
   */
  private checkCommandQuerySeparation(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!this.commandsPackages || !this.queriesPackages) {
      return violations;
    }

    // Check that command classes don't return data
    for (const cls of classes.getAll()) {
      if (this.isInPackages(cls.filePath, this.commandsPackages)) {
        // Check for methods with return types other than void or Promise<void>
        for (const method of cls.methods) {
          if (
            method.returnType &&
            method.returnType !== 'void' &&
            method.returnType !== 'Promise<void>'
          ) {
            violations.push(
              this.createViolation(
                `Command class '${cls.name}' should not return data. Method '${method.name}' returns '${method.returnType}'.`,
                cls.filePath,
                'CQRS: Commands should not return data'
              )
            );
          }
        }
      }
    }

    return violations;
  }

  /**
   * Ensure read and write models are separated
   */
  private checkModelSeparation(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!this.readModelPackages || !this.writeModelPackages) {
      return violations;
    }

    // Check that read models don't have setters
    for (const cls of classes.getAll()) {
      if (this.isInPackages(cls.filePath, this.readModelPackages)) {
        for (const method of cls.methods) {
          if (method.name.startsWith('set') && method.name.length > 3) {
            violations.push(
              this.createViolation(
                `Read model '${cls.name}' should be immutable. Found setter method '${method.name}'.`,
                cls.filePath,
                'CQRS: Read models should be immutable'
              )
            );
          }
        }
      }
    }

    return violations;
  }

  /**
   * Helper to check if a file path is in any of the given packages
   */
  private isInPackages(filePath: string, packages: string[]): boolean {
    return packages.some((pkg) => filePath.includes(pkg));
  }

  /**
   * Convert to layered architecture for rule checking
   */
  private toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.domainPackages) {
      arch.layer('Domain').definedBy(...this.domainPackages);
    }

    if (this.commandsPackages) {
      arch.layer('Commands').definedBy(...this.commandsPackages);
    }

    if (this.queriesPackages) {
      arch.layer('Queries').definedBy(...this.queriesPackages);
    }

    if (this.handlersPackages) {
      arch.layer('Handlers').definedBy(...this.handlersPackages);
    }

    if (this.readModelPackages) {
      arch.layer('ReadModel').definedBy(...this.readModelPackages);
    }

    if (this.writeModelPackages) {
      arch.layer('WriteModel').definedBy(...this.writeModelPackages);
    }

    // CQRS Rules:
    // 1. Domain should not depend on commands, queries, or handlers
    if (this.domainPackages) {
      const forbidden: string[] = [];
      if (this.commandsPackages) forbidden.push('Commands');
      if (this.queriesPackages) forbidden.push('Queries');
      if (this.handlersPackages) forbidden.push('Handlers');
      if (forbidden.length > 0) {
        arch.whereLayer('Domain').mayNotAccessLayers(...forbidden);
      }
    }

    // 2. Commands and Queries should not depend on each other
    if (this.commandsPackages && this.queriesPackages) {
      arch.whereLayer('Commands').mayNotAccessLayers('Queries');
      arch.whereLayer('Queries').mayNotAccessLayers('Commands');
    }

    // 3. Read and Write models should not depend on each other
    if (this.readModelPackages && this.writeModelPackages) {
      arch.whereLayer('ReadModel').mayNotAccessLayers('WriteModel');
      arch.whereLayer('WriteModel').mayNotAccessLayers('ReadModel');
    }

    // 4. Handlers may access commands, queries, and domain
    if (this.handlersPackages) {
      const allowed: string[] = [];
      if (this.commandsPackages) allowed.push('Commands');
      if (this.queriesPackages) allowed.push('Queries');
      if (this.domainPackages) allowed.push('Domain');
      if (this.readModelPackages) allowed.push('ReadModel');
      if (this.writeModelPackages) allowed.push('WriteModel');
      if (allowed.length > 0) {
        arch.whereLayer('Handlers').mayOnlyAccessLayers(...allowed);
      }
    }

    return arch;
  }
}

/**
 * Event-Driven Architecture Pattern
 *
 * Enforces event-driven communication:
 * - Events: Immutable facts that happened
 * - Publishers: Emit events
 * - Subscribers/Handlers: React to events
 * - Domain: Business logic
 */
export class EventDrivenArchitecture extends BaseArchRule {
  private eventsPackages?: string[];
  private publishersPackages?: string[];
  private subscribersPackages?: string[];
  private domainPackages?: string[];
  private eventBusPackages?: string[];

  constructor() {
    super('Event-Driven Architecture');
  }

  /**
   * Define events layer
   */
  public events(...packages: string[]): this {
    this.eventsPackages = packages;
    return this;
  }

  /**
   * Define publishers layer
   */
  public publishers(...packages: string[]): this {
    this.publishersPackages = packages;
    return this;
  }

  /**
   * Define subscribers/handlers layer
   */
  public subscribers(...packages: string[]): this {
    this.subscribersPackages = packages;
    return this;
  }

  /**
   * Define domain layer
   */
  public domain(...packages: string[]): this {
    this.domainPackages = packages;
    return this;
  }

  /**
   * Define event bus/infrastructure layer
   */
  public eventBus(...packages: string[]): this {
    this.eventBusPackages = packages;
    return this;
  }

  /**
   * Check event-driven architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const violations = this.toLayeredArchitecture().check(classes);

    // Additional event-driven-specific validations
    violations.push(...this.checkEventImmutability(classes));
    violations.push(...this.checkPublisherSubscriberIndependence(classes));

    return violations;
  }

  /**
   * Ensure events are immutable (no setters)
   */
  private checkEventImmutability(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!this.eventsPackages) {
      return violations;
    }

    for (const cls of classes.getAll()) {
      if (this.isInPackages(cls.filePath, this.eventsPackages)) {
        // Check for setter methods
        for (const method of cls.methods) {
          if (method.name.startsWith('set') && method.name.length > 3) {
            violations.push(
              this.createViolation(
                `Event '${cls.name}' should be immutable. Found setter method '${method.name}'.`,
                cls.filePath,
                'Event-Driven: Events must be immutable'
              )
            );
          }
        }

        // Check for public non-readonly properties
        for (const prop of cls.properties) {
          if (!prop.isReadonly) {
            violations.push(
              this.createViolation(
                `Event '${cls.name}' should have readonly properties. Property '${prop.name}' is not readonly.`,
                cls.filePath,
                'Event-Driven: Event properties must be readonly'
              )
            );
          }
        }
      }
    }

    return violations;
  }

  /**
   * Ensure publishers and subscribers don't directly depend on each other
   */
  private checkPublisherSubscriberIndependence(_classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // This is enforced by the layered architecture rules
    // Publishers and Subscribers should only communicate through Events

    return violations;
  }

  /**
   * Helper to check if a file path is in any of the given packages
   */
  private isInPackages(filePath: string, packages: string[]): boolean {
    return packages.some((pkg) => filePath.includes(pkg));
  }

  /**
   * Convert to layered architecture for rule checking
   */
  private toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.eventsPackages) {
      arch.layer('Events').definedBy(...this.eventsPackages);
    }

    if (this.publishersPackages) {
      arch.layer('Publishers').definedBy(...this.publishersPackages);
    }

    if (this.subscribersPackages) {
      arch.layer('Subscribers').definedBy(...this.subscribersPackages);
    }

    if (this.domainPackages) {
      arch.layer('Domain').definedBy(...this.domainPackages);
    }

    if (this.eventBusPackages) {
      arch.layer('EventBus').definedBy(...this.eventBusPackages);
    }

    // Event-Driven Rules:
    // 1. Events should not depend on anything
    if (this.eventsPackages) {
      const forbidden: string[] = [];
      if (this.publishersPackages) forbidden.push('Publishers');
      if (this.subscribersPackages) forbidden.push('Subscribers');
      if (this.eventBusPackages) forbidden.push('EventBus');
      if (forbidden.length > 0) {
        arch.whereLayer('Events').mayNotAccessLayers(...forbidden);
      }
    }

    // 2. Publishers and Subscribers should not depend on each other
    if (this.publishersPackages && this.subscribersPackages) {
      arch.whereLayer('Publishers').mayNotAccessLayers('Subscribers');
      arch.whereLayer('Subscribers').mayNotAccessLayers('Publishers');
    }

    // 3. Publishers may only access Events and EventBus
    if (this.publishersPackages) {
      const allowed: string[] = [];
      if (this.eventsPackages) allowed.push('Events');
      if (this.eventBusPackages) allowed.push('EventBus');
      if (this.domainPackages) allowed.push('Domain');
      if (allowed.length > 0) {
        arch.whereLayer('Publishers').mayOnlyAccessLayers(...allowed);
      }
    }

    // 4. Subscribers may only access Events and Domain
    if (this.subscribersPackages) {
      const allowed: string[] = [];
      if (this.eventsPackages) allowed.push('Events');
      if (this.domainPackages) allowed.push('Domain');
      if (allowed.length > 0) {
        arch.whereLayer('Subscribers').mayOnlyAccessLayers(...allowed);
      }
    }

    // 5. EventBus should not depend on Publishers or Subscribers
    if (this.eventBusPackages) {
      const forbidden: string[] = [];
      if (this.publishersPackages) forbidden.push('Publishers');
      if (this.subscribersPackages) forbidden.push('Subscribers');
      if (forbidden.length > 0) {
        arch.whereLayer('EventBus').mayNotAccessLayers(...forbidden);
      }
    }

    return arch;
  }
}

/**
 * Ports and Adapters (Hexagonal) Architecture Pattern
 *
 * More detailed implementation than OnionArchitecture:
 * - Domain (core business logic)
 * - Ports (interfaces for external communication)
 * - Adapters (implementations of ports)
 */
export class PortsAndAdaptersArchitecture extends BaseArchRule {
  private domainPackages?: string[];
  private portsPackages?: string[];
  private adaptersPackages?: string[];
  private applicationPackages?: string[];

  constructor() {
    super('Ports and Adapters Architecture');
  }

  /**
   * Define domain layer (core business logic)
   */
  public domain(...packages: string[]): this {
    this.domainPackages = packages;
    return this;
  }

  /**
   * Define ports layer (interfaces)
   */
  public ports(...packages: string[]): this {
    this.portsPackages = packages;
    return this;
  }

  /**
   * Define adapters layer (implementations)
   */
  public adapters(...packages: string[]): this {
    this.adaptersPackages = packages;
    return this;
  }

  /**
   * Define application layer (use cases)
   */
  public application(...packages: string[]): this {
    this.applicationPackages = packages;
    return this;
  }

  /**
   * Check ports and adapters architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const violations = this.toLayeredArchitecture().check(classes);

    // Additional ports-and-adapters-specific validations
    violations.push(...this.checkPortsAreInterfaces(classes));

    return violations;
  }

  /**
   * Ensure ports are defined as interfaces or abstract classes
   */
  private checkPortsAreInterfaces(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!this.portsPackages) {
      return violations;
    }

    for (const cls of classes.getAll()) {
      if (this.isInPackages(cls.filePath, this.portsPackages)) {
        if (!cls.isAbstract) {
          violations.push(
            this.createViolation(
              `Port '${cls.name}' should be an interface or abstract class.`,
              cls.filePath,
              'Ports and Adapters: Ports must be interfaces or abstract'
            )
          );
        }
      }
    }

    return violations;
  }

  /**
   * Helper to check if a file path is in any of the given packages
   */
  private isInPackages(filePath: string, packages: string[]): boolean {
    return packages.some((pkg) => filePath.includes(pkg));
  }

  /**
   * Convert to layered architecture for rule checking
   */
  private toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.domainPackages) {
      arch.layer('Domain').definedBy(...this.domainPackages);
    }

    if (this.portsPackages) {
      arch.layer('Ports').definedBy(...this.portsPackages);
    }

    if (this.adaptersPackages) {
      arch.layer('Adapters').definedBy(...this.adaptersPackages);
    }

    if (this.applicationPackages) {
      arch.layer('Application').definedBy(...this.applicationPackages);
    }

    // Ports and Adapters Rules:
    // 1. Domain should not depend on Adapters
    if (this.domainPackages && this.adaptersPackages) {
      arch.whereLayer('Domain').mayNotAccessLayers('Adapters');
    }

    // 2. Ports should not depend on Adapters
    if (this.portsPackages && this.adaptersPackages) {
      arch.whereLayer('Ports').mayNotAccessLayers('Adapters');
    }

    // 3. Application may depend on Domain and Ports
    if (this.applicationPackages) {
      const allowed: string[] = [];
      if (this.domainPackages) allowed.push('Domain');
      if (this.portsPackages) allowed.push('Ports');
      if (allowed.length > 0) {
        arch.whereLayer('Application').mayOnlyAccessLayers(...allowed);
      }
    }

    // 4. Adapters may depend on Ports and Domain
    if (this.adaptersPackages) {
      const allowed: string[] = [];
      if (this.portsPackages) allowed.push('Ports');
      if (this.domainPackages) allowed.push('Domain');
      if (allowed.length > 0) {
        arch.whereLayer('Adapters').mayOnlyAccessLayers(...allowed);
      }
    }

    return arch;
  }
}

/**
 * Factory functions for creating architectural patterns
 */
export function mvcArchitecture(): MVCArchitecture {
  return new MVCArchitecture();
}

export function mvvmArchitecture(): MVVMArchitecture {
  return new MVVMArchitecture();
}

export function cqrsArchitecture(): CQRSArchitecture {
  return new CQRSArchitecture();
}

export function eventDrivenArchitecture(): EventDrivenArchitecture {
  return new EventDrivenArchitecture();
}

export function portsAndAdaptersArchitecture(): PortsAndAdaptersArchitecture {
  return new PortsAndAdaptersArchitecture();
}
