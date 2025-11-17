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

  public adapter(...adapterName: string): AdapterBuilder {
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

  public definedBy(...packages: string[]): OnionArchitecture {
    return this.architecture;
  }
}
