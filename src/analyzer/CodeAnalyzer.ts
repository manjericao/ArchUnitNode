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
 * Analyzes TypeScript/JavaScript codebases to extract class information,
 * dependencies, and architectural structure.
 *
 * @example
 * ```typescript
 * const analyzer = new CodeAnalyzer({ enableCache: true });
 * const classes = await analyzer.analyze('./src');
 * ```
 *
 * @example
 * // With error handling
 * ```typescript
 * const result = await analyzer.analyzeWithErrors('./src');
 * console.log(`Analyzed ${result.filesProcessed} files`);
 * console.log(`Errors: ${result.errors.length}`);
 * ```
 */
/**
 * Incremental analysis state for tracking changes
 */
interface IncrementalState {
  /** Timestamp of last analysis */
  lastAnalysisTime: number;
  /** Set of file paths analyzed in the last run */
  analyzedFiles: Set<string>;
  /** Last analysis result */
  lastResult: AnalysisResult;
}

export class CodeAnalyzer {
  private parser: TypeScriptParser;
  private modules: Map<string, TSModule>;
  private dependencies: Dependency[];
  private cache: CacheManager;
  private enableCache: boolean;
  private incrementalState: IncrementalState | null = null;

  /**
   * Creates a new CodeAnalyzer instance
   *
   * @param options Configuration options
   * @param options.enableCache Enable caching of parsed ASTs (default: true)
   * @param options.cache Custom cache manager instance (default: global cache)
   *
   * @example
   * ```typescript
   * // With caching enabled (default)
   * const analyzer = new CodeAnalyzer();
   *
   * // With custom cache
   * const customCache = new CacheManager({ maxCacheSize: 500 });
   * const analyzer = new CodeAnalyzer({ cache: customCache });
   *
   * // With caching disabled
   * const analyzer = new CodeAnalyzer({ enableCache: false });
   * ```
   */
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

    // Security errors - check first for specificity
    if (errorMessage.includes('path traversal') || errorMessage.includes('null byte')) {
      return 'security';
    }

    // IO errors
    if (
      errorMessage.includes('enoent') ||
      errorMessage.includes('eacces') ||
      errorMessage.includes('not exist') ||
      errorMessage.includes('no such file')
    ) {
      return 'io';
    }

    // Parse errors - check for various syntax error indicators
    if (
      errorMessage.includes('parse') ||
      errorMessage.includes('parsing') ||
      errorMessage.includes('syntax') ||
      errorMessage.includes('unexpected') ||
      errorMessage.includes('expected') ||
      errorMessage.includes('token') ||
      errorMessage.includes('declaration') ||
      errorMessage.includes('expression') ||
      errorMessage.includes('invalid character') ||
      // TypeScript ESLint parser specific errors
      (error instanceof Error && error.constructor.name.includes('Parser'))
    ) {
      return 'parse';
    }

