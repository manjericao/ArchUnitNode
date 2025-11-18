import { ArchitectureViolation } from '../types';

/**
 * Suggested fix for a violation
 */
export interface SuggestedFix {
  /** Human-readable description of the fix */
  description: string;

  /** Whether this fix can be automated */
  autoFixable: boolean;

  /** Expected pattern or structure */
  expectedPattern?: string;

  /** Code action for IDE integration (future) */
  codeAction?: string;
}

/**
 * Engine for generating intelligent suggestions and fixes for violations
 *
 * @example
 * ```typescript
 * const engine = new SuggestionEngine();
 * const fix = engine.generateFix(violation);
 * console.log(fix.description);
 * ```
 */
export class SuggestionEngine {
  /**
   * Generate a suggested fix for a violation
   */
  public generateFix(violation: ArchitectureViolation): SuggestedFix | undefined {
    const message = violation.message;
    const rule = violation.rule;

    // Naming violations
    if (this.isNamingViolation(message, rule)) {
      return this.generateNamingFix(violation);
    }

    // Dependency violations
    if (this.isDependencyViolation(message, rule)) {
      return this.generateDependencyFix(violation);
    }

    // Package/organization violations
    if (this.isOrganizationViolation(message, rule)) {
      return this.generateOrganizationFix(violation);
    }

    // Decorator violations
    if (this.isDecoratorViolation(message, rule)) {
      return this.generateDecoratorFix(violation);
    }

    // Default: Generic fix
    return {
      description: 'Review and update the code to comply with the architecture rule',
      autoFixable: false,
    };
  }

  /**
   * Generate "did you mean?" alternatives
   */
  public generateAlternatives(violation: ArchitectureViolation): string[] {
    const alternatives: string[] = [];

    // Extract class name from message
    const classMatch = violation.message.match(/Class '([^']+)'/);
    if (!classMatch) return alternatives;

    const className = classMatch[1];

    // Naming suggestions
    if (this.isNamingViolation(violation.message, violation.rule)) {
      alternatives.push(...this.generateNamingAlternatives(className, violation.rule));
    }

    // Package suggestions
    if (this.isOrganizationViolation(violation.message, violation.rule)) {
      alternatives.push(...this.generatePackageAlternatives(violation));
    }

