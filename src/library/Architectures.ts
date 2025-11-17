import { LayeredArchitecture, layeredArchitecture } from './LayeredArchitecture';

/**
 * Predefined architecture patterns
 */
export class Architectures {
  /**
   * Create a layered architecture
   */
  public static layeredArchitecture(): LayeredArchitecture {
    return layeredArchitecture();
  }

  /**
   * Create an onion (hexagonal) architecture
   */
  public static onionArchitecture(): OnionArchitecture {
    return new OnionArchitecture();
  }

  /**
   * Create a clean architecture pattern
   */
  public static cleanArchitecture(): CleanArchitecture {
    return new CleanArchitecture();
  }

  /**
   * Create a DDD (Domain-Driven Design) architecture pattern
   */
  public static dddArchitecture(): DDDArchitecture {
    return new DDDArchitecture();
  }

  /**
   * Create a microservices architecture pattern
   */
  public static microservicesArchitecture(): MicroservicesArchitecture {
    return new MicroservicesArchitecture();
  }
}

/**
 * Onion/Hexagonal Architecture support
 */
export class OnionArchitecture {
  private domainLayer?: string[];
  private applicationLayer?: string[];
  private infrastructureLayer?: string[];

  public domainModels(...packages: string[]): this {
    this.domainLayer = packages;
    return this;
  }

  public applicationServices(...packages: string[]): this {
    this.applicationLayer = packages;
    return this;
  }

  public adapter(..._adapterName: string[]): AdapterBuilder {
    return new AdapterBuilder(this);
  }

  public toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.domainLayer) {
      arch.layer('Domain').definedBy(...this.domainLayer);
    }

    if (this.applicationLayer) {
      arch.layer('Application').definedBy(...this.applicationLayer);
    }

    if (this.infrastructureLayer) {
      arch.layer('Infrastructure').definedBy(...this.infrastructureLayer);
    }

    // Domain layer should not depend on application or infrastructure
    if (this.domainLayer) {
      arch.whereLayer('Domain').mayNotAccessLayers('Application', 'Infrastructure');
    }

    // Application layer may depend on domain but not infrastructure
    if (this.applicationLayer && this.domainLayer) {
      arch.whereLayer('Application').mayOnlyAccessLayers('Domain');
    }

    return arch;
  }
}

/**
 * Adapter builder for onion architecture
 */
export class AdapterBuilder {
  constructor(private architecture: OnionArchitecture) {}

  public definedBy(..._packages: string[]): OnionArchitecture {
    return this.architecture;
  }
}

/**
 * Clean Architecture pattern support
 *
 * Layers (from innermost to outermost):
 * - Entities: Enterprise business rules
 * - Use Cases: Application business rules
 * - Controllers/Presenters: Interface adapters
 * - Frameworks: External interfaces (DB, Web, etc.)
 */
export class CleanArchitecture {
  private entitiesLayer?: string[];
  private useCasesLayer?: string[];
  private controllersLayer?: string[];
  private presentersLayer?: string[];
  private gatewaysLayer?: string[];

  /**
   * Define entities layer (domain entities)
   */
  public entities(...packages: string[]): this {
    this.entitiesLayer = packages;
    return this;
  }

  /**
   * Define use cases layer (application business logic)
   */
  public useCases(...packages: string[]): this {
    this.useCasesLayer = packages;
    return this;
  }

  /**
   * Define controllers layer (input adapters)
   */
  public controllers(...packages: string[]): this {
    this.controllersLayer = packages;
    return this;
  }

  /**
   * Define presenters layer (output adapters)
   */
  public presenters(...packages: string[]): this {
    this.presentersLayer = packages;
    return this;
  }

  /**
   * Define gateways layer (infrastructure/data access)
   */
  public gateways(...packages: string[]): this {
    this.gatewaysLayer = packages;
    return this;
  }

