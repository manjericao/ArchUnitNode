/**
 * Builds dependency graphs from TypeScript classes
 */

import { TSClasses } from '../core/TSClasses';
import { DependencyGraph, GraphNode, GraphEdge, DependencyType } from './DependencyGraph';

/**
 * Options for building dependency graphs
 */
export interface GraphBuilderOptions {
  includeInterfaces?: boolean;
  includeFunctions?: boolean;
  includeModules?: boolean;
  resolveTransitive?: boolean; // Include transitive dependencies
}

/**
 * Builds dependency graphs from analyzed TypeScript code
 */
export class GraphBuilder {
  private _options: GraphBuilderOptions;

  constructor(options: GraphBuilderOptions = {}) {
    this._options = {
      includeInterfaces: true,
      includeFunctions: false,
      includeModules: false,
      resolveTransitive: false,
      ...options,
    };
    // TODO: Implement options usage in build() method
    void this._options; // Intentionally kept for future feature implementation
  }

  /**
   * Build a dependency graph from TSClasses
   */
  public build(classes: TSClasses): DependencyGraph {
    const graph = new DependencyGraph();

    // Create a map for quick lookups
    const classMap = new Map<string, any>();
    classes.getAll().forEach((cls) => {
      classMap.set(cls.name, cls);
    });

    // Add class nodes
    classes.getAll().forEach((cls) => {
      graph.addNode(this.createClassNode(cls));
    });

    // Add edges for class relationships
    classes.getAll().forEach((cls) => {
      this.addClassEdges(graph, cls, classMap);
    });

    return graph;
  }

  /**
   * Create a graph node from a class
   */
  private createClassNode(cls: any): GraphNode {
    return {
      id: this.getClassId(cls),
      name: cls.name,
      type: 'class',
      filePath: cls.filePath,
      module: cls.module,
      metadata: {
        isAbstract: cls.isAbstract,
        isExported: cls.isExported,
        decorators: cls.decorators.map((d: any) => d.name),
      },
    };
  }

  /**
   * Add edges for a class's dependencies
   */
  private addClassEdges(graph: DependencyGraph, cls: any, classMap: Map<string, any>): void {
    const classId = this.getClassId(cls);

    // Add inheritance edge
    if (cls.extends) {
      const parentClass = classMap.get(cls.extends);
      if (parentClass) {
        const edge: GraphEdge = {
          from: classId,
          to: this.getClassId(parentClass),
          type: DependencyType.INHERITANCE,
        };
        graph.addEdge(edge);
      }
    }

    // Add implementation edges (implements can be interfaces or other classes)
    if (cls.implements && cls.implements.length > 0) {
      cls.implements.forEach((implementedName: string) => {
        const implementedClass = classMap.get(implementedName);
        if (implementedClass) {
          const edge: GraphEdge = {
            from: classId,
            to: this.getClassId(implementedClass),
            type: DependencyType.IMPLEMENTATION,
          };
          graph.addEdge(edge);
        }
      });
    }
  }

  /**
   * Get unique ID for a class
   */
  private getClassId(cls: any): string {
    return `class:${cls.module}:${cls.name}`;
  }
}
