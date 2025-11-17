import * as fs from 'fs';
import * as path from 'path';
import { StaticArchRule } from '../lang/ArchRuleDefinition';
import { ArchRuleDefinition } from '../lang/ArchRuleDefinition';

/**
 * Detected framework information
 */
export interface DetectedFramework {
  /** Framework name */
  name: string;
  /** Framework version (if available) */
  version?: string;
  /** Confidence level (0-1) */
  confidence: number;
  /** Detection method */
  detectedBy: 'packageJson' | 'filePattern' | 'codePattern';
}

/**
 * Framework-specific rule suggestion
 */
export interface RuleSuggestion {
  /** Framework this rule applies to */
  framework: string;
  /** Rule category */
  category: 'layering' | 'naming' | 'dependency' | 'organization';
  /** Human-readable description */
  description: string;
  /** The actual rule */
  rule: StaticArchRule;
  /** Priority level */
  priority: 'high' | 'medium' | 'low';
}

/**
 * Framework detection result
 */
export interface FrameworkDetectionResult {
  /** List of detected frameworks */
  frameworks: DetectedFramework[];
  /** Suggested architectural rules */
  suggestedRules: RuleSuggestion[];
  /** Project root path */
  projectRoot: string;
}

/**
 * Detects frameworks and suggests relevant architectural rules
 */
export class FrameworkDetector {
  private projectRoot: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Detect frameworks used in the project
   */
  public async detect(): Promise<FrameworkDetectionResult> {
    const frameworks: DetectedFramework[] = [];
    const suggestedRules: RuleSuggestion[] = [];

    // Detect from package.json
    const packageJsonFrameworks = await this.detectFromPackageJson();
    frameworks.push(...packageJsonFrameworks);

    // Detect from file patterns
    const filePatternFrameworks = await this.detectFromFilePatterns();
    frameworks.push(...filePatternFrameworks);

    // Generate suggested rules based on detected frameworks
    for (const framework of frameworks) {
      const rules = this.generateRulesForFramework(framework);
      suggestedRules.push(...rules);
    }

    return {
      frameworks,
      suggestedRules,
      projectRoot: this.projectRoot,
    };
  }