  /**
   * Convert to layered architecture for rule checking
   */
  public toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.entitiesLayer) {
      arch.layer('Entities').definedBy(...this.entitiesLayer);
    }

    if (this.useCasesLayer) {
      arch.layer('UseCases').definedBy(...this.useCasesLayer);
    }

    if (this.controllersLayer) {
      arch.layer('Controllers').definedBy(...this.controllersLayer);
    }

    if (this.presentersLayer) {
      arch.layer('Presenters').definedBy(...this.presentersLayer);
    }

    if (this.gatewaysLayer) {
      arch.layer('Gateways').definedBy(...this.gatewaysLayer);
    }

    // Clean Architecture dependency rules
    // Entities should not depend on anything
    if (this.entitiesLayer) {
      const layers = ['UseCases', 'Controllers', 'Presenters', 'Gateways'].filter((_l) => {
        return (
          this.useCasesLayer || this.controllersLayer || this.presentersLayer || this.gatewaysLayer
        );
      });
      if (layers.length > 0) {
        arch.whereLayer('Entities').mayNotAccessLayers(...layers);
      }
    }

    // Use cases may only depend on entities
    if (this.useCasesLayer && this.entitiesLayer) {
      arch.whereLayer('UseCases').mayOnlyAccessLayers('Entities');
    }

    // Controllers may depend on use cases and entities
    if (this.controllersLayer) {
      const allowed: string[] = [];
      if (this.useCasesLayer) allowed.push('UseCases');
      if (this.entitiesLayer) allowed.push('Entities');
      if (allowed.length > 0) {
        arch.whereLayer('Controllers').mayOnlyAccessLayers(...allowed);
      }
    }

    // Presenters may depend on use cases and entities
    if (this.presentersLayer) {
      const allowed: string[] = [];
      if (this.useCasesLayer) allowed.push('UseCases');
      if (this.entitiesLayer) allowed.push('Entities');
      if (allowed.length > 0) {
        arch.whereLayer('Presenters').mayOnlyAccessLayers(...allowed);
      }
    }

    // Gateways may depend on use cases and entities
    if (this.gatewaysLayer) {
      const allowed: string[] = [];
      if (this.useCasesLayer) allowed.push('UseCases');
      if (this.entitiesLayer) allowed.push('Entities');
      if (allowed.length > 0) {
        arch.whereLayer('Gateways').mayOnlyAccessLayers(...allowed);
      }
    }

    return arch;
  }
}

/**
 * Domain-Driven Design (DDD) architecture pattern support
 *
 * Tactical DDD patterns:
 * - Aggregates: Cluster of entities with a root
 * - Entities: Objects with identity
 * - Value Objects: Immutable objects without identity
 * - Domain Services: Stateless operations
 * - Repositories: Data access abstraction
 * - Factories: Complex object creation
 */
export class DDDArchitecture {
  private aggregatesLayer?: string[];
  private entitiesLayer?: string[];
  private valueObjectsLayer?: string[];
  private domainServicesLayer?: string[];
  private repositoriesLayer?: string[];
  private factoriesLayer?: string[];
  private applicationServicesLayer?: string[];

  /**
   * Define aggregates layer
   */
  public aggregates(...packages: string[]): this {
    this.aggregatesLayer = packages;
    return this;
  }

  /**
   * Define entities layer
   */
  public entities(...packages: string[]): this {
    this.entitiesLayer = packages;
    return this;
  }

  /**
   * Define value objects layer
   */
  public valueObjects(...packages: string[]): this {
    this.valueObjectsLayer = packages;
    return this;
  }

  /**
   * Define domain services layer
   */
  public domainServices(...packages: string[]): this {
    this.domainServicesLayer = packages;
    return this;
  }

  /**
   * Define repositories layer
   */
  public repositories(...packages: string[]): this {
    this.repositoriesLayer = packages;
    return this;
  }

  /**
   * Define factories layer
   */
  public factories(...packages: string[]): this {
    this.factoriesLayer = packages;
    return this;
  }

  /**
   * Define application services layer
   */
  public applicationServices(...packages: string[]): this {
    this.applicationServicesLayer = packages;
    return this;
  }

  /**
   * Convert to layered architecture for rule checking
   */
  public toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    if (this.aggregatesLayer) {
      arch.layer('Aggregates').definedBy(...this.aggregatesLayer);
    }

    if (this.entitiesLayer) {
      arch.layer('Entities').definedBy(...this.entitiesLayer);
    }

    if (this.valueObjectsLayer) {
      arch.layer('ValueObjects').definedBy(...this.valueObjectsLayer);
    }

    if (this.domainServicesLayer) {
      arch.layer('DomainServices').definedBy(...this.domainServicesLayer);
    }

    if (this.repositoriesLayer) {
      arch.layer('Repositories').definedBy(...this.repositoriesLayer);
    }

    if (this.factoriesLayer) {
      arch.layer('Factories').definedBy(...this.factoriesLayer);
    }

    if (this.applicationServicesLayer) {
      arch.layer('ApplicationServices').definedBy(...this.applicationServicesLayer);
    }

