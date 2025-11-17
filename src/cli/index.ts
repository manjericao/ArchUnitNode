#!/usr/bin/env node

/**
 * ArchUnit-TS Command Line Interface
 */

import * as path from 'path';
import { createArchUnit } from '../index';
import { createDefaultConfig } from '../config/ConfigLoader';
import { formatViolations, formatSummary } from '../utils/ViolationFormatter';

interface CLIOptions {
  config?: string;
  basePath?: string;
  patterns?: string[];
  noColor?: boolean;
  noContext?: boolean;
  verbose?: boolean;
  typescript?: boolean;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { command: string; options: CLIOptions } {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const options: CLIOptions = {};

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--config':
      case '-c':
        options.config = next;
        i++;
        break;
      case '--base-path':
      case '-b':
        options.basePath = next;
        i++;
        break;
      case '--pattern':
      case '-p':
        options.patterns = options.patterns || [];
        options.patterns.push(next);
        i++;
        break;
      case '--no-color':
        options.noColor = true;
        break;
      case '--no-context':
        options.noContext = true;
        break;
      case '--verbose':
      case '-v':
        options.verbose = true;
        break;
      case '--typescript':
      case '--ts':
        options.typescript = true;
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return { command, options };
}

/**
 * Show help message
 */
function showHelp(): void {
  console.log(`
ArchUnit-TS - Architecture Testing for TypeScript/JavaScript

Usage:
  archunit <command> [options]

Commands:
  check        Check architecture rules from config file
  validate     Alias for 'check'
  init         Create a default configuration file
  help         Show this help message

Options:
  --config, -c <path>     Path to configuration file (default: archunit.config.js)
  --base-path, -b <path>  Base path for code analysis
  --pattern, -p <pattern> File patterns to include (can be used multiple times)
  --no-color              Disable colored output
  --no-context            Disable code context in violations
  --typescript, --ts      Generate TypeScript config (for init command)
  --verbose, -v           Show verbose output

Examples:
  # Check rules using default config
  archunit check

  # Check with custom config
  archunit check --config ./custom-archunit.config.js

  # Initialize a new config file
  archunit init

  # Initialize a TypeScript config file
  archunit init --typescript

  # Check with custom patterns
  archunit check --pattern "src/**/*.ts" --pattern "lib/**/*.ts"
`);
}

/**
 * Run the check command
 */
async function runCheck(options: CLIOptions): Promise<void> {
  try {
    if (options.verbose) {
      console.log('Loading configuration...');
    }

    const archUnit = createArchUnit();
    const violations = await archUnit.checkConfig(options.config);

    // Format and display violations
    const formatted = formatViolations(violations, {
      colors: !options.noColor,
      showContext: !options.noContext,
      relativePaths: true,
      contextLines: 2,
    });

    console.log(formatted);

    // Show summary
    const summary = formatSummary(violations, {
      colors: !options.noColor,
      relativePaths: true,
    });

    console.log(summary);

    // Exit with error code if there are violations
    if (violations.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

/**
 * Run the init command
 */
async function runInit(options: CLIOptions): Promise<void> {
  try {
    const isTypeScript = options.typescript || false;
    const configPath = createDefaultConfig(undefined, isTypeScript);

    console.log(`✓ Created configuration file: ${path.relative(process.cwd(), configPath)}`);
    console.log('\nNext steps:');
    console.log('  1. Edit the configuration file to define your architecture rules');
    console.log('  2. Run: archunit check');
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Main entry point
 */
async function main(): Promise<void> {
  const { command, options } = parseArgs();

  switch (command) {
    case 'check':
    case 'validate':
      await runCheck(options);
      break;
    case 'init':
      await runInit(options);
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`Unknown command: ${command}`);
      console.error('Run "archunit help" for usage information');
      process.exit(1);
  }
}

// Run CLI
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