    return 'unknown';
  }

  /**
   * Analyze files matching a pattern (legacy method for backward compatibility).
   * Logs errors to console but does not throw. Use analyzeWithErrors() for detailed error information.
   *
   * @param basePath Base directory to start analysis from
   * @param patterns Glob patterns for files to analyze (default: TypeScript and JavaScript files)
   * @returns Collection of analyzed classes
   *
   * @example
   * ```typescript
   * const analyzer = new CodeAnalyzer();
   * const classes = await analyzer.analyze('./src');
   *
   * // With custom patterns
   * const tsOnly = await analyzer.analyze('./src', ['** /*.ts']);
   * ```
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
   * Analyze files matching a pattern and return detailed error information.
   * This method provides graceful error handling by continuing analysis even when
   * individual files fail to parse, and returns comprehensive error details.
   *
   * @param basePath Base directory to start analysis from
   * @param patterns Glob patterns for files to analyze (default: TypeScript and JavaScript files)
   * @returns Analysis result containing classes, errors, and statistics
   *
   * @remarks
   * Error types:
   * - `parse`: Syntax errors in TypeScript/JavaScript files
   * - `security`: Path traversal attempts or other security violations
   * - `io`: File system errors (ENOENT, EACCES, etc.)
   * - `unknown`: Unclassified errors
   *
   * @example
   * ```typescript
   * const analyzer = new CodeAnalyzer();
   * const result = await analyzer.analyzeWithErrors('./src');
   *
   * console.log(`Successfully analyzed ${result.filesProcessed} files`);
   * console.log(`Skipped ${result.filesSkipped} files due to errors`);
   *
   * // Handle errors by type
   * const securityErrors = result.errors.filter(e => e.errorType === 'security');
   * const parseErrors = result.errors.filter(e => e.errorType === 'parse');
   *
   * // Use the successfully analyzed classes
   * const classes = result.classes;
   * ```
   *
   * @example
   * @example
   * // Analyzing specific file types
   * ```typescript
   * const result = await analyzer.analyzeWithErrors('./src', [
   *   '** /*.ts',
   *   '!** /*.test.ts', // Exclude test files
   *   '!** /node_modules/** '
   * ]);
   * ```
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
   * Perform incremental analysis by only processing changed, added, or deleted files.
   * This method is optimized for watch mode and repeated analysis scenarios.
   *
   * On the first call, performs a full analysis. On subsequent calls:
   * - Detects new files and processes them
   * - Detects deleted files and removes them from results
   * - Detects modified files (via cache hash validation) and re-processes them
   * - Reuses cached results for unchanged files
   *
   * @param basePath Base directory to start analysis from
   * @param patterns Glob patterns for files to analyze (default: TypeScript and JavaScript files)
   * @returns Analysis result with incremental statistics
   *
   * @example
   * ```typescript
   * const analyzer = new CodeAnalyzer({ enableCache: true });
   *
   * // First call - full analysis
   * const result1 = await analyzer.analyzeIncremental('./src');
   * console.log(`Initial: ${result1.filesProcessed} files`);
   *
   * // Second call - only processes changes
   * const result2 = await analyzer.analyzeIncremental('./src');
   * console.log(`Incremental: ${result2.filesProcessed} files processed`);
   * ```
   */
  public async analyzeIncremental(
    basePath: string,
    patterns: string[] = ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx']
  ): Promise<AnalysisResult> {
    const currentFiles = await this.findFiles(basePath, patterns);
    const currentFileSet = new Set(currentFiles);

    // If this is the first run, do a full analysis
    if (!this.incrementalState) {
      const result = await this.analyzeWithErrors(basePath, patterns);
      this.incrementalState = {
        lastAnalysisTime: Date.now(),
        analyzedFiles: currentFileSet,
        lastResult: result,
      };
      return result;
    }

    // Detect changes
    const previousFiles = this.incrementalState.analyzedFiles;
    const addedFiles: string[] = [];
    const deletedFiles: string[] = [];
    const potentiallyChangedFiles: string[] = [];

    // Find added and potentially changed files
    for (const file of currentFiles) {
      if (!previousFiles.has(file)) {
        addedFiles.push(file);
      } else {
        // File exists in both - might have changed
        potentiallyChangedFiles.push(file);
      }
    }

    // Find deleted files
    for (const file of previousFiles) {
      if (!currentFileSet.has(file)) {
        deletedFiles.push(file);
      }
    }

    // If nothing changed, return cached result
    if (addedFiles.length === 0 && deletedFiles.length === 0) {
      // Still need to check if any files were modified
      // The cache will handle this automatically - if file hash changed, cache returns null
      let hasChanges = false;
      for (const file of potentiallyChangedFiles) {
        if (this.enableCache && this.cache.getAST(file) === null) {
          hasChanges = true;
          break;
        }
      }

      if (!hasChanges) {
        // No changes at all - return cached result
        return this.incrementalState.lastResult;
      }
    }

    // Process only changed/new files
    const filesToProcess = [...addedFiles, ...potentiallyChangedFiles];
    const classes: TSClass[] = [];
    const errors: ParseError[] = [];

    // Parse changed files
    const parseResults = await Promise.allSettled(
      filesToProcess.map(async (file) => {
        try {
          let module: TSModule | null = null;

          // Check cache first
          if (this.enableCache) {
            module = this.cache.getAST(file);
          }

          // If cache miss (new or modified file), parse it
          if (!module) {
            module = this.parser.parseFile(file);
            if (this.enableCache && module) {
              this.cache.setAST(file, module);
            }
            return { file, module, error: null, wasProcessed: true };
          }

          // Cache hit - file unchanged
          return { file, module, error: null, wasProcessed: false };
        } catch (error) {
          return { file, module: null, error, wasProcessed: true };
        }
      })
    );

    // Track processed files
    let actuallyProcessed = 0;

    // Process parse results
    for (const result of parseResults) {
      if (result.status === 'fulfilled' && result.value.module) {
        const { file, module, wasProcessed } = result.value;

        if (wasProcessed) {
          actuallyProcessed++;
        }

        this.modules.set(file, module);

        for (const classData of module.classes) {
          const classWithImports = {
            ...classData,
            imports: module.imports,
          };
          classes.push(new TSClass(classWithImports));
        }

        this.analyzeDependencies(module);
      } else if (result.status === 'fulfilled' && result.value.error) {
        actuallyProcessed++;
        const err =
          result.value.error instanceof Error
            ? result.value.error
            : new Error(String(result.value.error));

        errors.push({
          file: result.value.file,
          error: err,
          errorType: this.categorizeError(err),
        });
      }
    }

    // Merge with previous unchanged classes
    const deletedFileSet = new Set(deletedFiles);
    const processedFileSet = new Set(filesToProcess);

    // Get classes from previous analysis that weren't deleted or re-processed
    const previousClasses = this.incrementalState.lastResult.classes.getAll().filter((cls) => {
      return !deletedFileSet.has(cls.filePath) && !processedFileSet.has(cls.filePath);
    });

    const allClasses = [...classes, ...previousClasses];

    const result: AnalysisResult = {
      classes: new TSClasses(allClasses),
      errors,
      filesProcessed: actuallyProcessed,
      filesSkipped: errors.length,
    };

    // Update incremental state
    this.incrementalState = {
      lastAnalysisTime: Date.now(),
      analyzedFiles: currentFileSet,
      lastResult: result,
    };

    return result;
  }

  /**
   * Reset incremental analysis state, forcing a full re-analysis on next call
   */
  public resetIncrementalState(): void {
    this.incrementalState = null;
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
  public getCacheStats(): {
    astCache: { size: number; hits: number; misses: number; hitRate: number };
    moduleCache: { size: number; hits: number; misses: number; hitRate: number };
    ruleCache: { size: number; hits: number; misses: number; hitRate: number };
  } {
    return this.cache.getStats();
  }

  /**
   * Enable or disable caching
   */
  public setCacheEnabled(enabled: boolean): void {
    this.enableCache = enabled;
  }
}