    // DDD dependency rules
    // Value objects should not depend on entities or aggregates
    if (this.valueObjectsLayer) {
      const forbidden: string[] = [];
      if (this.entitiesLayer) forbidden.push('Entities');
      if (this.aggregatesLayer) forbidden.push('Aggregates');
      if (forbidden.length > 0) {
        arch.whereLayer('ValueObjects').mayNotAccessLayers(...forbidden);
      }
    }

    // Entities may depend on value objects but not on aggregates
    if (this.entitiesLayer && this.aggregatesLayer) {
      arch.whereLayer('Entities').mayNotAccessLayers('Aggregates');
    }

    // Repositories should not depend on application services
    if (this.repositoriesLayer && this.applicationServicesLayer) {
      arch.whereLayer('Repositories').mayNotAccessLayers('ApplicationServices');
    }

    // Application services may orchestrate domain objects
    if (this.applicationServicesLayer) {
      const allowed: string[] = [];
      if (this.aggregatesLayer) allowed.push('Aggregates');
      if (this.entitiesLayer) allowed.push('Entities');
      if (this.valueObjectsLayer) allowed.push('ValueObjects');
      if (this.domainServicesLayer) allowed.push('DomainServices');
      if (this.repositoriesLayer) allowed.push('Repositories');
      if (this.factoriesLayer) allowed.push('Factories');
      if (allowed.length > 0) {
        arch.whereLayer('ApplicationServices').mayOnlyAccessLayers(...allowed);
      }
    }

    return arch;
  }
}

/**
 * Microservices Architecture pattern support
 *
 * Ensures:
 * - Services are isolated and don't depend on each other directly
 * - All services can access shared kernel
 * - Optional API gateway for external access
 */
export class MicroservicesArchitecture {
  private services: Map<string, string[]> = new Map();
  private sharedKernelPackages?: string[];
  private apiGatewayPackages?: string[];

  /**
   * Define a microservice
   */
  public service(serviceName: string, ...packages: string[]): this {
    this.services.set(serviceName, packages);
    return this;
  }

  /**
   * Define shared kernel (code that all services can access)
   */
  public sharedKernel(...packages: string[]): this {
    this.sharedKernelPackages = packages;
    return this;
  }

  /**
   * Define API gateway (optional)
   */
  public apiGateway(...packages: string[]): this {
    this.apiGatewayPackages = packages;
    return this;
  }

  /**
   * Convert to layered architecture for rule checking
   */
  public toLayeredArchitecture(): LayeredArchitecture {
    const arch = layeredArchitecture();

    // Add shared kernel as a base layer
    if (this.sharedKernelPackages) {
      arch.layer('SharedKernel').definedBy(...this.sharedKernelPackages);
    }

    // Add each service as a layer
    for (const [serviceName, packages] of this.services) {
      arch.layer(serviceName).definedBy(...packages);
    }

    // Add API gateway if defined
    if (this.apiGatewayPackages) {
      arch.layer('ApiGateway').definedBy(...this.apiGatewayPackages);
    }

    // Enforce microservices rules:
    // 1. Services can only access shared kernel (not other services)
    for (const [serviceName] of this.services) {
      if (this.sharedKernelPackages) {
        arch.whereLayer(serviceName).mayOnlyAccessLayers('SharedKernel');
      }
    }

    // 2. API gateway can access all services and shared kernel
    if (this.apiGatewayPackages) {
      const allowedLayers = ['SharedKernel', ...Array.from(this.services.keys())];
      arch.whereLayer('ApiGateway').mayOnlyAccessLayers(...allowedLayers);
    }

    // 3. Shared kernel should not depend on services or gateway
    if (this.sharedKernelPackages) {
      const forbiddenLayers = [...Array.from(this.services.keys())];
      if (this.apiGatewayPackages) {
        forbiddenLayers.push('ApiGateway');
      }
      if (forbiddenLayers.length > 0) {
        arch.whereLayer('SharedKernel').mayNotAccessLayers(...forbiddenLayers);
      }
    }

    return arch;
  }
}

/**
 * Convenience exports
 */
export function cleanArchitecture(): CleanArchitecture {
  return new CleanArchitecture();
}

export function dddArchitecture(): DDDArchitecture {
  return new DDDArchitecture();
}

export function microservicesArchitecture(): MicroservicesArchitecture {
  return new MicroservicesArchitecture();
}
