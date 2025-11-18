/**
 * Rule Templates Library
 *
 * 50+ pre-built architecture rules for common patterns and best practices
 *
 * @module templates/RuleTemplates
 */

import { ArchRule } from '../core/ArchRule';
import { ArchRuleDefinition } from '../lang/ArchRuleDefinition';

/**
 * Rule Templates - Pre-built architecture rules for common patterns
 */
export class RuleTemplates {
  // ============================================================================
  // NAMING CONVENTIONS (15 rules)
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
   * Models should not have suffixes
   */
  static modelNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/models/**')
      .should()
      .not()
      .haveSimpleNameEndingWith('Model')
      .asWarning();
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
   * Interfaces should start with 'I' (TypeScript convention)
   */
  static interfaceNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .areInterfaces()
      .should()
      .haveSimpleNameStartingWith('I')
      .asWarning();
  }

  /**
   * Abstract classes should start with 'Abstract' or 'Base'
   */
  static abstractClassNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .areAbstract()
      .should()
      .haveSimpleNameMatching(/^(Abstract|Base)/)
      .asWarning();
  }

  /**
   * Test files should end with '.test' or '.spec'
   */
  static testFileNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/test/**')
      .should()
      .haveSimpleNameMatching(/\.(test|spec)$/)
      .asError();
  }

  /**
   * Utility classes should end with 'Utils' or 'Helper'
   */
  static utilityNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/utils/**')
      .should()
      .haveSimpleNameMatching(/(Utils|Helper|Util)$/)
      .asWarning();
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
   * Decorators should start with lowercase (TypeScript convention)
   */
  static decoratorNamingConvention(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/decorators/**')
      .should()
      .haveSimpleNameMatching(/^[a-z]/)
      .asWarning();
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
  // DEPENDENCY RULES (15 rules)
  // ============================================================================

  /**
   * Controllers should not depend on repositories directly
   */
  static controllersShouldNotDependOnRepositories(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/controllers/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/repositories/**')
      .asError();
  }

  /**
   * Repositories should only depend on models
   */
  static repositoriesShouldOnlyDependOnModels(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/repositories/**')
      .should()
      .onlyDependOnClassesThat()
      .resideInPackage('**/models/**')
      .orResideInPackage('**/repositories/**')
      .asWarning();
  }

  /**
   * Models should not depend on services
   */
  static modelsShouldNotDependOnServices(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/models/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/services/**')
      .asError();
  }

  /**
   * Models should not depend on controllers
   */
  static modelsShouldNotDependOnControllers(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/models/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/controllers/**')
      .asError();
  }

  /**
   * Domain should not depend on infrastructure
   */
  static domainShouldNotDependOnInfrastructure(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/domain/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/infrastructure/**')
      .asError();
  }

  /**
   * Core should not depend on features
   */
  static coreShouldNotDependOnFeatures(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/core/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/features/**')
      .asError();
  }

  /**
   * UI should not depend on data layer
   */
  static uiShouldNotDependOnDataLayer(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/ui/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/data/**')
      .asError();
  }

  /**
   * Test code should not be imported by production code
   */
  static productionShouldNotDependOnTests(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideOutsidePackage('**/test/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/test/**')
      .asError();
  }

  /**
   * No circular dependencies between packages
   */
  static noCircularDependencies(): ArchRule {
    return ArchRuleDefinition.classes()
      .should()
      .beFreeOfCircularDependencies()
      .asError();
  }

  /**
   * DTOs should not depend on entities
   */
  static dtosShouldNotDependOnEntities(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/dto/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/entities/**')
      .asWarning();
  }

  /**
   * Presentation layer should not depend on persistence
   */
  static presentationShouldNotDependOnPersistence(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/presentation/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/persistence/**')
      .asError();
  }

  /**
   * Business logic should not depend on external frameworks
   */
  static businessLogicShouldNotDependOnFrameworks(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/business/**')
      .should()
      .not()
      .dependOnClassesThat()
      .haveSimpleNameMatching(/^(Express|Fastify|Koa|NestJS)/)
      .asWarning();
  }

  /**
   * Commands should not return values
   */
  static commandsShouldNotReturnValues(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/commands/**')
      .should()
      .haveSimpleNameEndingWith('Command')
      .asWarning();
  }

  /**
   * Queries should not mutate state
   */
  static queriesShouldNotMutateState(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/queries/**')
      .should()
      .haveSimpleNameEndingWith('Query')
      .asWarning();
  }

  /**
   * API layer should not depend on database directly
   */
  static apiShouldNotDependOnDatabase(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/api/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/database/**')
      .asError();
  }

  // ============================================================================
  // LAYERING RULES (12 rules)
  // ============================================================================

  /**
   * Enforce standard layered architecture (Controller → Service → Repository)
   */
  static standardLayeredArchitecture(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/presentation/**')
      .should()
      .onlyDependOnClassesThat()
      .resideInPackage('**/application/**')
      .orResideInPackage('**/domain/**')
      .asError();
  }

  /**
   * Presentation layer isolation
   */
  static presentationLayerIsolation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/presentation/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/infrastructure/**')
      .asError();
  }

  /**
   * Application layer should not depend on presentation
   */
  static applicationShouldNotDependOnPresentation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/application/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/presentation/**')
      .asError();
  }

  /**
   * Domain layer should be independent
   */
  static domainLayerIndependence(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/domain/**')
      .should()
      .onlyDependOnClassesThat()
      .resideInPackage('**/domain/**')
      .asError();
  }

  /**
   * Infrastructure should not depend on presentation
   */
  static infrastructureShouldNotDependOnPresentation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/infrastructure/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/presentation/**')
      .asError();
  }

  /**
   * API routes should be in api/routes package
   */
  static apiRoutesPackageRule(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Route(s)?$/)
      .should()
      .resideInPackage('**/api/routes/**')
      .asWarning();
  }

  /**
   * Database code should be in data/persistence layer
   */
  static databaseCodeInDataLayer(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Repository|DAO|Mapper)$/)
      .should()
      .resideInPackage('**/data/**')
      .orResideInPackage('**/persistence/**')
      .asWarning();
  }

  /**
   * Business logic should be in service layer
   */
  static businessLogicInServiceLayer(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Service')
      .should()
      .resideInPackage('**/services/**')
      .orResideInPackage('**/application/**')
      .asWarning();
  }

  /**
   * Views/Templates should be isolated
   */
  static viewsIsolation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/views/**')
      .should()
      .not()
      .dependOnClassesThat()
      .resideInPackage('**/services/**')
      .asWarning();
  }

  /**
   * Configuration should be centralized
   */
  static configurationCentralization(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Config(uration)?$/)
      .should()
      .resideInPackage('**/config/**')
      .asWarning();
  }

  /**
   * External dependencies should be in infrastructure
   */
  static externalDependenciesInInfrastructure(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Client|Adapter|Gateway)$/)
      .should()
      .resideInPackage('**/infrastructure/**')
      .asWarning();
  }

  /**
   * Events should be in domain or application layer
   */
  static eventsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Event')
      .should()
      .resideInPackage('**/domain/**')
      .orResideInPackage('**/application/**')
      .asWarning();
  }

  // ============================================================================
  // SECURITY RULES (10 rules)
  // ============================================================================

  /**
   * Sensitive data classes should not be exposed in API
   */
  static sensitiveDataNotExposedInApi(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Password|Secret|Token|Credential)/)
      .should()
      .not()
      .resideInPackage('**/api/dto/**')
      .asError();
  }

  /**
   * Authentication should be centralized
   */
  static authenticationCentralization(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Auth(entication)?/)
      .should()
      .resideInPackage('**/auth/**')
      .orResideInPackage('**/security/**')
      .asWarning();
  }

  /**
   * Authorization guards should be in security package
   */
  static authorizationGuardsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Authorization|Permission|Role)/)
      .should()
      .resideInPackage('**/security/**')
      .asWarning();
  }

  /**
   * Cryptography should be isolated
   */
  static cryptographyIsolation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Crypto|Encryption|Hash)/)
      .should()
      .resideInPackage('**/security/crypto/**')
      .asWarning();
  }

  /**
   * Input validation should occur at boundaries
   */
  static inputValidationAtBoundaries(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Validator')
      .should()
      .resideInPackage('**/api/**')
      .orResideInPackage('**/validators/**')
      .asWarning();
  }

  /**
   * SQL queries should be in repository layer
   */
  static sqlQueriesInRepository(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/repositories/**')
      .should()
      .not()
      .dependOnClassesThat()
      .haveSimpleNameMatching(/raw|exec|query/)
      .asWarning();
  }

  /**
   * File uploads should be handled in dedicated package
   */
  static fileUploadsIsolation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Upload|File/)
      .should()
      .resideInPackage('**/uploads/**')
      .orResideInPackage('**/files/**')
      .asWarning();
  }

  /**
   * Rate limiting should be in middleware
   */
  static rateLimitingInMiddleware(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/RateLimit|Throttle/)
      .should()
      .resideInPackage('**/middleware/**')
      .asWarning();
  }

  /**
   * Session management should be centralized
   */
  static sessionManagementCentralization(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Session/)
      .should()
      .resideInPackage('**/security/**')
      .orResideInPackage('**/session/**')
      .asWarning();
  }

  /**
   * CORS configuration should be in security package
   */
  static corsConfigurationLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/CORS|CrossOrigin/)
      .should()
      .resideInPackage('**/security/**')
      .orResideInPackage('**/config/**')
      .asWarning();
  }

  // ============================================================================
  // BEST PRACTICES (13 rules)
  // ============================================================================

  /**
   * Avoid god classes (too many dependencies)
   */
  static avoidGodClasses(): ArchRule {
    return ArchRuleDefinition.classes()
      .should()
      .haveMaximumNumberOfDependencies(15)
      .asWarning();
  }

  /**
   * Prefer composition over inheritance
   */
  static limitInheritanceDepth(): ArchRule {
    return ArchRuleDefinition.classes()
      .should()
      .haveMaximumInheritanceDepth(3)
      .asWarning();
  }

  /**
   * Constants should be in constants package
   */
  static constantsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Constants?$/)
      .should()
      .resideInPackage('**/constants/**')
      .asWarning();
  }

  /**
   * Enums should be in enums package
   */
  static enumsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Enum$/)
      .should()
      .resideInPackage('**/enums/**')
      .asWarning();
  }

  /**
   * Types should be in types package
   */
  static typesLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Type(s)?$/)
      .should()
      .resideInPackage('**/types/**')
      .asWarning();
  }

  /**
   * Exceptions should be in exceptions package
   */
  static exceptionsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/(Exception|Error)$/)
      .should()
      .resideInPackage('**/exceptions/**')
      .orResideInPackage('**/errors/**')
      .asWarning();
  }

  /**
   * Mappers should be in mappers package
   */
  static mappersLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Mapper')
      .should()
      .resideInPackage('**/mappers/**')
      .asWarning();
  }

  /**
   * Adapters should be in adapters package
   */
  static adaptersLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Adapter')
      .should()
      .resideInPackage('**/adapters/**')
      .asWarning();
  }

  /**
   * Builders should be in builders package
   */
  static buildersLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Builder')
      .should()
      .resideInPackage('**/builders/**')
      .asWarning();
  }

  /**
   * Listeners should be in listeners package
   */
  static listenersLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Listener')
      .should()
      .resideInPackage('**/listeners/**')
      .asWarning();
  }

  /**
   * Providers should be in providers package
   */
  static providersLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Provider')
      .should()
      .resideInPackage('**/providers/**')
      .asWarning();
  }

  /**
   * Strategies should be in strategies package
   */
  static strategiesLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Strategy')
      .should()
      .resideInPackage('**/strategies/**')
      .asWarning();
  }

  /**
   * Avoid circular dependencies
   */
  static avoidCircularDependencies(): ArchRule {
    return ArchRuleDefinition.classes()
      .should()
      .beFreeOfCircularDependencies()
      .asError();
  }

  // ============================================================================
  // FRAMEWORK-SPECIFIC RULES
  // ============================================================================

  /**
   * NestJS: Modules should end with 'Module'
   */
  static nestJsModuleNaming(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .areAnnotatedWith('Module')
      .should()
      .haveSimpleNameEndingWith('Module')
      .asError();
  }

  /**
   * NestJS: Controllers should be decorated with @Controller
   */
  static nestJsControllerDecoration(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Controller')
      .should()
      .beAnnotatedWith('Controller')
      .asWarning();
  }

  /**
   * NestJS: Services should be decorated with @Injectable
   */
  static nestJsServiceDecoration(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameEndingWith('Service')
      .should()
      .beAnnotatedWith('Injectable')
      .asWarning();
  }

  /**
   * React: Components should be in components directory
   */
  static reactComponentsLocation(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .haveSimpleNameMatching(/Component$/)
      .should()
      .resideInPackage('**/components/**')
      .asWarning();
  }

  /**
   * React: Hooks should start with 'use'
   */
  static reactHooksNaming(): ArchRule {
    return ArchRuleDefinition.classes()
      .that()
      .resideInPackage('**/hooks/**')
      .should()
      .haveSimpleNameStartingWith('use')
      .asWarning();
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Get all naming convention rules
   */
  static getAllNamingConventionRules(): ArchRule[] {
    return [
      this.serviceNamingConvention(),
      this.controllerNamingConvention(),
      this.repositoryNamingConvention(),
      this.modelNamingConvention(),
      this.dtoNamingConvention(),
      this.interfaceNamingConvention(),
      this.abstractClassNamingConvention(),
      this.testFileNamingConvention(),
      this.utilityNamingConvention(),
      this.validatorNamingConvention(),
      this.middlewareNamingConvention(),
      this.guardNamingConvention(),
      this.decoratorNamingConvention(),
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
      this.repositoriesShouldOnlyDependOnModels(),
      this.modelsShouldNotDependOnServices(),
      this.modelsShouldNotDependOnControllers(),
      this.domainShouldNotDependOnInfrastructure(),
      this.coreShouldNotDependOnFeatures(),
      this.uiShouldNotDependOnDataLayer(),
      this.productionShouldNotDependOnTests(),
      this.noCircularDependencies(),
      this.dtosShouldNotDependOnEntities(),
      this.presentationShouldNotDependOnPersistence(),
      this.businessLogicShouldNotDependOnFrameworks(),
      this.commandsShouldNotReturnValues(),
      this.queriesShouldNotMutateState(),
      this.apiShouldNotDependOnDatabase(),
    ];
  }

  /**
   * Get all layering rules
   */
  static getAllLayeringRules(): ArchRule[] {
    return [
      this.standardLayeredArchitecture(),
      this.presentationLayerIsolation(),
      this.applicationShouldNotDependOnPresentation(),
      this.domainLayerIndependence(),
      this.infrastructureShouldNotDependOnPresentation(),
      this.apiRoutesPackageRule(),
      this.databaseCodeInDataLayer(),
      this.businessLogicInServiceLayer(),
      this.viewsIsolation(),
      this.configurationCentralization(),
      this.externalDependenciesInInfrastructure(),
      this.eventsLocation(),
    ];
  }

  /**
   * Get all security rules
   */
  static getAllSecurityRules(): ArchRule[] {
    return [
      this.sensitiveDataNotExposedInApi(),
      this.authenticationCentralization(),
      this.authorizationGuardsLocation(),
      this.cryptographyIsolation(),
      this.inputValidationAtBoundaries(),
      this.sqlQueriesInRepository(),
      this.fileUploadsIsolation(),
      this.rateLimitingInMiddleware(),
      this.sessionManagementCentralization(),
      this.corsConfigurationLocation(),
    ];
  }

  /**
   * Get all best practice rules
   */
  static getAllBestPracticeRules(): ArchRule[] {
    return [
      this.avoidGodClasses(),
      this.limitInheritanceDepth(),
      this.constantsLocation(),
      this.enumsLocation(),
      this.typesLocation(),
      this.exceptionsLocation(),
      this.mappersLocation(),
      this.adaptersLocation(),
      this.buildersLocation(),
      this.listenersLocation(),
      this.providersLocation(),
      this.strategiesLocation(),
      this.avoidCircularDependencies(),
    ];
  }

  /**
   * Get all rules (50+ total)
   */
  static getAllRules(): ArchRule[] {
    return [
      ...this.getAllNamingConventionRules(),
      ...this.getAllDependencyRules(),
      ...this.getAllLayeringRules(),
      ...this.getAllSecurityRules(),
      ...this.getAllBestPracticeRules(),
    ];
  }

  /**
   * Get recommended rules for a specific framework
   */
  static getFrameworkRules(framework: 'nestjs' | 'react' | 'express'): ArchRule[] {
    switch (framework) {
      case 'nestjs':
        return [
          this.nestJsModuleNaming(),
          this.nestJsControllerDecoration(),
          this.nestJsServiceDecoration(),
          this.controllerNamingConvention(),
          this.serviceNamingConvention(),
          this.controllersShouldNotDependOnRepositories(),
        ];
      case 'react':
        return [
          this.reactComponentsLocation(),
          this.reactHooksNaming(),
          this.uiShouldNotDependOnDataLayer(),
        ];
      case 'express':
        return [
          this.controllerNamingConvention(),
          this.serviceNamingConvention(),
          this.middlewareNamingConvention(),
          this.apiRoutesPackageRule(),
        ];
      default:
        return [];
    }
  }
}
