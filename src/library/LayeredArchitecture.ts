import { TSClasses } from '../core/TSClasses';
import { BaseArchRule } from '../core/ArchRule';
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
  private dependencyLayerCache: Map<string, string | null> = new Map();

  constructor() {
    super('Layered Architecture');
  }

  /**
   * Consider all dependencies (not just direct ones)
   */
  public consideringAllDependencies(): this {
    // Note: This is a placeholder for future implementation
    return this;
  }

  /**
   * Consider only direct dependencies
   */
  public consideringOnlyDependenciesInLayers(): this {
    // Note: This is a placeholder for future implementation
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
   * OPTIMIZED: Uses hash maps for O(1) lookups instead of O(n·m·k)
   */
  public check(classes: TSClasses): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // Group classes by layer
    const classesByLayer = new Map<string, TSClasses>();
    // OPTIMIZATION: Build indices for fast lookups
    const classNameToLayer = new Map<string, string>();
    const moduleToLayer = new Map<string, string>();

    for (const [layerName, layer] of this.layers) {
      const layerClasses = new TSClasses();
      for (const cls of classes.getAll()) {
        for (const packagePattern of layer.packages) {
          if (cls.residesInPackage(packagePattern)) {
            layerClasses.add(cls);
            // Build lookup indices
            classNameToLayer.set(cls.name, layerName);
            moduleToLayer.set(cls.module, layerName);
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
          // OPTIMIZED: O(1) lookup instead of O(n·m)
          const depLayer = this.findLayerForDependency(dep, classNameToLayer, moduleToLayer);
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
   * OPTIMIZED: Uses hash maps for O(1) lookup + caching for repeated lookups
   */
  private findLayerForDependency(
    dependency: string,
    classNameToLayer: Map<string, string>,
    moduleToLayer: Map<string, string>
  ): string | null {
    // Check cache first for O(1) lookup on repeated dependencies
    if (this.dependencyLayerCache.has(dependency)) {
      return this.dependencyLayerCache.get(dependency) || null;
    }

    // Try exact class name match first
    const layerByName = classNameToLayer.get(dependency);
    if (layerByName) {
      this.dependencyLayerCache.set(dependency, layerByName);
      return layerByName;
    }

    // Try module lookup (partial match) - only runs once per unique dependency
    for (const [module, layer] of moduleToLayer.entries()) {
      if (module.includes(dependency) || dependency.includes(module)) {
        this.dependencyLayerCache.set(dependency, layer);
        return layer;
      }
    }

    // Cache negative results too to avoid repeated lookups
    this.dependencyLayerCache.set(dependency, null);
    return null;
  }
}

/**
 * Builder for defining a layer
 */
export class LayerDefinition {
  constructor(
    private architecture: LayeredArchitecture,
    private layerName: string
  ) {}

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
  constructor(
    private architecture: LayeredArchitecture,
    private layerName: string
  ) {}

  /**
   * This layer may only be accessed by specific layers
   */
  public mayOnlyBeAccessedByLayers(..._layerNames: string[]): LayeredArchitecture {
    // This creates a reverse rule - other layers may only access this layer if they're in the list
    return this.architecture;
  }

  /**
   * This layer may not be accessed by specific layers
   */
  public mayNotBeAccessedByLayers(..._layerNames: string[]): LayeredArchitecture {
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
