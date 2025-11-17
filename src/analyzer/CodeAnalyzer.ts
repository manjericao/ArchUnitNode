import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';
import { TypeScriptParser } from '../parser/TypeScriptParser';
import { TSModule, Dependency } from '../types';
import { TSClasses } from '../core/TSClasses';
import { TSClass } from '../core/TSClass';

/**
 * Analyzes TypeScript/JavaScript codebases
 */
export class CodeAnalyzer {
  private parser: TypeScriptParser;
  private modules: Map<string, TSModule>;
  private dependencies: Dependency[];

  constructor() {
    this.parser = new TypeScriptParser();
    this.modules = new Map();
    this.dependencies = [];
  }

  /**
   * Analyze files matching a pattern
   */
  public async analyze(
    basePath: string,
    patterns: string[] = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
  ): Promise<TSClasses> {
    const files = await this.findFiles(basePath, patterns);
    const classes: TSClass[] = [];

    // Parse files in parallel for better performance
    const parseResults = await Promise.allSettled(
      files.map(async (file) => {
        try {
          const module = this.parser.parseFile(file);
          return { file, module, error: null };
        } catch (error) {
          return { file, module: null, error };
        }
      })
    );

    // Process successful parses
    for (const result of parseResults) {
      if (result.status === 'fulfilled' && result.value.module) {
        const { file, module } = result.value;
        this.modules.set(file, module);

        // Convert parsed classes to TSClass instances
        // Pass module imports to each class for dependency tracking
        for (const classData of module.classes) {
          const classWithImports = {
            ...classData,
            imports: module.imports,
          };
          classes.push(new TSClass(classWithImports));
        }

        // Analyze dependencies
        this.analyzeDependencies(module);
      } else if (result.status === 'fulfilled' && result.value.error) {
        console.warn(`Warning: Failed to parse file ${result.value.file}:`, result.value.error);
      } else if (result.status === 'rejected') {
        console.warn(`Warning: Failed to process file:`, result.reason);
      }
    }

    return new TSClasses(classes);
  }

  /**
   * Find files matching patterns (parallel glob execution)
   */
  private async findFiles(basePath: string, patterns: string[]): Promise<string[]> {
    const allFiles: Set<string> = new Set();

    // Execute all glob patterns in parallel
    const globResults = await Promise.all(
      patterns.map((pattern) =>
        glob(pattern, {
          cwd: basePath,
          absolute: true,
          ignore: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/*.d.ts'],
        })
      )
    );

    // Merge all results
    for (const files of globResults) {
      files.forEach((file) => allFiles.add(file));
    }

    return Array.from(allFiles);
  }

  /**
   * Analyze dependencies in a module
   */
  private analyzeDependencies(module: TSModule): void {
    for (const importDecl of module.imports) {
      this.dependencies.push({
        from: module.filePath,
        to: importDecl.source,
        type: 'import',
        location: importDecl.location,
      });
    }

    for (const cls of module.classes) {
      if (cls.extends) {
        this.dependencies.push({
          from: cls.filePath,
          to: cls.extends,
          type: 'inheritance',
          location: cls.location,
        });
      }

      for (const impl of cls.implements) {
        this.dependencies.push({
          from: cls.filePath,
          to: impl,
          type: 'implementation',
          location: cls.location,
        });
      }
    }
  }

  /**
   * Get all dependencies
   */
  public getDependencies(): Dependency[] {
    return this.dependencies;
  }

  /**
   * Get all modules
   */
  public getModules(): Map<string, TSModule> {
    return this.modules;
  }

  /**
   * Check for cyclic dependencies
   */
  public findCyclicDependencies(): string[][] {
    const graph = this.buildDependencyGraph();
    const cycles: string[][] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[]): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          const cycleStart = path.indexOf(neighbor);
          if (cycleStart !== -1) {
            cycles.push([...path.slice(cycleStart), neighbor]);
          }
        }
      }

      recursionStack.delete(node);
    };

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        dfs(node, []);
      }
    }

    return cycles;
  }

  /**
   * Build dependency graph
   */
  private buildDependencyGraph(): Map<string, Set<string>> {
    const graph = new Map<string, Set<string>>();

    for (const dep of this.dependencies) {
      if (!graph.has(dep.from)) {
        graph.set(dep.from, new Set());
      }
      graph.get(dep.from)!.add(dep.to);
    }

    return graph;
  }
}