    return alternatives;
  }

  /**
   * Check if this is a naming violation
   */
  private isNamingViolation(message: string, rule: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerRule = rule.toLowerCase();

    return (
      lowerMessage.includes('name') ||
      lowerMessage.includes('should end with') ||
      lowerMessage.includes('should start with') ||
      lowerRule.includes('naming')
    );
  }

  /**
   * Check if this is a dependency violation
   */
  private isDependencyViolation(message: string, rule: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerRule = rule.toLowerCase();

    return (
      lowerMessage.includes('depend') ||
      lowerMessage.includes('dependency') ||
      lowerRule.includes('depend')
    );
  }

  /**
   * Check if this is an organization violation
   */
  private isOrganizationViolation(message: string, rule: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerRule = rule.toLowerCase();

    return (
      lowerMessage.includes('package') ||
      lowerMessage.includes('reside') ||
      lowerMessage.includes('directory') ||
      lowerRule.includes('package')
    );
  }

  /**
   * Check if this is a decorator violation
   */
  private isDecoratorViolation(message: string, rule: string): boolean {
    const lowerMessage = message.toLowerCase();
    const lowerRule = rule.toLowerCase();

    return (
      lowerMessage.includes('decorator') ||
      lowerMessage.includes('annotated') ||
      lowerRule.includes('decorator') ||
      lowerRule.includes('annotated')
    );
  }

  /**
   * Generate fix for naming violations
   */
  private generateNamingFix(violation: ArchitectureViolation): SuggestedFix {
    const message = violation.message;

    // Extract expected suffix
    const suffixMatch = message.match(/should end with '([^']+)'/i);
    if (suffixMatch) {
      const expectedSuffix = suffixMatch[1];
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Rename class to end with '${expectedSuffix}' (e.g., '${className}${expectedSuffix}')`,
        autoFixable: true,
        expectedPattern: `*${expectedSuffix}`,
        codeAction: `rename:${className}${expectedSuffix}`,
      };
    }

    // Extract expected prefix
    const prefixMatch = message.match(/should start with '([^']+)'/i);
    if (prefixMatch) {
      const expectedPrefix = prefixMatch[1];
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Rename class to start with '${expectedPrefix}' (e.g., '${expectedPrefix}${className}')`,
        autoFixable: true,
        expectedPattern: `${expectedPrefix}*`,
        codeAction: `rename:${expectedPrefix}${className}`,
      };
    }

    // Extract pattern match
    const patternMatch = message.match(/should match pattern '([^']+)'/i);
    if (patternMatch) {
      return {
        description: `Rename class to match pattern: ${patternMatch[1]}`,
        autoFixable: false,
        expectedPattern: patternMatch[1],
      };
    }

    return {
      description: 'Rename class to follow the naming convention',
      autoFixable: false,
    };
  }

  /**
   * Generate fix for dependency violations
   */
  private generateDependencyFix(violation: ArchitectureViolation): SuggestedFix {
    const message = violation.message;

    // Find what it depends on
    const dependsMatch = message.match(/depends on '([^']+)'/i);
    const shouldNotDependMatch = message.match(/should not depend on.*'([^']+)'/i);

    if (shouldNotDependMatch || dependsMatch) {
      const forbiddenDep = shouldNotDependMatch ? shouldNotDependMatch[1] : dependsMatch![1];

      // Check if it's a controller→repository violation
      if (
        message.toLowerCase().includes('controller') &&
        message.toLowerCase().includes('repository')
      ) {
        return {
          description: `Remove direct dependency on repositories. Inject a service layer instead`,
          autoFixable: false,
          expectedPattern: 'Controller → Service → Repository',
        };
      }

      // Check if it's a domain→infrastructure violation
      if (
        message.toLowerCase().includes('domain') &&
        message.toLowerCase().includes('infrastructure')
      ) {
        return {
          description: `Remove infrastructure dependencies from domain layer. Use dependency inversion (interfaces)`,
          autoFixable: false,
          expectedPattern: 'Domain should depend on abstractions, not concrete infrastructure',
        };
      }

      return {
        description: `Remove dependency on '${forbiddenDep}' or refactor to use an allowed alternative`,
        autoFixable: false,
      };
    }

    return {
      description: 'Refactor dependencies to comply with the layering rules',
      autoFixable: false,
    };
  }

  /**
   * Generate fix for organization violations
   */
  private generateOrganizationFix(violation: ArchitectureViolation): SuggestedFix {
    const message = violation.message;

    // Extract expected package
    const packageMatch = message.match(/should reside in package '([^']+)'/i);
    if (packageMatch) {
      const expectedPackage = packageMatch[1];
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Move ${className} to package '${expectedPackage}'`,
        autoFixable: true,
        expectedPattern: `${expectedPackage}/${className}`,
        codeAction: `move:${expectedPackage}`,
      };
    }

    // Extract multiple possible packages
    const anyPackageMatch = message.match(/should reside in any package \[([^\]]+)\]/i);
    if (anyPackageMatch) {
      const packages = anyPackageMatch[1].split(',').map((p) => p.trim());
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Move ${className} to one of: ${packages.join(', ')}`,
        autoFixable: false,
        expectedPattern: packages[0], // Suggest first option
      };
    }

    return {
      description: 'Move class to the correct package according to the architecture rules',
      autoFixable: false,
    };
  }

  /**
   * Generate fix for decorator violations
   */
  private generateDecoratorFix(violation: ArchitectureViolation): SuggestedFix {
    const message = violation.message;

    // Extract expected decorator
    const decoratorMatch = message.match(/should be annotated with '@([^']+)'/i);
    if (decoratorMatch) {
      const expectedDecorator = decoratorMatch[1];
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Add @${expectedDecorator} decorator to ${className}`,
        autoFixable: true,
        expectedPattern: `@${expectedDecorator}`,
        codeAction: `addDecorator:${expectedDecorator}`,
      };
    }

    const notDecoratedMatch = message.match(/should not be annotated with '@([^']+)'/i);
    if (notDecoratedMatch) {
      const forbiddenDecorator = notDecoratedMatch[1];
      const classMatch = message.match(/Class '([^']+)'/);
      const className = classMatch ? classMatch[1] : 'YourClass';

      return {
        description: `Remove @${forbiddenDecorator} decorator from ${className}`,
        autoFixable: true,
        codeAction: `removeDecorator:${forbiddenDecorator}`,
      };
    }

    return {
      description: 'Update decorator annotations to comply with the architecture rules',
      autoFixable: false,
    };
  }

  /**
   * Generate naming alternatives
   */
  private generateNamingAlternatives(className: string, rule: string): string[] {
    const alternatives: string[] = [];

    // Suggest adding suffix
    const suffixMatch = rule.match(/end with '([^']+)'/i);
    if (suffixMatch && !className.endsWith(suffixMatch[1])) {
      alternatives.push(`${className}${suffixMatch[1]}`);
    }

    // Suggest adding prefix
    const prefixMatch = rule.match(/start with '([^']+)'/i);
    if (prefixMatch && !className.startsWith(prefixMatch[1])) {
      alternatives.push(`${prefixMatch[1]}${className}`);
    }

    // Suggest common patterns
    if (rule.toLowerCase().includes('service')) {
      if (!className.endsWith('Service')) alternatives.push(`${className}Service`);
    }
    if (rule.toLowerCase().includes('controller')) {
      if (!className.endsWith('Controller')) alternatives.push(`${className}Controller`);
    }
    if (rule.toLowerCase().includes('repository')) {
      if (!className.endsWith('Repository')) alternatives.push(`${className}Repository`);
    }

    return alternatives;
  }

  /**
   * Generate package alternatives
   */
  private generatePackageAlternatives(violation: ArchitectureViolation): string[] {
    const alternatives: string[] = [];

    const message = violation.message;

    // Extract current location from file path
    if (violation.filePath) {
      // Suggest moving to common packages
      const commonPackages = [
        'services',
        'controllers',
        'models',
        'repositories',
        'utils',
        'domain',
        'application',
        'infrastructure',
      ];

      for (const pkg of commonPackages) {
        if (!violation.filePath.includes(pkg)) {
          alternatives.push(pkg);
        }
      }
    }

    // Extract package from rule
    const packageMatch = message.match(/package '([^']+)'/i);
    if (packageMatch) {
      alternatives.push(packageMatch[1]);
    }

    return alternatives.slice(0, 3); // Limit to 3 suggestions
  }
}
