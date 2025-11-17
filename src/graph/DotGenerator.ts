/**
 * Generates Graphviz DOT format from dependency graphs
 */

import { DependencyGraph, DependencyType, GraphNode, GraphEdge } from './DependencyGraph';
import { ArchitectureViolation } from '../types';

/**
 * Options for DOT generation
 */
export interface DotGeneratorOptions {
  /** Graph direction: LR (left-right), TB (top-bottom), RL, BT */
  direction?: 'LR' | 'TB' | 'RL' | 'BT';
  /** Title for the graph */
  title?: string;
  /** Whether to show node metadata */
  showMetadata?: boolean;
  /** Whether to use colors */
  useColors?: boolean;
  /** Violations to highlight in the graph */
  violations?: ArchitectureViolation[];
  /** Whether to cluster nodes by module */
  clusterByModule?: boolean;
  /** Font name for labels */
  fontName?: string;
  /** Font size for labels */
  fontSize?: number;
}

/**
 * Generates DOT format output for Graphviz
 */
export class DotGenerator {
  private options: Required<DotGeneratorOptions>;

  constructor(options: DotGeneratorOptions = {}) {
    this.options = {
      direction: options.direction || 'TB',
      title: options.title || 'Dependency Graph',
      showMetadata: options.showMetadata ?? true,
      useColors: options.useColors ?? true,
      violations: options.violations || [],
      clusterByModule: options.clusterByModule ?? true,
      fontName: options.fontName || 'Helvetica',
      fontSize: options.fontSize || 12,
    };
  }

  /**
   * Generate DOT format from a dependency graph
   */
  public generate(graph: DependencyGraph): string {
    const lines: string[] = [];

    // Graph header
    lines.push('digraph DependencyGraph {');
    lines.push(`  label="${this.escapeLabel(this.options.title)}";`);
    lines.push(`  labelloc="t";`);
    lines.push(`  fontname="${this.options.fontName}";`);
    lines.push(`  fontsize=${this.options.fontSize + 4};`);
    lines.push(`  rankdir=${this.options.direction};`);
    lines.push('');

    // Graph attributes
    lines.push('  // Graph attributes');
    lines.push('  node [');
    lines.push(`    fontname="${this.options.fontName}",`);
    lines.push(`    fontsize=${this.options.fontSize},`);
    lines.push('    shape=box,');
    lines.push('    style="rounded,filled",');
    lines.push('    fillcolor="#f0f0f0"');
    lines.push('  ];');
    lines.push('  edge [');
    lines.push(`    fontname="${this.options.fontName}",`);
    lines.push(`    fontsize=${this.options.fontSize - 2}`);
    lines.push('  ];');
    lines.push('');

    // Group nodes by module if clustering is enabled
    if (this.options.clusterByModule) {
      this.generateClusters(graph, lines);
    } else {
      this.generateNodes(graph, lines);
    }

    // Generate edges
    lines.push('  // Edges');
    this.generateEdges(graph, lines);

    // Legend
    if (this.options.useColors) {
      this.generateLegend(lines);
    }

    lines.push('}');

    return lines.join('\n');
  }

  /**
   * Generate nodes grouped by module
   */
  private generateClusters(graph: DependencyGraph, lines: string[]): void {
    const nodesByModule = new Map<string, GraphNode[]>();

    // Group nodes by module
    graph.getNodes().forEach((node) => {
      const moduleName = node.module || 'default';
      if (!nodesByModule.has(moduleName)) {
        nodesByModule.set(moduleName, []);
      }
      nodesByModule.get(moduleName)!.push(node);
    });

    // Generate a cluster for each module
    let clusterIndex = 0;
    for (const [moduleName, nodes] of nodesByModule.entries()) {
      lines.push(`  // Module: ${moduleName}`);
      lines.push(`  subgraph cluster_${clusterIndex} {`);
      lines.push(`    label="${this.escapeLabel(moduleName)}";`);
      lines.push('    style="dashed";');
      lines.push('    color="#888888";');
      lines.push('');

      nodes.forEach((node) => {
        lines.push(`    ${this.generateNode(node)}`);
      });

      lines.push('  }');
      lines.push('');
      clusterIndex++;
    }
  }

  /**
   * Generate nodes without clustering
   */
  private generateNodes(graph: DependencyGraph, lines: string[]): void {
    lines.push('  // Nodes');
    graph.getNodes().forEach((node) => {
      lines.push(`  ${this.generateNode(node)}`);
    });
    lines.push('');
  }

