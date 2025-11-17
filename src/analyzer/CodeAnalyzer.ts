import { glob } from 'glob';
import { TypeScriptParser } from '../parser/TypeScriptParser';
import { TSModule, Dependency } from '../types';
import { TSClasses } from '../core/TSClasses';
import { TSClass } from '../core/TSClass';
import { CacheManager, getGlobalCache } from '../cache/CacheManager';

/**
 * Error information for failed file parsing
 */
export interface ParseError {
  file: string;
  error: Error;
  errorType: 'parse' | 'security' | 'io' | 'unknown';
}

/**
 * Result of code analysis including classes and any errors encountered
 */
export interface AnalysisResult {
  classes: TSClasses;
  errors: ParseError[];
  filesProcessed: number;
  filesSkipped: number;
}

/**
 * Analyzes TypeScript/JavaScript codebases
 */
export class CodeAnalyzer {
  private parser: TypeScriptParser;
  private modules: Map<string, TSModule>;
  private dependencies: Dependency[];
  private cache: CacheManager;
  private enableCache: boolean;

  constructor(options: { enableCache?: boolean; cache?: CacheManager } = {}) {
    this.parser = new TypeScriptParser();
    this.modules = new Map();
    this.dependencies = [];
    this.enableCache = options.enableCache !== false; // Default to true
    this.cache = options.cache || getGlobalCache();
  }

  /**
   * Categorize an error by type
   */
  private categorizeError(error: unknown): 'parse' | 'security' | 'io' | 'unknown' {
    const errorMessage =
      error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    if (errorMessage.includes('path traversal') || errorMessage.includes('null byte')) {
      return 'security';
    } else if (
      errorMessage.includes('parse') ||
      errorMessage.includes('syntax') ||
      errorMessage.includes('unexpected')
    ) {
      return 'parse';
    } else if (
      errorMessage.includes('enoent') ||
      errorMessage.includes('eacces') ||
      errorMessage.includes('not exist')
    ) {
      return 'io';
    }
    return 'unknown';
  }

  /**
   * Analyze files matching a pattern (legacy method for backward compatibility)
   */
  public async analyze(
    basePath: string,
    patterns: string[] = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
  ): Promise<TSClasses> {
    const result = await this.analyzeWithErrors(basePath, patterns);

    // Log errors to console for backward compatibility
    if (result.errors.length > 0) {
      console.warn(`Warning: ${result.errors.length} file(s) failed to parse`);
      for (const err of result.errors) {
        console.warn(`  - ${err.file}: ${err.error.message} [${err.errorType}]`);
      }
    }

    return result.classes;
  }

  /**
   * Analyze files matching a pattern and return detailed error information
   */
  public async analyzeWithErrors(
    basePath: string,
    patterns: string[] = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
  ): Promise<AnalysisResult> {
    const files = await this.findFiles(basePath, patterns);
    const classes: TSClass[] = [];
    const errors: ParseError[] = [];

    // Parse files in parallel for better performance, using cache
    const parseResults = await Promise.allSettled(
      files.map(async (file) => {
        try {
          // Try to get from cache first
          let module: TSModule | null = null;

          if (this.enableCache) {
            module = this.cache.getAST(file);
          }

          // If not in cache, parse the file
          if (!module) {
            module = this.parser.parseFile(file);

            // Cache the parsed AST
            if (this.enableCache && module) {
              this.cache.setAST(file, module);
            }
          }

          return { file, module, error: null };
        } catch (error) {
          return { file, module: null, error };
        }
      })
    );

    // Process results
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
        // Categorize and store error
        const err =
          result.value.error instanceof Error
            ? result.value.error
            : new Error(String(result.value.error));

        errors.push({
          file: result.value.file,
          error: err,
          errorType: this.categorizeError(err),
        });
      } else if (result.status === 'rejected') {
        // Promise rejection
        const err =
          result.reason instanceof Error ? result.reason : new Error(String(result.reason));

        errors.push({
          file: 'unknown',
          error: err,
          errorType: this.categorizeError(err),
        });
      }
    }

    return {
      classes: new TSClasses(classes),
      errors,
      filesProcessed: files.length - errors.length,
      filesSkipped: errors.length,
    };
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

  /**
   * Clear all caches
   */
  public clearCache(): void {
    this.cache.clearAll();
  }

  /**
   * Get cache statistics
   */
  public getCacheStats() {
    return this.cache.getStats();
  }

  /**
   * Enable or disable caching
   */
  public setCacheEnabled(enabled: boolean): void {
    this.enableCache = enabled;
  }
}
