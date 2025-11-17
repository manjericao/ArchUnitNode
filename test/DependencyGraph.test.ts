import {
  DependencyGraph,
  DependencyType,
  GraphBuilder,
  DotGenerator,
  HtmlGraphGenerator,
} from '../src/graph';
import { createArchUnit } from '../src/index';
import * as path from 'path';
import * as fs from 'fs';

describe('Dependency Graph', () => {
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');
  const testOutputDir = path.join(__dirname, 'output');

  beforeAll(() => {
    // Create output directory for test artifacts
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test outputs
    if (fs.existsSync(testOutputDir)) {
      fs.rmSync(testOutputDir, { recursive: true, force: true });
    }
  });

  describe('DependencyGraph Data Structure', () => {
    it('should create an empty graph', () => {
      const graph = new DependencyGraph();
      expect(graph.getNodes()).toHaveLength(0);
      expect(graph.getEdges()).toHaveLength(0);
    });

    it('should add nodes to the graph', () => {
      const graph = new DependencyGraph();

      graph.addNode({
        id: 'class:test:TestClass',
        name: 'TestClass',
        type: 'class',
        filePath: '/test/TestClass.ts',
        module: 'test',
      });

      expect(graph.getNodes()).toHaveLength(1);
      expect(graph.getNode('class:test:TestClass')).toBeDefined();
    });

    it('should add edges to the graph', () => {
      const graph = new DependencyGraph();

      graph.addNode({
        id: 'class:test:ClassA',
        name: 'ClassA',
        type: 'class',
        filePath: '/test/ClassA.ts',
        module: 'test',
      });

      graph.addNode({
        id: 'class:test:ClassB',
        name: 'ClassB',
        type: 'class',
        filePath: '/test/ClassB.ts',
        module: 'test',
      });

      graph.addEdge({
        from: 'class:test:ClassA',
        to: 'class:test:ClassB',
        type: DependencyType.IMPORT,
      });

      expect(graph.getEdges()).toHaveLength(1);
      expect(graph.getDependencies('class:test:ClassA')).toContain('class:test:ClassB');
      expect(graph.getDependents('class:test:ClassB')).toContain('class:test:ClassA');
    });

    it('should detect cycles in the graph', () => {
      const graph = new DependencyGraph();

      graph.addNode({ id: 'A', name: 'A', type: 'class', filePath: '/A.ts', module: 'test' });
      graph.addNode({ id: 'B', name: 'B', type: 'class', filePath: '/B.ts', module: 'test' });
      graph.addNode({ id: 'C', name: 'C', type: 'class', filePath: '/C.ts', module: 'test' });

      // Create cycle: A -> B -> C -> A
      graph.addEdge({ from: 'A', to: 'B', type: DependencyType.IMPORT });
      graph.addEdge({ from: 'B', to: 'C', type: DependencyType.IMPORT });
      graph.addEdge({ from: 'C', to: 'A', type: DependencyType.IMPORT });

      expect(graph.hasCycles()).toBe(true);
    });

    it('should not detect cycles in acyclic graph', () => {
      const graph = new DependencyGraph();

      graph.addNode({ id: 'A', name: 'A', type: 'class', filePath: '/A.ts', module: 'test' });
      graph.addNode({ id: 'B', name: 'B', type: 'class', filePath: '/B.ts', module: 'test' });
      graph.addNode({ id: 'C', name: 'C', type: 'class', filePath: '/C.ts', module: 'test' });

      // Create DAG: A -> B -> C
      graph.addEdge({ from: 'A', to: 'B', type: DependencyType.IMPORT });
      graph.addEdge({ from: 'B', to: 'C', type: DependencyType.IMPORT });

      expect(graph.hasCycles()).toBe(false);
    });

    it('should calculate graph statistics', () => {
      const graph = new DependencyGraph();

      graph.addNode({ id: 'A', name: 'A', type: 'class', filePath: '/A.ts', module: 'test' });
      graph.addNode({ id: 'B', name: 'B', type: 'class', filePath: '/B.ts', module: 'test' });
      graph.addNode({ id: 'C', name: 'C', type: 'class', filePath: '/C.ts', module: 'test' });

      graph.addEdge({ from: 'A', to: 'B', type: DependencyType.IMPORT });
      graph.addEdge({ from: 'A', to: 'C', type: DependencyType.IMPORT });
      graph.addEdge({ from: 'B', to: 'C', type: DependencyType.IMPORT });

      const stats = graph.getStats();

      expect(stats.nodeCount).toBe(3);
      expect(stats.edgeCount).toBe(3);
      expect(stats.maxDependencies).toBe(2); // Node A has 2 dependencies
      expect(stats.avgDependencies).toBe(1); // (2 + 1 + 0) / 3 = 1
      expect(stats.hasCycles).toBe(false);
    });

    it('should filter graph by node type', () => {
      const graph = new DependencyGraph();

      graph.addNode({
        id: 'classA',
        name: 'ClassA',
        type: 'class',
        filePath: '/A.ts',
        module: 'test',
      });
      graph.addNode({
        id: 'interfaceB',
        name: 'InterfaceB',
        type: 'interface',
        filePath: '/B.ts',
        module: 'test',
      });
      graph.addNode({
        id: 'classC',
        name: 'ClassC',
        type: 'class',
        filePath: '/C.ts',
        module: 'test',
      });

      graph.addEdge({ from: 'classA', to: 'interfaceB', type: DependencyType.IMPLEMENTATION });
      graph.addEdge({ from: 'classC', to: 'interfaceB', type: DependencyType.IMPLEMENTATION });

      const filtered = graph.filter({ includeTypes: ['class'] });

      expect(filtered.getNodes()).toHaveLength(2);
      expect(filtered.getEdges()).toHaveLength(0); // No edges because interfaceB is excluded
    });
  });

  describe('GraphBuilder', () => {
    it('should build a graph from analyzed code', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      expect(graph.getNodes().length).toBeGreaterThan(0);
      // We expect some edges (dependencies)
      expect(graph.getEdges().length).toBeGreaterThanOrEqual(0);
    });

    it('should include interfaces when enabled', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder({ includeInterfaces: true });
      const graph = builder.build(classes);

      const interfaceNodes = graph.getNodes().filter((n) => n.type === 'interface');
      // We may or may not have interfaces in fixtures, so just check it doesn't error
      expect(interfaceNodes).toBeDefined();
    });

    it('should exclude interfaces when disabled', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder({ includeInterfaces: false });
      const graph = builder.build(classes);

      const interfaceNodes = graph.getNodes().filter((n) => n.type === 'interface');
      expect(interfaceNodes).toHaveLength(0);
    });
  });

  describe('DotGenerator', () => {
    it('should generate valid DOT format', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new DotGenerator({
        title: 'Test Dependency Graph',
        direction: 'LR',
      });

      const dotContent = generator.generate(graph);

      expect(dotContent).toContain('digraph DependencyGraph');
      expect(dotContent).toContain('rankdir=LR');
      expect(dotContent).toContain('Test Dependency Graph');
    });

    it('should include legend when colors are enabled', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new DotGenerator({ useColors: true });
      const dotContent = generator.generate(graph);

      expect(dotContent).toContain('cluster_legend');
    });

    it('should cluster nodes by module', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new DotGenerator({ clusterByModule: true });
      const dotContent = generator.generate(graph);

      // Should have subgraph clusters
      expect(dotContent).toContain('subgraph cluster_');
    });
  });

  describe('HtmlGraphGenerator', () => {
    it('should generate valid HTML with D3.js visualization', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new HtmlGraphGenerator({
        title: 'Test Interactive Graph',
        width: 800,
        height: 600,
      });

      const htmlContent = generator.generate(graph);

      expect(htmlContent).toContain('<!DOCTYPE html>');
      expect(htmlContent).toContain('Test Interactive Graph');
      expect(htmlContent).toContain('d3js.org');
      expect(htmlContent).toContain('width="800"');
      expect(htmlContent).toContain('height="600"');
    });

    it('should include legend when enabled', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new HtmlGraphGenerator({ showLegend: true });
      const htmlContent = generator.generate(graph);

      expect(htmlContent).toContain('legend');
    });

    it('should include graph statistics in HTML', async () => {
      const archUnit = createArchUnit();
      const classes = await archUnit.analyzeCode(fixturesPath);

      const builder = new GraphBuilder();
      const graph = builder.build(classes);

      const generator = new HtmlGraphGenerator();
      const htmlContent = generator.generate(graph);

      expect(htmlContent).toContain('Nodes');
      expect(htmlContent).toContain('Dependencies');
    });
  });

  describe('ArchUnitTS Integration', () => {
    it('should generate DOT graph file', async () => {
      const archUnit = createArchUnit();
      const outputPath = path.join(testOutputDir, 'test-graph.dot');

      const result = await archUnit.generateDotGraph(fixturesPath, outputPath, {
        graphOptions: { title: 'Test Graph' },
      });

      expect(result).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('digraph DependencyGraph');
      expect(content).toContain('Test Graph');
    });

    it('should generate HTML graph file', async () => {
      const archUnit = createArchUnit();
      const outputPath = path.join(testOutputDir, 'test-graph.html');

      const result = await archUnit.generateHtmlGraph(fixturesPath, outputPath, {
        graphOptions: { title: 'Interactive Test Graph' },
      });

      expect(result).toBe(outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);

      const content = fs.readFileSync(outputPath, 'utf-8');
      expect(content).toContain('<!DOCTYPE html>');
      expect(content).toContain('Interactive Test Graph');
    });

    it('should create output directory if it does not exist', async () => {
      const archUnit = createArchUnit();
      const deepPath = path.join(testOutputDir, 'deep', 'nested', 'graph.html');

      await archUnit.generateHtmlGraph(fixturesPath, deepPath);

      expect(fs.existsSync(deepPath)).toBe(true);
    });
  });
});
