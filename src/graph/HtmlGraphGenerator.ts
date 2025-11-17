/**
 * Generates interactive HTML dependency graph using D3.js
 */

import { DependencyGraph } from './DependencyGraph';
import { ArchitectureViolation } from '../types';

/**
 * Options for HTML graph generation
 */
export interface HtmlGraphOptions {
  /** Title for the graph */
  title?: string;
  /** Violations to highlight */
  violations?: ArchitectureViolation[];
  /** Width of the visualization */
  width?: number;
  /** Height of the visualization */
  height?: number;
  /** Whether to show the legend */
  showLegend?: boolean;
  /** Whether to enable physics simulation */
  enablePhysics?: boolean;
}

/**
 * Generates interactive HTML graphs using D3.js
 */
export class HtmlGraphGenerator {
  private options: Required<HtmlGraphOptions>;

  constructor(options: HtmlGraphOptions = {}) {
    this.options = {
      title: options.title || 'Dependency Graph',
      violations: options.violations || [],
      width: options.width || 1200,
      height: options.height || 800,
      showLegend: options.showLegend ?? true,
      enablePhysics: options.enablePhysics ?? true,
    };
  }

  /**
   * Generate HTML with embedded D3.js visualization
   */
  public generate(graph: DependencyGraph): string {
    const graphData = this.prepareGraphData(graph);
    const stats = graph.getStats();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(this.options.title)}</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: ${this.options.width + 40}px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
    }

    .header h1 {
      font-size: 28px;
      margin-bottom: 10px;
    }

    .stats {
      display: flex;
      gap: 30px;
      margin-top: 15px;
      font-size: 14px;
    }

    .stat {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      opacity: 0.9;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .controls {
      padding: 20px 30px;
      background: #fafafa;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      align-items: center;
    }

    .control-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .control-group label {
      font-size: 14px;
      color: #555;
      font-weight: 500;
    }

    select, input[type="range"] {
      padding: 6px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }

    input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    button {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: background 0.2s;
    }

    button:hover {
      background: #5568d3;
    }

    #graph {
      background: white;
    }

    .node {
      cursor: pointer;
      stroke-width: 2px;
    }

    .node.highlighted {
      stroke: #ff6b6b;
      stroke-width: 3px;
    }

    .node-label {
      font-size: 12px;
      font-weight: 500;
      pointer-events: none;
      text-anchor: middle;
      dominant-baseline: central;
    }

    .link {
      stroke: #999;
      stroke-opacity: 0.6;
      fill: none;
    }

    .link.highlighted {
      stroke: #667eea;
      stroke-width: 2px;
      stroke-opacity: 1;
    }

    .link-label {
      font-size: 10px;
      fill: #666;
      pointer-events: none;
    }

    .arrow {
      fill: #999;
    }

    .tooltip {
      position: absolute;
      padding: 12px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      border-radius: 6px;
      font-size: 13px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      max-width: 300px;
      z-index: 1000;
    }

    .tooltip.visible {
      opacity: 1;
    }

    .tooltip-title {
      font-weight: bold;
      margin-bottom: 8px;
      font-size: 14px;
      border-bottom: 1px solid rgba(255,255,255,0.2);
      padding-bottom: 6px;
    }

    .tooltip-row {
      margin: 4px 0;
      display: flex;
      justify-content: space-between;
      gap: 15px;
    }

    .tooltip-label {
      opacity: 0.7;
      font-size: 11px;
    }

    .legend {
      padding: 20px 30px;
      background: #fafafa;
      border-top: 1px solid #e0e0e0;
    }

    .legend-title {
      font-weight: 600;
      margin-bottom: 12px;
      font-size: 14px;
      color: #333;
    }

    .legend-items {
      display: flex;
      gap: 25px;
      flex-wrap: wrap;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
    }

    .legend-symbol {
      width: 16px;
      height: 16px;
      border-radius: 3px;
    }

    .legend-line {
      width: 30px;
      height: 2px;
      background: #999;
    }

    .warning-badge {
      background: #ffc107;
      color: #000;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      margin-left: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${this.escapeHtml(this.options.title)}</h1>
      <div class="stats">
        <div class="stat">
          <div class="stat-value">${stats.nodeCount}</div>
          <div class="stat-label">Nodes</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.edgeCount}</div>
          <div class="stat-label">Dependencies</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.avgDependencies.toFixed(1)}</div>
          <div class="stat-label">Avg Dependencies</div>
        </div>
        <div class="stat">
          <div class="stat-value">${stats.hasCycles ? 'Yes' : 'No'}</div>
          <div class="stat-label">Cycles ${stats.hasCycles ? '<span class="warning-badge">WARNING</span>' : ''}</div>
        </div>
      </div>
    </div>

    <div class="controls">
      <div class="control-group">
        <label for="physics">Physics:</label>
        <input type="checkbox" id="physics" ${this.options.enablePhysics ? 'checked' : ''}>
      </div>
      <div class="control-group">
        <label for="charge">Charge:</label>
        <input type="range" id="charge" min="-500" max="-50" value="-200" step="10">
      </div>
      <div class="control-group">
        <label for="distance">Distance:</label>
        <input type="range" id="distance" min="50" max="300" value="150" step="10">
      </div>
      <div class="control-group">
        <label for="filter">Filter:</label>
        <select id="filter">
          <option value="all">All Nodes</option>
          <option value="class">Classes Only</option>
          <option value="interface">Interfaces Only</option>
          <option value="violations">Violations Only</option>
        </select>
      </div>
      <button id="reset">Reset Layout</button>
      <button id="fitView">Fit to View</button>
    </div>

    <svg id="graph" width="${this.options.width}" height="${this.options.height}"></svg>

    ${
      this.options.showLegend
        ? `
    <div class="legend">
      <div class="legend-title">Legend</div>
      <div class="legend-items">
        <div class="legend-item">
          <div class="legend-symbol" style="background: #4a90e2;"></div>
          <span>Class</span>
        </div>
        <div class="legend-item">
          <div class="legend-symbol" style="background: #7ed321;"></div>
          <span>Interface</span>
        </div>
        <div class="legend-item">
          <div class="legend-symbol" style="background: #f5a623;"></div>
          <span>Function</span>
        </div>
        <div class="legend-item">
          <div class="legend-symbol" style="background: #ff6b6b; border: 2px solid #cc0000;"></div>
          <span>Violation</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-top: 2px solid #0066cc;"></div>
          <span>Inheritance</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-top: 2px dashed #00cc66;"></div>
          <span>Implementation</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-top: 2px solid #666;"></div>
          <span>Import</span>
        </div>
        <div class="legend-item">
          <div class="legend-line" style="border-top: 2px dotted #999;"></div>
          <span>Usage</span>
        </div>
      </div>
    </div>
    `
        : ''
    }
  </div>

  <div class="tooltip" id="tooltip"></div>

  <script>
    // Graph data
    const graphData = ${JSON.stringify(graphData, null, 2)};

    // D3 visualization
    const svg = d3.select('#graph');
    const width = ${this.options.width};
    const height = ${this.options.height};

    // Create groups for different layers
    const linkGroup = svg.append('g').attr('class', 'links');
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const labelGroup = svg.append('g').attr('class', 'labels');

    // Define arrow markers
    const defs = svg.append('defs');

    ['inheritance', 'implementation', 'import', 'usage'].forEach(type => {
      defs.append('marker')
        .attr('id', \`arrow-\${type}\`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('class', 'arrow')
        .attr('fill', type === 'inheritance' ? '#0066cc' : type === 'implementation' ? '#00cc66' : '#666');
    });

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        nodeGroup.attr('transform', event.transform);
        linkGroup.attr('transform', event.transform);
        labelGroup.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Force simulation
    let simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50));

    // Draw links
    const link = linkGroup.selectAll('line')
      .data(graphData.links)
      .join('line')
      .attr('class', 'link')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', d => {
        if (d.type === 'implementation') return '5,5';
        if (d.type === 'usage') return '2,2';
        return 'none';
      })
      .attr('stroke', d => {
        if (d.type === 'inheritance') return '#0066cc';
        if (d.type === 'implementation') return '#00cc66';
        if (d.type === 'import') return '#666';
        return '#999';
      })
      .attr('marker-end', d => \`url(#arrow-\${d.type})\`);

    // Draw nodes
    const node = nodeGroup.selectAll('circle')
      .data(graphData.nodes)
      .join('circle')
      .attr('class', 'node')
      .attr('r', d => d.hasViolation ? 12 : 10)
      .attr('fill', d => {
        if (d.hasViolation) return '#ff6b6b';
        if (d.type === 'class') return '#4a90e2';
        if (d.type === 'interface') return '#7ed321';
        if (d.type === 'function') return '#f5a623';
        return '#999';
      })
      .attr('stroke', d => d.hasViolation ? '#cc0000' : '#fff')
      .call(d3.drag()
        .on('start', dragStarted)
        .on('drag', dragged)
        .on('end', dragEnded))
      .on('mouseover', showTooltip)
      .on('mouseout', hideTooltip)
      .on('click', highlightConnections);

    // Draw labels
    const label = labelGroup.selectAll('text')
      .data(graphData.nodes)
      .join('text')
      .attr('class', 'node-label')
      .text(d => d.name)
      .attr('font-size', '12px')
      .attr('dy', 25);

    // Update positions on simulation tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      label
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Drag functions
    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      if (!d3.select('#physics').property('checked')) {
        d.fx = null;
        d.fy = null;
      }
    }

    // Tooltip functions
    const tooltip = d3.select('#tooltip');

    function showTooltip(event, d) {
      const dependencyCount = graphData.links.filter(l => l.source.id === d.id).length;
      const dependentCount = graphData.links.filter(l => l.target.id === d.id).length;

      tooltip
        .html(\`
          <div class="tooltip-title">\${d.name}</div>
          <div class="tooltip-row">
            <span class="tooltip-label">Type:</span>
            <span>\${d.type}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Module:</span>
            <span>\${d.module}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Dependencies:</span>
            <span>\${dependencyCount}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">Dependents:</span>
            <span>\${dependentCount}</span>
          </div>
          \${d.hasViolation ? '<div style="margin-top: 8px; color: #ff6b6b;">⚠ Has violations</div>' : ''}
        \`)
        .style('left', (event.pageX + 10) + 'px')
        .style('top', (event.pageY - 10) + 'px')
        .classed('visible', true);
    }

    function hideTooltip() {
      tooltip.classed('visible', false);
    }

    // Highlight connected nodes
    function highlightConnections(event, d) {
      const connectedNodes = new Set();
      connectedNodes.add(d.id);

      graphData.links.forEach(l => {
        if (l.source.id === d.id) connectedNodes.add(l.target.id);
        if (l.target.id === d.id) connectedNodes.add(l.source.id);
      });

      node.classed('highlighted', n => connectedNodes.has(n.id));
      link.classed('highlighted', l => l.source.id === d.id || l.target.id === d.id);
    }

    // Controls
    d3.select('#physics').on('change', function() {
      if (this.checked) {
        simulation.alphaTarget(0.3).restart();
      } else {
        simulation.stop();
      }
    });

    d3.select('#charge').on('input', function() {
      simulation.force('charge').strength(+this.value);
      simulation.alpha(0.3).restart();
    });

    d3.select('#distance').on('input', function() {
      simulation.force('link').distance(+this.value);
      simulation.alpha(0.3).restart();
    });

    d3.select('#filter').on('change', function() {
      const filterValue = this.value;
      node.style('display', d => {
        if (filterValue === 'all') return 'block';
        if (filterValue === 'violations') return d.hasViolation ? 'block' : 'none';
        return d.type === filterValue ? 'block' : 'none';
      });
      label.style('display', d => {
        if (filterValue === 'all') return 'block';
        if (filterValue === 'violations') return d.hasViolation ? 'block' : 'none';
        return d.type === filterValue ? 'block' : 'none';
      });
    });

    d3.select('#reset').on('click', () => {
      graphData.nodes.forEach(d => {
        d.fx = null;
        d.fy = null;
      });
      simulation.alpha(1).restart();
    });

    d3.select('#fitView').on('click', () => {
      const bounds = nodeGroup.node().getBBox();
      const fullWidth = width;
      const fullHeight = height;
      const widthScale = fullWidth / bounds.width;
      const heightScale = fullHeight / bounds.height;
      const scale = Math.min(widthScale, heightScale) * 0.9;
      const translate = [
        fullWidth / 2 - scale * (bounds.x + bounds.width / 2),
        fullHeight / 2 - scale * (bounds.y + bounds.height / 2)
      ];

      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    });

    // Stop simulation if physics is disabled
    if (!${this.options.enablePhysics}) {
      simulation.stop();
    }
  </script>
</body>
</html>`;
  }

  /**
   * Prepare graph data in D3-compatible format
   */
  private prepareGraphData(graph: DependencyGraph): {
    nodes: any[];
    links: any[];
  } {
    const violationFiles = new Set(this.options.violations.map((v) => v.filePath));
    const violationNames = new Set(
      this.options.violations.map((v) => {
        // Extract class name from violation message
        const match = v.message.match(/class\s+(\w+)/i);
        return match ? match[1] : null;
      })
    );

    const nodes = graph.getNodes().map((node) => ({
      id: node.id,
      name: node.name,
      type: node.type,
      module: node.module,
      filePath: node.filePath,
      hasViolation: violationFiles.has(node.filePath) || violationNames.has(node.name),
      metadata: node.metadata,
    }));

    const links = graph.getEdges().map((edge) => ({
      source: edge.from,
      target: edge.to,
      type: edge.type,
    }));

    return { nodes, links };
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}
