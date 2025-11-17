#!/usr/bin/env node

/**
 * ArchUnit-TS Command Line Interface
 */

import * as path from 'path';
import { createArchUnit, createReportManager, ReportFormat, Severity } from '../index';
import { createDefaultConfig, loadConfig } from '../config/ConfigLoader';
import { formatViolations, formatSummary } from '../utils/ViolationFormatter';
import { WatchMode } from './WatchMode';

interface CLIOptions {
  config?: string;
  basePath?: string;
  patterns?: string[];
  noColor?: boolean;
  noContext?: boolean;
  verbose?: boolean;
  typescript?: boolean;
  format?: string;
  output?: string;
  reportTitle?: string;
  graphType?: string;
  graphTitle?: string;
  direction?: string;
  includeInterfaces?: boolean;
  width?: number;
  height?: number;
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
      case '--format':
      case '-f':
        options.format = next;
        i++;
        break;
      case '--output':
      case '-o':
        options.output = next;
        i++;
        break;
      case '--report-title':
        options.reportTitle = next;
        i++;
        break;
      case '--graph-type':
      case '-g':
        options.graphType = next;
        i++;
        break;
      case '--graph-title':
        options.graphTitle = next;
        i++;
        break;
      case '--direction':
        options.direction = next;
        i++;
        break;
      case '--include-interfaces':
        options.includeInterfaces = true;
        break;
      case '--width':
        options.width = parseInt(next, 10);
        i++;
        break;
      case '--height':
        options.height = parseInt(next, 10);
        i++;
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
  watch        Watch files and run checks on changes
  graph        Generate dependency graph visualization
  init         Create a default configuration file
  help         Show this help message

Options:
  --config, -c <path>         Path to configuration file (default: archunit.config.js)
  --base-path, -b <path>      Base path for code analysis
  --pattern, -p <pattern>     File patterns to include (can be used multiple times)
  --format, -f <format>       Generate report (html, json, junit, markdown)
  --output, -o <path>         Output path for generated report
  --report-title <title>      Title for the generated report
  --graph-type, -g <type>     Graph output format (dot, html) - for graph command
  --graph-title <title>       Title for the generated graph
  --direction <dir>           Graph direction (LR, TB, RL, BT) - for DOT graphs
  --include-interfaces        Include interfaces in dependency graph
  --width <pixels>            Graph width (for HTML graphs, default: 1200)
  --height <pixels>           Graph height (for HTML graphs, default: 800)
  --no-color                  Disable colored output
  --no-context                Disable code context in violations
  --typescript, --ts          Generate TypeScript config (for init command)
  --verbose, -v               Show verbose output

Examples:
  # Check rules using default config
  archunit check

  # Check with custom config
  archunit check --config ./custom-archunit.config.js

  # Generate HTML report
  archunit check --format html --output ./reports/archunit-report.html

  # Generate multiple reports
  archunit check --format json --output ./reports/report.json

  # Generate JUnit XML for CI/CD
  archunit check --format junit --output ./test-results/archunit.xml

  # Initialize a new config file
  archunit init

  # Initialize a TypeScript config file
  archunit init --typescript

  # Check with custom patterns
  archunit check --pattern "src/**/*.ts" --pattern "lib/**/*.ts"

  # Watch for file changes (automatic re-check)
  archunit watch

  # Watch with custom config
  archunit watch --config ./custom-archunit.config.js

  # Generate interactive HTML dependency graph
  archunit graph --graph-type html --output ./docs/dependencies.html

  # Generate Graphviz DOT file
  archunit graph --graph-type dot --output ./docs/dependencies.dot

  # Generate graph with custom options
  archunit graph --graph-type html --output ./graph.html --graph-title "My Project Dependencies" --include-interfaces
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

    // Generate report if requested
    if (options.format && options.output) {
      await generateReport(violations, options);
    }

    // Separate errors from warnings
    const errors = violations.filter((v) => v.severity === Severity.ERROR);
    const warnings = violations.filter((v) => v.severity === Severity.WARNING);

    // Show severity summary
    if (warnings.length > 0 && errors.length === 0) {
      const warningColor = options.noColor ? '' : '\x1b[33m';
      const resetColor = options.noColor ? '' : '\x1b[0m';
      console.log(
        `\n${warningColor}⚠${resetColor} Found ${warnings.length} warning(s), but no errors. Build continues.`
      );
    }