  /**
   * Detect frameworks from package.json dependencies
   */
  private async detectFromPackageJson(): Promise<DetectedFramework[]> {
    const frameworks: DetectedFramework[] = [];
    const packageJsonPath = path.join(this.projectRoot, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
      return frameworks;
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // React
      if (allDeps['react']) {
        frameworks.push({
          name: 'React',
          version: allDeps['react'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }

      // Next.js
      if (allDeps['next']) {
        frameworks.push({
          name: 'Next.js',
          version: allDeps['next'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }

      // Nest.js
      if (allDeps['@nestjs/core']) {
        frameworks.push({
          name: 'Nest.js',
          version: allDeps['@nestjs/core'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }

      // Express
      if (allDeps['express']) {
        frameworks.push({
          name: 'Express',
          version: allDeps['express'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }

      // Angular
      if (allDeps['@angular/core']) {
        frameworks.push({
          name: 'Angular',
          version: allDeps['@angular/core'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }

      // Vue
      if (allDeps['vue']) {
        frameworks.push({
          name: 'Vue',
          version: allDeps['vue'],
          confidence: 1.0,
          detectedBy: 'packageJson',
        });
      }
    } catch (error) {
      // Ignore errors reading package.json
    }

    return frameworks;
  }

  /**
   * Detect frameworks from file patterns
   */
  private async detectFromFilePatterns(): Promise<DetectedFramework[]> {
    const frameworks: DetectedFramework[] = [];

    // Next.js specific files
    if (
      fs.existsSync(path.join(this.projectRoot, 'next.config.js')) ||
      fs.existsSync(path.join(this.projectRoot, 'next.config.mjs'))
    ) {
      frameworks.push({
        name: 'Next.js',
        confidence: 0.9,
        detectedBy: 'filePattern',
      });
    }

    // Nest.js specific files
    if (fs.existsSync(path.join(this.projectRoot, 'nest-cli.json'))) {
      frameworks.push({
        name: 'Nest.js',
        confidence: 0.9,
        detectedBy: 'filePattern',
      });
    }

    // Angular specific files
    if (fs.existsSync(path.join(this.projectRoot, 'angular.json'))) {
      frameworks.push({
        name: 'Angular',
        confidence: 0.9,
        detectedBy: 'filePattern',
      });
    }

    return frameworks;
  }

  /**
   * Generate architectural rules for a detected framework
   */
  private generateRulesForFramework(framework: DetectedFramework): RuleSuggestion[] {
    const rules: RuleSuggestion[] = [];

    switch (framework.name) {
      case 'React':
        rules.push(
          {
            framework: 'React',
            category: 'naming',
            description:
              'React components should have names ending with Component or be in PascalCase',
            rule: ArchRuleDefinition.classes()
              .that()
              .resideInPackage('components')
              .should()
              .haveSimpleNameMatching(/^[A-Z][a-zA-Z0-9]*$/),
            priority: 'medium',
          },
          {
            framework: 'React',
            category: 'organization',
            description: 'React hooks should reside in hooks directory',
            rule: ArchRuleDefinition.classes()
              .that()
              .haveSimpleNameStartingWith('use')
              .should()
              .resideInPackage('hooks'),
            priority: 'low',
          }
        );
        break;

      case 'Next.js':
        rules.push(
          {
            framework: 'Next.js',
            category: 'organization',
            description: 'Next.js pages should reside in pages or app directory',
            rule: ArchRuleDefinition.classes()
              .that()
              .resideInAnyPackage('pages', 'app')
              .should()
              .notDependOnClassesThat()
              .resideInPackage('components'),
            priority: 'high',
          },
          {
            framework: 'Next.js',
            category: 'dependency',
            description: 'API routes should not depend on client components',
            rule: ArchRuleDefinition.classes()
              .that()
              .resideInPackage('api')
              .should()
              .notDependOnClassesThat()
              .resideInPackage('components'),
            priority: 'high',
          }
        );
        break;

      case 'Nest.js':
        rules.push(
          {
            framework: 'Nest.js',
            category: 'naming',
            description: 'Controllers should have names ending with Controller',
            rule: ArchRuleDefinition.classes()
              .that()
              .areAnnotatedWith('Controller')
              .should()
              .haveSimpleNameEndingWith('Controller'),
            priority: 'high',
          },
          {
            framework: 'Nest.js',
            category: 'naming',
            description: 'Services should have names ending with Service',
            rule: ArchRuleDefinition.classes()
              .that()
              .areAnnotatedWith('Injectable')
              .should()
              .haveSimpleNameEndingWith('Service'),
            priority: 'high',
          },
          {
            framework: 'Nest.js',
            category: 'layering',
            description: 'Controllers should only depend on services, not repositories',
            rule: ArchRuleDefinition.classes()
              .that()
              .haveSimpleNameEndingWith('Controller')
              .should()
              .notDependOnClassesThat()
              .resideInPackage('repositories'),
            priority: 'high',
          },
          {
            framework: 'Nest.js',
            category: 'organization',
            description: 'Modules should reside in their own directories',
            rule: ArchRuleDefinition.classes()
              .that()
              .areAnnotatedWith('Module')
              .should()
              .haveSimpleNameEndingWith('Module'),
            priority: 'medium',
          }
        );
        break;

      case 'Express':
        rules.push(
          {
            framework: 'Express',
            category: 'layering',
            description: 'Controllers should not depend on database models directly',
            rule: ArchRuleDefinition.classes()
              .that()
              .resideInPackage('controllers')
              .should()
              .notDependOnClassesThat()
              .resideInPackage('models'),
            priority: 'high',
          },
          {
            framework: 'Express',
            category: 'organization',
            description: 'Routes should be organized in routes directory',
            rule: ArchRuleDefinition.classes()
              .that()
              .resideInPackage('routes')
              .should()
              .notDependOnClassesThat()
              .resideInPackage('models'),
            priority: 'medium',
          }
        );
        break;

      case 'Angular':
        rules.push(
          {
            framework: 'Angular',
            category: 'naming',
            description: 'Components should have names ending with Component',
            rule: ArchRuleDefinition.classes()
              .that()
              .areAnnotatedWith('Component')
              .should()
              .haveSimpleNameEndingWith('Component'),
            priority: 'high',
          },
          {
            framework: 'Angular',
            category: 'naming',
            description: 'Services should have names ending with Service',
            rule: ArchRuleDefinition.classes()
              .that()
              .areAnnotatedWith('Injectable')
              .should()
              .haveSimpleNameEndingWith('Service'),
            priority: 'high',
          }
        );
        break;
    }

    return rules;
  }

  /**
   * Get a human-readable report of detected frameworks and suggestions
   */
  public static formatReport(result: FrameworkDetectionResult): string {
    const lines: string[] = [];

    lines.push('Framework Detection Report');
    lines.push('='.repeat(50));
    lines.push('');

    if (result.frameworks.length === 0) {
      lines.push('No frameworks detected.');
      return lines.join('\n');
    }

    lines.push(`Detected Frameworks (${result.frameworks.length}):`);
    for (const framework of result.frameworks) {
      const versionStr = framework.version ? ` v${framework.version}` : '';
      const confidenceStr = `${(framework.confidence * 100).toFixed(0)}%`;
      lines.push(
        `  - ${framework.name}${versionStr} (confidence: ${confidenceStr}, detected by: ${framework.detectedBy})`
      );
    }

    lines.push('');
    lines.push(`Suggested Rules (${result.suggestedRules.length}):`);
    lines.push('');

    const byFramework = new Map<string, RuleSuggestion[]>();
    for (const rule of result.suggestedRules) {
      if (!byFramework.has(rule.framework)) {
        byFramework.set(rule.framework, []);
      }
      byFramework.get(rule.framework)!.push(rule);
    }

    for (const [framework, rules] of byFramework) {
      lines.push(`${framework}:`);
      for (const rule of rules) {
        const priorityIcon =
          rule.priority === 'high' ? '⚠️ ' : rule.priority === 'medium' ? '📌 ' : '💡 ';
        lines.push(`  ${priorityIcon}[${rule.category}] ${rule.description}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }
}
