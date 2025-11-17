import * as path from 'path';
import * as fs from 'fs';
import { ArchRule } from '../core/ArchRule';
import { ArchitectureViolation } from '../types';

/**
 * Configuration for architecture rules
 */
export interface ArchUnitConfig {
  /**
   * Base path for code analysis
   */
  basePath?: string;

  /**
   * File patterns to include (glob patterns)
   */
  patterns?: string[];

  /**
   * Rules to check
   */
  rules: ArchRule[];

  /**
   * Whether to fail on any violation
   */
  failOnViolation?: boolean;

  /**
   * Custom error reporter
   */
  onViolation?: (violations: ArchitectureViolation[]) => void;
}

/**
 * Configuration loader for ArchUnit
 */
export class ConfigLoader {
  /**
   * Load configuration from a file
   */
  public static async loadConfig(configPath?: string): Promise<ArchUnitConfig> {
    const resolvedPath = this.resolveConfigPath(configPath);

    if (!resolvedPath) {
      throw new Error(
        'No configuration file found. Please create archunit.config.js or archunit.config.ts'
      );
    }

    // For TypeScript configs, we need to handle both compiled and source files
    if (resolvedPath.endsWith('.ts')) {
      return this.loadTypeScriptConfig(resolvedPath);
    }

    // For JavaScript configs, we can require directly
    return this.loadJavaScriptConfig(resolvedPath);
  }

  /**
   * Resolve the configuration file path
   */
  private static resolveConfigPath(configPath?: string): string | null {
    if (configPath) {
      const resolved = path.resolve(process.cwd(), configPath);
      if (fs.existsSync(resolved)) {
        return resolved;
      }
      throw new Error(`Configuration file not found: ${configPath}`);
    }

    // Look for default config files
    const possiblePaths = [
      path.join(process.cwd(), 'archunit.config.js'),
      path.join(process.cwd(), 'archunit.config.ts'),
      path.join(process.cwd(), '.archunit', 'config.js'),
      path.join(process.cwd(), '.archunit', 'config.ts'),
    ];

    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }

    return null;
  }

  /**
   * Load JavaScript configuration file
   */
  private static async loadJavaScriptConfig(configPath: string): Promise<ArchUnitConfig> {
    try {
      // Use dynamic import for ESM compatibility
      const configModule = await import(configPath);
      const config = configModule.default || configModule;

      // If the config is a function, call it
      if (typeof config === 'function') {
        return await config();
      }

      return config;
    } catch (error) {
      throw new Error(
        `Failed to load configuration from ${configPath}: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load TypeScript configuration file
   */
  private static async loadTypeScriptConfig(configPath: string): Promise<ArchUnitConfig> {
    try {
      // Try to use ts-node or tsx if available
      // Otherwise, require the compiled version
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let config: any;

      try {
        // Try dynamic import first (works with tsx/ts-node)
        const configModule = await import(configPath);
        config = configModule.default || configModule;
      } catch (importError) {
        // Fall back to dynamic import for CommonJS
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const req = typeof require !== 'undefined' ? require : null;
        if (!req) {
          throw new Error('Cannot load TypeScript config: require is not available');
        }
        delete req.cache[req.resolve(configPath)];
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const configModule = req(configPath);
        config = configModule.default || configModule;
      }

      // If the config is a function, call it
      if (typeof config === 'function') {
        return await config();
      }

      return config;
    } catch (error) {
      throw new Error(
        `Failed to load TypeScript configuration from ${configPath}: ${error instanceof Error ? error.message : String(error)}\n` +
          'Make sure you have ts-node or tsx installed, or compile your config to JavaScript first.'
      );
    }
  }

  /**
   * Validate configuration
   */
  public static validateConfig(config: ArchUnitConfig): void {
    if (!config.rules || !Array.isArray(config.rules) || config.rules.length === 0) {
      throw new Error('Configuration must include at least one rule');
    }

    for (const rule of config.rules) {
      if (!rule || typeof rule.check !== 'function') {
        throw new Error(
          'Invalid rule in configuration: rules must implement the ArchRule interface'
        );
      }
    }
  }

  /**
   * Create a default configuration file
   */
  public static createDefaultConfig(outputPath?: string, typescript = false): string {
    const fileName = typescript ? 'archunit.config.ts' : 'archunit.config.js';
    const targetPath = outputPath || path.join(process.cwd(), fileName);

    const template = typescript ? this.getTypeScriptTemplate() : this.getJavaScriptTemplate();

    fs.writeFileSync(targetPath, template, 'utf-8');
    return targetPath;
  }

  /**
   * Get JavaScript template
   */
  private static getJavaScriptTemplate(): string {
    return `/**
 * ArchUnit-TS Configuration
 * Define your architecture rules here
 */
const { ArchRuleDefinition, layeredArchitecture } = require('archunit-ts');

module.exports = {
  // Base path for code analysis
  basePath: './src',

  // File patterns to include
  patterns: ['**/*.ts', '**/*.js'],

  // Architecture rules
  rules: [
    // Example: Classes in 'controllers' should not depend on 'database'
    ArchRuleDefinition.classes()
      .that()
      .resideInPackage('controllers')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('database'),

    // Example: Layered architecture
    layeredArchitecture()
      .layer('Controllers').definedBy('controllers')
      .layer('Services').definedBy('services')
      .layer('Repositories').definedBy('repositories')
      .whereLayer('Controllers').mayOnlyAccessLayers('Services')
      .whereLayer('Services').mayOnlyAccessLayers('Repositories'),
  ],

  // Fail build on any violation
  failOnViolation: true,

  // Custom violation handler (optional)
  onViolation: (violations) => {
    console.error(\`Found \${violations.length} architecture violation(s)\`);
    for (const violation of violations) {
      console.error(\`  - \${violation.message}\`);
    }
  },
};
`;
  }

  /**
   * Get TypeScript template
   */
  private static getTypeScriptTemplate(): string {
    return `/**
 * ArchUnit-TS Configuration
 * Define your architecture rules here
 */
import { ArchUnitConfig, ArchRuleDefinition, layeredArchitecture } from 'archunit-ts';

const config: ArchUnitConfig = {
  // Base path for code analysis
  basePath: './src',

  // File patterns to include
  patterns: ['**/*.ts', '**/*.js'],

  // Architecture rules
  rules: [
    // Example: Classes in 'controllers' should not depend on 'database'
    ArchRuleDefinition.classes()
      .that()
      .resideInPackage('controllers')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('database'),

    // Example: Layered architecture
    layeredArchitecture()
      .layer('Controllers').definedBy('controllers')
      .layer('Services').definedBy('services')
      .layer('Repositories').definedBy('repositories')
      .whereLayer('Controllers').mayOnlyAccessLayers('Services')
      .whereLayer('Services').mayOnlyAccessLayers('Repositories'),
  ],

  // Fail build on any violation
  failOnViolation: true,

  // Custom violation handler (optional)
  onViolation: (violations) => {
    console.error(\`Found \${violations.length} architecture violation(s)\`);
    for (const violation of violations) {
      console.error(\`  - \${violation.message}\`);
    }
  },
};

export default config;
`;
  }
}

/**
 * Load configuration from file
 */
export async function loadConfig(configPath?: string): Promise<ArchUnitConfig> {
  return ConfigLoader.loadConfig(configPath);
}

/**
 * Create a default configuration file
 */
export function createDefaultConfig(outputPath?: string, typescript = false): string {
  return ConfigLoader.createDefaultConfig(outputPath, typescript);
}
