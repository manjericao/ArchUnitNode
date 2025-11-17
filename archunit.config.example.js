/**
 * Example ArchUnit-TS configuration file
 *
 * Place this file as `archunit.config.js` in your project root
 * to customize default behavior
 */

module.exports = {
  /**
   * Base path for analysis
   * @default './src'
   */
  basePath: './src',

  /**
   * File patterns to analyze
   * @default ['**\/*.ts', '**\/*.tsx', '**\/*.js', '**\/*.jsx']
   */
  patterns: [
    '**/*.ts',
    '**/*.tsx',
    '!**/*.test.ts',
    '!**/*.spec.ts',
    '!**/*.d.ts',
  ],

  /**
   * Paths to ignore
   * @default ['node_modules', 'dist', 'build', 'coverage']
   */
  ignore: [
    'node_modules',
    'dist',
    'build',
    'coverage',
    'test',
    'tests',
  ],

  /**
   * Custom architecture patterns
   */
  patterns: {
    /**
     * Define common package patterns for your project
     */
    controllers: 'controllers/**',
    services: 'services/**',
    repositories: 'repositories/**',
    models: 'models/**',
    entities: 'domain/entities/**',
    infrastructure: 'infrastructure/**',
  },

  /**
   * Predefined rules that will be checked
   * Set to false to disable, or provide custom configuration
   */
  rules: {
    // Enforce naming conventions
    namingConventions: {
      enabled: true,
      rules: [
        {
          pattern: 'controllers/**',
          suffix: 'Controller',
        },
        {
          pattern: 'services/**',
          suffix: 'Service',
        },
        {
          pattern: 'repositories/**',
          suffix: 'Repository',
        },
      ],
    },

    // Enforce layer dependencies
    layerDependencies: {
      enabled: true,
      layers: {
        controllers: {
          mayOnlyAccessLayers: ['services', 'models'],
        },
        services: {
          mayOnlyAccessLayers: ['repositories', 'models'],
        },
        repositories: {
          mayOnlyAccessLayers: ['models'],
        },
        models: {
          mayNotAccessLayers: ['controllers', 'services', 'repositories'],
        },
      },
    },

    // Enforce decorator usage
    decorators: {
      enabled: false,
      rules: [
        {
          pattern: 'controllers/**',
          decorator: 'Controller',
        },
        {
          pattern: 'services/**',
          decorator: 'Injectable',
        },
      ],
    },

    // Detect circular dependencies
    circularDependencies: {
      enabled: true,
      maxDepth: 10,
    },
  },

  /**
   * Reporting configuration
   */
  reporting: {
    // Output format: 'console' | 'json' | 'html'
    format: 'console',

    // Output file for json/html reports
    outputFile: './architecture-violations.json',

    // Show violation source code context
    showContext: true,

    // Number of context lines to show
    contextLines: 3,

    // Fail on any violation
    failOnViolation: true,

    // Verbose output
    verbose: false,
  },

  /**
   * Performance configuration
   */
  performance: {
    // Enable caching
    cache: true,

    // Cache directory
    cacheDir: '.archunit-cache',

    // Parallel processing
    parallel: true,

    // Max workers for parallel processing
    maxWorkers: 4,
  },

  /**
   * TypeScript configuration
   */
  typescript: {
    // Path to tsconfig.json
    configPath: './tsconfig.json',

    // Skip type checking
    skipTypeCheck: false,
  },
};
