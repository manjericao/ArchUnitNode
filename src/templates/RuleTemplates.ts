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
    return [this.controllersShouldNotDependOnRepositories()];
  }

  /**
   * Get all rules
   */
  static getAllRules(): ArchRule[] {
    return [
      ...this.getAllNamingConventionRules(),
      ...this.getAllDependencyRules(),
      ...this.getAllArchitecturalRules(),
      ...this.getAllPatternRules(),
    ];
  }

  // ============================================================================
  // ADDITIONAL NAMING CONVENTIONS
  // ============================================================================

  /**
   * Entities should end with 'Entity'
   */
  static entityNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/entities/**')
      .should()
      .haveSimpleNameEndingWith('Entity')
      .asError();
  }

  /**
   * Value objects should end with 'VO' or 'ValueObject'
   */
  static valueObjectNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/value-objects/**')
      .should()
      .haveSimpleNameMatching(/.*VO$|.*ValueObject$/)
      .asError();
  }

  /**
   * Exceptions should end with 'Exception' or 'Error'
   */
  static exceptionNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/exceptions/**')
      .should()
      .haveSimpleNameMatching(/.*Exception$|.*Error$/)
      .asError();
  }

  /**
   * Interfaces should start with 'I' (configurable pattern)
   */
  static interfaceNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/interfaces/**')
      .should()
      .haveSimpleNameStartingWith('I')
      .asError();
  }

  /**
   * Abstract classes should start with 'Abstract' or 'Base'
   */
  static abstractClassNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .areAbstract()
      .should()
      .haveSimpleNameMatching(/^Abstract.*|^Base.*/)
      .asError();
  }

  /**
   * Test classes should end with 'Test' or 'Spec'
   */
  static testClassNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/test/**')
      .should()
      .haveSimpleNameMatching(/.*Test$|.*Spec$/)
      .asError();
  }

  /**
   * Utility classes should end with 'Utils' or 'Helper'
   */
  static utilityClassNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/utils/**')
      .should()
      .haveSimpleNameMatching(/.*Utils$|.*Helper$/)
      .asError();
  }

  /**
   * Builders should end with 'Builder'
   */
  static builderNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/builders/**')
      .should()
      .haveSimpleNameEndingWith('Builder')
      .asError();
  }

  /**
   * Adapters should end with 'Adapter'
   */
  static adapterNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/adapters/**')
      .should()
      .haveSimpleNameEndingWith('Adapter')
      .asError();
  }

  /**
   * Providers should end with 'Provider'
   */
  static providerNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/providers/**')
      .should()
      .haveSimpleNameEndingWith('Provider')
      .asError();
  }

  // ============================================================================
  // ARCHITECTURAL RULES
  // ============================================================================

  /**
   * Repositories should not depend on services
   */
  static repositoriesShouldNotDependOnServices(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/repositories/**')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('**/services/**')
      .asError();
  }

  /**
   * Services should not depend on controllers
   */
  static servicesShouldNotDependOnControllers(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/services/**')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('**/controllers/**')
      .asError();
  }

  /**
   * Domain models should not depend on infrastructure
   */
  static domainShouldNotDependOnInfrastructure(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/domain/**')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('**/infrastructure/**')
      .asError();
  }

  /**
   * Domain models should not depend on application layer
   */
  static domainShouldNotDependOnApplication(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/domain/**')
      .should()
      .notDependOnClassesThat()
      .resideInPackage('**/application/**')
      .asError();
  }

  /**
   * Get all architectural rules
   */
  static getAllArchitecturalRules(): ArchRule[] {
    return [
      this.repositoriesShouldNotDependOnServices(),
      this.servicesShouldNotDependOnControllers(),
      this.domainShouldNotDependOnInfrastructure(),
      this.domainShouldNotDependOnApplication(),
    ];
  }

  // ============================================================================
  // PATTERN-SPECIFIC RULES
  // ============================================================================

  /**
   * Utility classes should have only private constructors
   */
  static utilityClassesShouldHavePrivateConstructors(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/utils/**')
      .should()
      .haveOnlyPrivateConstructors()
      .asError();
  }

  /**
   * Immutable classes should have only readonly fields
   */
  static immutableClassesShouldHaveReadonlyFields(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/value-objects/**')
      .should()
      .haveOnlyReadonlyFields()
      .asError();
  }

  /**
   * DTOs should have only readonly fields (immutable)
   */
  static dtosShouldBeImmutable(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/dto/**')
      .should()
      .haveOnlyReadonlyFields()
      .asError();
  }

  /**
   * Entities should be annotated with @Entity decorator
   */
  static entitiesShouldBeAnnotated(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/entities/**')
      .should()
      .beAnnotatedWith('Entity')
      .asError();
  }

  /**
   * Services should be annotated with @Injectable or @Service
   */
  static servicesShouldBeAnnotated(): ArchRule {
    return ArchRuleDefinition.anyOf([
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('**/services/**')
        .should()
        .beAnnotatedWith('Injectable'),
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('**/services/**')
        .should()
        .beAnnotatedWith('Service'),
    ]);
  }

  /**
   * Controllers should be annotated with @Controller
   */
  static controllersShouldBeAnnotated(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/controllers/**')
      .should()
      .beAnnotatedWith('Controller')
      .asError();
  }

  /**
   * Repositories should be annotated with @Repository or @Injectable
   */
  static repositoriesShouldBeAnnotated(): ArchRule {
    return ArchRuleDefinition.anyOf([
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('**/repositories/**')
        .should()
        .beAnnotatedWith('Repository'),
      ArchRuleDefinition.classes()
        .that()
        .resideInPackage('**/repositories/**')
        .should()
        .beAnnotatedWith('Injectable'),
    ]);
  }

  /**
   * Value objects should not have public setters (enforce immutability)
   */
  static valueObjectsShouldBeImmutable(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/value-objects/**')
      .should()
      .haveOnlyReadonlyFields()
      .asError();
  }

  /**
   * Interfaces should only be in interfaces package
   */
  static interfacesShouldBeInInterfacesPackage(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .areInterfaces()
      .should()
      .resideInPackage('**/interfaces/**')
      .asWarning();
  }

  /**
   * Abstract classes should be abstract (enforce abstract modifier)
   */
  static abstractClassesShouldBeAbstract(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/^Abstract.*|^Base.*/)
      .should()
      .beAbstract()
      .asError();
  }

  /**
   * Get all pattern-specific rules
   */
  static getAllPatternRules(): ArchRule[] {
    return [
      this.utilityClassesShouldHavePrivateConstructors(),
      this.immutableClassesShouldHaveReadonlyFields(),
      this.dtosShouldBeImmutable(),
      this.entitiesShouldBeAnnotated(),
      this.servicesShouldBeAnnotated(),
      this.controllersShouldBeAnnotated(),
      this.repositoriesShouldBeAnnotated(),
      this.valueObjectsShouldBeImmutable(),
      this.interfacesShouldBeInInterfacesPackage(),
      this.abstractClassesShouldBeAbstract(),
    ];
  }

  /**
   * Get all extended naming convention rules
   */
  static getAllExtendedNamingConventionRules(): ArchRule[] {
    return [
      this.entityNamingConvention(),
      this.valueObjectNamingConvention(),
      this.exceptionNamingConvention(),
      this.interfaceNamingConvention(),
      this.abstractClassNamingConvention(),
      this.testClassNamingConvention(),
      this.utilityClassNamingConvention(),
      this.builderNamingConvention(),
      this.adapterNamingConvention(),
      this.providerNamingConvention(),
    ];
  }
}
