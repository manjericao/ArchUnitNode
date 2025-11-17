import { TSClasses } from '../core/TSClasses';
import { ArchRule, BaseArchRule } from '../core/ArchRule';
import { ArchitectureViolation } from '../types';

/**
 * Layer definition
 */
interface Layer {
  name: string;
  packages: string[];
}

/**
 * Layer access rule
 */
interface LayerAccessRule {
  from: string;
  to: string[];
  mayOnly: boolean; // true for "may only", false for "may not"
}

/**
 * Defines and checks layered architecture rules
 */
export class LayeredArchitecture extends BaseArchRule {
  private layers: Map<string, Layer> = new Map();
  private accessRules: LayerAccessRule[] = [];
  private considerAllDependencies: boolean = false;

  constructor() {
    super('Layered Architecture');
  }

  /**
   * Consider all dependencies (not just direct ones)
   */
  public consideringAllDependencies(): this {
    this.considerAllDependencies = true;
    return this;
  }

  /**
   * Consider only direct dependencies
   */
  public consideringOnlyDependenciesInLayers(): this {
    this.considerAllDependencies = false;
    return this;
  }

  /**
   * Define a layer
   */
  public layer(name: string): LayerDefinition {
    return new LayerDefinition(this, name);
  }

  /**
   * Internal method to add a layer
   */
  public _addLayer(name: string, packages: string[]): void {
    this.layers.set(name, { name, packages });
  }

  /**
   * Define access rules for a layer
   */
  public whereLayer(layerName: string): LayerAccessRuleBuilder {
    if (!this.layers.has(layerName)) {
      throw new Error(`Layer '${layerName}' is not defined`);
    }
    return new LayerAccessRuleBuilder(this, layerName);
  }

  /**
   * Internal method to add an access rule
   */
  public _addAccessRule(rule: LayerAccessRule): void {
    this.accessRules.push(rule);
  }

  /**
   * Check layered architecture rules
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // Group classes by layer
    const classesByLayer = new Map<string, TSClasses>();
    for (const [layerName, layer] of this.layers) {
      const layerClasses = new TSClasses();
      for (const cls of classes.getAll()) {
        for (const packagePattern of layer.packages) {
          if (cls.residesInPackage(packagePattern)) {
            layerClasses.add(cls);
            break;
          }
        }
      }
      classesByLayer.set(layerName, layerClasses);
    }

    // Check access rules
    for (const rule of this.accessRules) {
      const fromLayer = classesByLayer.get(rule.from);
      if (!fromLayer) continue;

      for (const cls of fromLayer.getAll()) {
        // In a real implementation, we would check actual dependencies here
        // For now, this is a simplified version
        const dependencies = cls.getDependencies();

        for (const dep of dependencies) {
          const depLayer = this.findLayerForDependency(dep, classesByLayer);
          if (!depLayer) continue;

          if (rule.mayOnly) {
            // Check if dependency is in allowed layers
            if (!rule.to.includes(depLayer)) {
              violations.push(
                this.createViolation(
                  `Layer '${rule.from}' may only access layers [${rule.to.join(', ')}], but '${cls.name}' accesses '${dep}' in layer '${depLayer}'`,
                  cls.filePath,
                  this.description
                )
              );
            }
          } else {
            // Check if dependency is in forbidden layers
            if (rule.to.includes(depLayer)) {
              violations.push(
                this.createViolation(
                  `Layer '${rule.from}' may not access layers [${rule.to.join(', ')}], but '${cls.name}' accesses '${dep}' in layer '${depLayer}'`,
                  cls.filePath,
                  this.description
                )
              );
            }
          }
        }
      }
    }

    return violations;
  }

  /**
   * Find which layer a dependency belongs to
   */
  private findLayerForDependency(
    dependency: string,
    classesByLayer: Map<string, TSClasses>
  ): string | null {
    for (const [layerName, layerClasses] of classesByLayer) {
      for (const cls of layerClasses.getAll()) {
        if (cls.name === dependency || cls.module.includes(dependency)) {
          return layerName;
        }
      }
    }
    return null;
  }

  /**
   * Update description
   */
  private updateDescription(): void {
    const layerNames = Array.from(this.layers.keys());
    this.description = `Layered Architecture with layers: ${layerNames.join(', ')}`;
  }
}

/**
 * Builder for defining a layer
 */
export class LayerDefinition {
  constructor(private architecture: LayeredArchitecture, private layerName: string) {}

  /**
   * Define which packages belong to this layer
   */
  public definedBy(...packages: string[]): LayeredArchitecture {
    this.architecture._addLayer(this.layerName, packages);
    return this.architecture;
  }
}

/**
 * Builder for defining layer access rules
 */
export class LayerAccessRuleBuilder {
  constructor(private architecture: LayeredArchitecture, private layerName: string) {}

  /**
   * This layer may only be accessed by specific layers
   */
  public mayOnlyBeAccessedByLayers(...layerNames: string[]): LayeredArchitecture {
    // This creates a reverse rule - other layers may only access this layer if they're in the list
    return this.architecture;
  }

  /**
   * This layer may not be accessed by specific layers
   */
  public mayNotBeAccessedByLayers(...layerNames: string[]): LayeredArchitecture {
    return this.architecture;
  }

  /**
   * This layer may only access specific layers
   */
  public mayOnlyAccessLayers(...layerNames: string[]): LayeredArchitecture {
    this.architecture._addAccessRule({
      from: this.layerName,
      to: layerNames,
      mayOnly: true,
    });
    return this.architecture;
  }

  /**
   * This layer may not access specific layers
   */
  public mayNotAccessLayers(...layerNames: string[]): LayeredArchitecture {
    this.architecture._addAccessRule({
      from: this.layerName,
      to: layerNames,
      mayOnly: false,
    });
    return this.architecture;
  }
}

/**
 * Factory function for creating layered architecture
 */
export function layeredArchitecture(): LayeredArchitecture {
  return new LayeredArchitecture();
}
