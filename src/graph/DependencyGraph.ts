/**
 * Dependency Graph data structures for visualization
 */

import { SourceLocation } from '../types';

/**
 * Type of dependency relationship
 */
export enum DependencyType {
  IMPORT = 'import',
  INHERITANCE = 'inheritance',
  IMPLEMENTATION = 'implementation',
  USAGE = 'usage',
}

/**
 * Represents a node in the dependency graph (typically a class or module)
 */
export interface GraphNode {
  id: string;
  name: string;
  type: 'class' | 'interface' | 'module' | 'function';
  filePath: string;
  module: string;
  metadata?: {
    isAbstract?: boolean;
    isExported?: boolean;
    decorators?: string[];
  };
}

/**
 * Represents an edge in the dependency graph (a dependency relationship)
 */
export interface GraphEdge {
  from: string; // Source node ID
  to: string; // Target node ID
  type: DependencyType;
  location?: SourceLocation;
  metadata?: {
    strength?: number; // For weighted graphs
    bidirectional?: boolean;
  };
}

/**
 * Graph filtering options
 */
export interface GraphFilter {
  includeTypes?: ('class' | 'interface' | 'module' | 'function')[];
  excludeTypes?: ('class' | 'interface' | 'module' | 'function')[];
  includeModules?: string[]; // Module name patterns
  excludeModules?: string[]; // Module name patterns
  maxDepth?: number; // Maximum dependency depth
  dependencyTypes?: DependencyType[];
}

/**
 * Represents the complete dependency graph
 */
export class DependencyGraph {
  private nodes: Map<string, GraphNode>;
  private edges: GraphEdge[];
  private adjacencyList: Map<string, Set<string>>;
  private reverseAdjacencyList: Map<string, Set<string>>;

  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.adjacencyList = new Map();
    this.reverseAdjacencyList = new Map();
  }

  /**
   * Add a node to the graph
   */
  public addNode(node: GraphNode): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, new Set());
    }
    if (!this.reverseAdjacencyList.has(node.id)) {
      this.reverseAdjacencyList.set(node.id, new Set());
    }
  }

  /**
   * Add an edge to the graph
   */
  public addEdge(edge: GraphEdge): void {
    this.edges.push(edge);

    // Update adjacency lists
    const fromSet = this.adjacencyList.get(edge.from) || new Set();
    fromSet.add(edge.to);
    this.adjacencyList.set(edge.from, fromSet);

    const toSet = this.reverseAdjacencyList.get(edge.to) || new Set();
    toSet.add(edge.from);
    this.reverseAdjacencyList.set(edge.to, toSet);
  }

  /**
   * Get all nodes in the graph
   */
  public getNodes(): GraphNode[] {
    return Array.from(this.nodes.values());
  }

  /**
   * Get all edges in the graph
   */
  public getEdges(): GraphEdge[] {
    return this.edges;
  }

  /**
   * Get a node by ID
   */
  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  /**
   * Get dependencies of a node (outgoing edges)
   */
  public getDependencies(nodeId: string): string[] {
    const deps = this.adjacencyList.get(nodeId);
    return deps ? Array.from(deps) : [];
  }

  /**
   * Get dependents of a node (incoming edges)
   */
  public getDependents(nodeId: string): string[] {
    const deps = this.reverseAdjacencyList.get(nodeId);
    return deps ? Array.from(deps) : [];
  }

  /**
   * Get all edges from a node
   */
  public getEdgesFrom(nodeId: string): GraphEdge[] {
    return this.edges.filter((edge) => edge.from === nodeId);
  }

  /**
   * Get all edges to a node
   */
  public getEdgesTo(nodeId: string): GraphEdge[] {
    return this.edges.filter((edge) => edge.to === nodeId);
  }

  /**
   * Check if the graph contains cycles
   */
  public hasCycles(): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const neighbors = this.getDependencies(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (hasCycleDFS(neighbor)) {
            return true;
          }
        } else if (recursionStack.has(neighbor)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const nodeId of this.nodes.keys()) {
      if (!visited.has(nodeId)) {
        if (hasCycleDFS(nodeId)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Find all cycles in the graph
   */
  public findCycles(): string[][] {
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack: string[] = [];

    const findCyclesDFS = (nodeId: string): void => {
      visited.add(nodeId);
      recursionStack.push(nodeId);

      const neighbors = this.getDependencies(nodeId);
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          findCyclesDFS(neighbor);
        } else {
          const cycleStartIndex = recursionStack.indexOf(neighbor);
          if (cycleStartIndex !== -1) {
            const cycle = recursionStack.slice(cycleStartIndex);
            cycles.push([...cycle, neighbor]);
          }
        }
      }

      recursionStack.pop();
    };

    for (const nodeId of this.nodes.keys()) {
      visited.clear();
      recursionStack.length = 0;
      findCyclesDFS(nodeId);
    }

    // Deduplicate cycles
    const uniqueCycles = new Set<string>();
    return cycles.filter((cycle) => {
      const normalized = [...cycle].sort().join('->');
      if (uniqueCycles.has(normalized)) {
        return false;
      }
      uniqueCycles.add(normalized);
      return true;
    });
  }

  /**
   * Apply filters to create a subgraph
   */
  public filter(filter: GraphFilter): DependencyGraph {
    const filteredGraph = new DependencyGraph();

    // Filter nodes
    const filteredNodes = this.getNodes().filter((node) => {
      if (filter.includeTypes && !filter.includeTypes.includes(node.type)) {
        return false;
      }
      if (filter.excludeTypes && filter.excludeTypes.includes(node.type)) {
        return false;
      }
      if (filter.includeModules) {
        const matches = filter.includeModules.some((pattern) => node.module.includes(pattern));
        if (!matches) return false;
      }
      if (filter.excludeModules) {
        const matches = filter.excludeModules.some((pattern) => node.module.includes(pattern));
        if (matches) return false;
      }
      return true;
    });

    // Add filtered nodes
    filteredNodes.forEach((node) => filteredGraph.addNode(node));

    // Filter edges
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = this.edges.filter((edge) => {
      if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) {
        return false;
      }
      if (filter.dependencyTypes && !filter.dependencyTypes.includes(edge.type)) {
        return false;
      }
      return true;
    });

    // Add filtered edges
    filteredEdges.forEach((edge) => filteredGraph.addEdge(edge));

    return filteredGraph;
  }

  /**
   * Get graph statistics
   */
  public getStats(): {
    nodeCount: number;
    edgeCount: number;
    avgDependencies: number;
    maxDependencies: number;
    hasCycles: boolean;
  } {
    const nodeCount = this.nodes.size;
    const edgeCount = this.edges.length;

    let maxDependencies = 0;
    let totalDependencies = 0;

    for (const nodeId of this.nodes.keys()) {
      const depCount = this.getDependencies(nodeId).length;
      totalDependencies += depCount;
      maxDependencies = Math.max(maxDependencies, depCount);
    }

    return {
      nodeCount,
      edgeCount,
      avgDependencies: nodeCount > 0 ? totalDependencies / nodeCount : 0,
      maxDependencies,
      hasCycles: this.hasCycles(),
    };
  }
}
