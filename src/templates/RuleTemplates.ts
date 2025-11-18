/**
 * Simplified Rule Templates Library
 *
 * Pre-built architecture rules using existing fluent API
 *
 * @module templates/RuleTemplatesSimple
 */

import { ArchRule } from '../core/ArchRule';
import { ArchRuleDefinition } from '../lang/ArchRuleDefinition';

/**
 * Rule Templates - Pre-built architecture rules
 */
export class RuleTemplates {
  // ============================================================================
  // NAMING CONVENTIONS
  // ============================================================================

  /**
   * Services should end with 'Service'
   */
  static serviceNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/services/**')
      .should()
      .haveSimpleNameEndingWith('Service')
      .asError();
  }

  /**
   * Controllers should end with 'Controller'
   */
  static controllerNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/controllers/**')
      .should()
      .haveSimpleNameEndingWith('Controller')
      .asError();
  }

  /**
   * Repositories should end with 'Repository'
   */
  static repositoryNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/repositories/**')
      .should()
      .haveSimpleNameEndingWith('Repository')
      .asError();
  }

  /**
   * DTOs should end with 'DTO' or 'Dto'
   */
  static dtoNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/dto/**')
      .should()
      .haveSimpleNameMatching(/.*Dto$|.*DTO$/)
      .asError();
  }

  /**
   * Validators should end with 'Validator'
   */
  static validatorNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/validators/**')
      .should()
      .haveSimpleNameEndingWith('Validator')
      .asError();
  }

  /**
   * Middleware should end with 'Middleware'
   */
  static middlewareNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/middleware/**')
      .should()
      .haveSimpleNameEndingWith('Middleware')
      .asError();
  }

  /**
   * Guards should end with 'Guard'
   */
  static guardNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/guards/**')
      .should()
      .haveSimpleNameEndingWith('Guard')
      .asError();
  }

  /**
   * Event handlers should end with 'Handler'
   */
  static eventHandlerNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/handlers/**')
      .should()
      .haveSimpleNameEndingWith('Handler')
      .asError();
  }

  /**
   * Factories should end with 'Factory'
   */
  static factoryNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/factories/**')
      .should()
      .haveSimpleNameEndingWith('Factory')
      .asError();
  }

  // ============================================================================
  // DEPENDENCY RULES
  // ============================================================================

  /**
   * Controllers should not depend on repositories directly
   */
  static controllersShouldNotDependOnRepositories(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/controllers/**')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('**/repositories/**')
      .asError();
  }

  /**
   * Get all naming convention rules
   */
  static getAllNamingConventionRules(): ArchRule[] {
    return [
      this.serviceNamingConvention(),
      this.controllerNamingConvention(),
      this.repositoryNamingConvention(),
      this.dtoNamingConvention(),
      this.validatorNamingConvention(),
      this.middlewareNamingConvention(),
      this.guardNamingConvention(),
      this.eventHandlerNamingConvention(),
      this.factoryNamingConvention(),
    ];
  }

  /**
   * Get all dependency rules
   */
  static getAllDependencyRules(): ArchRule[] {
    return [
      this.controllersShouldNotDependOnRepositories(),
    ];
  }

  /**
   * Get all rules
   */
  static getAllRules(): ArchRule[] {
    return [
      ...this.getAllNamingConventionRules(),
      ...this.getAllDependencyRules(),
    ];
  }
}