  /**
   * Generate a single node definition
   */
  private generateNode(node: GraphNode): string {
    const attributes: string[] = [];

    // Label
    let label = node.name;
    if (this.options.showMetadata && node.metadata) {
      const meta = node.metadata;
      if (meta.isAbstract) label = `«abstract»\\n${label}`;
      if (meta.decorators && meta.decorators.length > 0) {
        label = `@${meta.decorators.join(', @')}\\n${label}`;
      }
    }
    attributes.push(`label="${this.escapeLabel(label)}"`);

    // Shape based on type
    switch (node.type) {
      case 'class':
        attributes.push('shape=box');
        break;
      case 'interface':
        attributes.push('shape=diamond');
        break;
      case 'function':
        attributes.push('shape=ellipse');
        break;
      case 'module':
        attributes.push('shape=folder');
        break;
    }

    // Color based on type and violations
    if (this.options.useColors) {
      const hasViolation = this.hasViolation(node);
      if (hasViolation) {
        attributes.push('fillcolor="#ffcccc"');
        attributes.push('color="#cc0000"');
        attributes.push('penwidth=2');
      } else {
        switch (node.type) {
          case 'class':
            attributes.push('fillcolor="#cce5ff"');
            break;
          case 'interface':
            attributes.push('fillcolor="#d9f2d9"');
            break;
          case 'function':
            attributes.push('fillcolor="#fff4cc"');
            break;
          case 'module':
            attributes.push('fillcolor="#e6e6fa"');
            break;
        }
      }
    }

    return `"${this.escapeId(node.id)}" [${attributes.join(', ')}];`;
  }

  /**
   * Generate edges
   */
  private generateEdges(graph: DependencyGraph, lines: string[]): void {
    graph.getEdges().forEach((edge) => {
      lines.push(`  ${this.generateEdge(edge)}`);
    });
    lines.push('');
  }

  /**
   * Generate a single edge definition
   */
  private generateEdge(edge: GraphEdge): string {
    const attributes: string[] = [];

    // Style based on dependency type
    switch (edge.type) {
      case DependencyType.INHERITANCE:
        attributes.push('arrowhead=empty');
        attributes.push('style=solid');
        if (this.options.useColors) attributes.push('color="#0066cc"');
        attributes.push('label="extends"');
        break;
      case DependencyType.IMPLEMENTATION:
        attributes.push('arrowhead=empty');
        attributes.push('style=dashed');
        if (this.options.useColors) attributes.push('color="#00cc66"');
        attributes.push('label="implements"');
        break;
      case DependencyType.IMPORT:
        attributes.push('arrowhead=normal');
        attributes.push('style=solid');
        if (this.options.useColors) attributes.push('color="#666666"');
        break;
      case DependencyType.USAGE:
        attributes.push('arrowhead=normal');
        attributes.push('style=dotted');
        if (this.options.useColors) attributes.push('color="#999999"');
        attributes.push('label="uses"');
        break;
    }

    return `"${this.escapeId(edge.from)}" -> "${this.escapeId(edge.to)}" [${attributes.join(', ')}];`;
  }

  /**
   * Generate legend
   */
  private generateLegend(lines: string[]): void {
    lines.push('  // Legend');
    lines.push('  subgraph cluster_legend {');
    lines.push('    label="Legend";');
    lines.push('    style="solid";');
    lines.push('    color="#000000";');
    lines.push('');
    lines.push('    legend_class [label="Class", shape=box, fillcolor="#cce5ff"];');
    lines.push('    legend_interface [label="Interface", shape=diamond, fillcolor="#d9f2d9"];');
    lines.push('    legend_function [label="Function", shape=ellipse, fillcolor="#fff4cc"];');
    lines.push(
      '    legend_violation [label="Violation", shape=box, fillcolor="#ffcccc", color="#cc0000", penwidth=2];'
    );
    lines.push('');
    lines.push('    // Edge legend');
    lines.push('    legend_e1 [label="", shape=point, width=0];');
    lines.push('    legend_e2 [label="", shape=point, width=0];');
    lines.push('    legend_e3 [label="", shape=point, width=0];');
    lines.push('    legend_e4 [label="", shape=point, width=0];');
    lines.push('    legend_e5 [label="", shape=point, width=0];');
    lines.push('    legend_e6 [label="", shape=point, width=0];');
    lines.push('    legend_e7 [label="", shape=point, width=0];');
    lines.push('    legend_e8 [label="", shape=point, width=0];');
    lines.push('');
    lines.push(
      '    legend_e1 -> legend_e2 [label="extends", arrowhead=empty, style=solid, color="#0066cc"];'
    );
    lines.push(
      '    legend_e3 -> legend_e4 [label="implements", arrowhead=empty, style=dashed, color="#00cc66"];'
    );
    lines.push(
      '    legend_e5 -> legend_e6 [label="import", arrowhead=normal, style=solid, color="#666666"];'
    );
    lines.push(
      '    legend_e7 -> legend_e8 [label="uses", arrowhead=normal, style=dotted, color="#999999"];'
    );
    lines.push('');
    lines.push('    // Invisible edges to control layout');
    lines.push(
      '    legend_class -> legend_interface -> legend_function -> legend_violation [style=invis];'
    );
    lines.push('  }');
    lines.push('');
  }

  /**
   * Check if a node has violations
   */
  private hasViolation(node: GraphNode): boolean {
    return this.options.violations.some(
      (v) => v.filePath === node.filePath || v.message.includes(node.name)
    );
  }

  /**
   * Escape label for DOT format
   */
  private escapeLabel(label: string): string {
    return label.replace(/"/g, '\\"').replace(/\n/g, '\\n');
  }

  /**
   * Escape ID for DOT format
   */
  private escapeId(id: string): string {
    return id.replace(/"/g, '\\"');
  }
}