    // Exit with error code only if there are errors
    if (errors.length > 0) {
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
 * Generate report from violations
 */
async function generateReport(violations: any[], options: CLIOptions): Promise<void> {
  const reportManager = createReportManager();
  const formatMap: Record<string, ReportFormat> = {
    html: ReportFormat.HTML,
    json: ReportFormat.JSON,
    junit: ReportFormat.JUNIT,
    markdown: ReportFormat.MARKDOWN,
    md: ReportFormat.MARKDOWN,
    xml: ReportFormat.JUNIT,
  };

  const format = formatMap[options.format!.toLowerCase()];
  if (!format) {
    console.error(
      `Invalid report format: ${options.format}. Supported formats: html, json, junit, markdown`
    );
    process.exit(1);
  }

  try {
    const outputPath = await reportManager.generateReport(violations, {
      format,
      outputPath: options.output!,
      title: options.reportTitle || 'ArchUnit Architecture Report',
      includeTimestamp: true,
      includeStats: true,
    });

    console.log(`\n✓ Report generated: ${path.relative(process.cwd(), outputPath)}`);
  } catch (error) {
    console.error(
      'Failed to generate report:',
      error instanceof Error ? error.message : String(error)
    );
    if (options.verbose && error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }
}

/**
 * Run the watch command
 */
async function runWatch(options: CLIOptions): Promise<void> {
  try {
    if (options.verbose) {
      console.log('Loading configuration...');
    }

    // Load config
    const config = await loadConfig(options.config);
    const basePath = options.basePath || process.cwd();

    // Create and start watch mode
    const watchMode = new WatchMode({
      basePath,
      config,
      patterns: options.patterns,
      noColor: options.noColor,
      noContext: options.noContext,
      verbose: options.verbose,
    });

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      await watchMode.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await watchMode.stop();
      process.exit(0);
    });

    // Start watching
    await watchMode.start();
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
 * Run the graph command
 */
async function runGraph(options: CLIOptions): Promise<void> {
  try {
    if (options.verbose) {
      console.log('Generating dependency graph...');
    }

    const basePath = options.basePath || process.cwd();
    const graphType = options.graphType || 'html';
    const output = options.output || `./dependency-graph.${graphType}`;

    if (!['dot', 'html'].includes(graphType)) {
      console.error(`Invalid graph type: ${graphType}. Supported types: dot, html`);
      process.exit(1);
    }

    const archUnit = createArchUnit();

    let outputPath: string;
    if (graphType === 'html') {
      outputPath = await archUnit.generateHtmlGraph(basePath, output, {
        patterns: options.patterns,
        graphOptions: {
          title: options.graphTitle || 'Dependency Graph',
          width: options.width || 1200,
          height: options.height || 800,
          showLegend: true,
          enablePhysics: true,
        },
        builderOptions: {
          includeInterfaces: options.includeInterfaces ?? true,
          includeFunctions: false,
          includeModules: false,
        },
      });
    } else {
      outputPath = await archUnit.generateDotGraph(basePath, output, {
        patterns: options.patterns,
        graphOptions: {
          title: options.graphTitle || 'Dependency Graph',
          direction: (options.direction as 'LR' | 'TB' | 'RL' | 'BT') || 'TB',
          showMetadata: true,
          useColors: !options.noColor,
          clusterByModule: true,
        },
        builderOptions: {
          includeInterfaces: options.includeInterfaces ?? true,
          includeFunctions: false,
          includeModules: false,
        },
      });
    }

    console.log(
      `✓ Generated ${graphType.toUpperCase()} dependency graph: ${path.relative(process.cwd(), outputPath)}`
    );

    if (graphType === 'dot') {
      console.log('\nTo visualize the DOT file:');
      console.log(`  dot -Tpng ${path.relative(process.cwd(), outputPath)} -o graph.png`);
      console.log(`  dot -Tsvg ${path.relative(process.cwd(), outputPath)} -o graph.svg`);
    } else {
      console.log(`\nOpen the HTML file in your browser to view the interactive graph.`);
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
 * Main entry point
 */
async function main(): Promise<void> {
  const { command, options } = parseArgs();

  switch (command) {
    case 'check':
    case 'validate':
      await runCheck(options);
      break;
    case 'watch':
      await runWatch(options);
      break;
    case 'graph':
      await runGraph(options);
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
