import * as chokidar from 'chokidar';
import * as path from 'path';
import { ArchUnitTS } from '../index';
import { ArchUnitConfig } from '../config/ConfigLoader';
import { ArchitectureViolation } from '../types';
import { formatViolations, formatSummary } from '../utils/ViolationFormatter';

export interface WatchOptions {
  basePath: string;
  config: ArchUnitConfig;
  patterns?: string[];
  noColor?: boolean;
  noContext?: boolean;
  verbose?: boolean;
  debounceMs?: number;
}

/**
 * Watch mode for automatic architecture checking on file changes
 */
export class WatchMode {
  private watcher?: chokidar.FSWatcher;
  private archUnit: ArchUnitTS;
  private debounceTimer?: NodeJS.Timeout;
  private isChecking = false;
  private changedFiles = new Set<string>();
  private options: Required<WatchOptions>;

  constructor(options: WatchOptions) {
    this.archUnit = new ArchUnitTS();
    this.options = {
      ...options,
      patterns: options.patterns || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      noColor: options.noColor ?? false,
      noContext: options.noContext ?? false,
      verbose: options.verbose ?? false,
      debounceMs: options.debounceMs ?? 300,
    };
  }

  /**
   * Start watching for file changes
   */
  public async start(): Promise<void> {
    const watchPatterns = this.options.patterns.map((p) => path.join(this.options.basePath, p));

    console.log('\n🔍 Watch mode started...');
    console.log(`📂 Watching: ${this.options.basePath}`);
    console.log(`📝 Patterns: ${this.options.patterns.join(', ')}`);
    console.log('\nWaiting for file changes... (Press Ctrl+C to exit)\n');

    // Run initial check
    await this.runCheck('Initial check');

    // Start watching
    this.watcher = chokidar.watch(watchPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**',
        '**/*.d.ts',
      ],
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 100,
      },
    });

    this.watcher
      .on('add', (filePath) => this.handleFileChange('added', filePath))
      .on('change', (filePath) => this.handleFileChange('changed', filePath))
      .on('unlink', (filePath) => this.handleFileChange('deleted', filePath))
      .on('error', (error) => this.handleError(error));

    // Keep process running
    return new Promise(() => {
      // Process will run until terminated
    });
  }

  /**
   * Stop watching
   */
  public async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = undefined;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    console.log('\n👋 Watch mode stopped\n');
  }

  /**
   * Handle file change events
   */
  private handleFileChange(event: string, filePath: string): void {
    const relativePath = path.relative(process.cwd(), filePath);
    this.changedFiles.add(relativePath);

    if (this.options.verbose) {
      const eventColor = this.getEventColor(event);
      const colorCode = this.options.noColor ? '' : eventColor;
      const resetCode = this.options.noColor ? '' : '\x1b[0m';
      console.log(`${colorCode}[${event}]${resetCode} ${relativePath}`);
    }

    // Debounce to avoid running checks too frequently
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(() => {
      this.runCheck(`Files ${event}`);
    }, this.options.debounceMs);
  }

  /**
   * Get color code for event type
   */
  private getEventColor(event: string): string {
    switch (event) {
      case 'added':
        return '\x1b[32m'; // Green
      case 'changed':
        return '\x1b[33m'; // Yellow
      case 'deleted':
        return '\x1b[31m'; // Red
      default:
        return '\x1b[0m'; // Reset
    }
  }

  /**
   * Run architecture check
   */
  private async runCheck(reason: string): Promise<void> {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;

    try {
      // Clear console
      this.clearConsole();

      // Show header
      const timestamp = new Date().toLocaleTimeString();
      console.log('━'.repeat(80));
      console.log(`🔄 ${reason} - ${timestamp}`);
      console.log('━'.repeat(80));

      if (this.changedFiles.size > 0) {
        console.log(`\n📝 Changed files (${this.changedFiles.size}):`);
        const filesToShow = Array.from(this.changedFiles).slice(0, 10);
        filesToShow.forEach((file) => console.log(`  • ${file}`));
        if (this.changedFiles.size > 10) {
          console.log(`  ... and ${this.changedFiles.size - 10} more`);
        }
        console.log();
        this.changedFiles.clear();
      }

      // Run checks
      const violations = await this.archUnit.checkRules(
        this.options.basePath,
        this.options.config.rules,
        this.options.config.patterns || this.options.patterns
      );

      // Display results
      this.displayResults(violations);
    } catch (error) {
      this.handleError(error);
    } finally {
      this.isChecking = false;
      console.log('\n⏳ Waiting for file changes...\n');
    }
  }

  /**
   * Display check results
   */
  private displayResults(violations: ArchitectureViolation[]): void {
    if (violations.length === 0) {
      const successIcon = this.options.noColor ? '✓' : '\x1b[32m✓\x1b[0m';
      console.log(`\n${successIcon} No architecture violations found!\n`);
      return;
    }

    // Show violations
    const formatted = formatViolations(violations, {
      colors: !this.options.noColor,
      showContext: !this.options.noContext,
      contextLines: 2,
      relativePaths: true,
    });

    console.log(formatted);

    // Show summary
    const summary = formatSummary(violations, {
      colors: !this.options.noColor,
      relativePaths: true,
    });

    console.log(summary);
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): void {
    const errorColor = this.options.noColor ? '' : '\x1b[31m';
    const resetColor = this.options.noColor ? '' : '\x1b[0m';

    console.error(
      `${errorColor}Error:${resetColor}`,
      error instanceof Error ? error.message : String(error)
    );

    if (this.options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Clear console
   */
  private clearConsole(): void {
    if (!this.options.noColor) {
      // ANSI escape codes to clear console
      process.stdout.write('\x1b[2J\x1b[H');
    } else {
      // Just add some newlines if colors are disabled
      console.log('\n'.repeat(2));
    }
  }
}
