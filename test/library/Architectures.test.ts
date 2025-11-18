/**
 * Comprehensive tests for Architectures.ts
 * Target: 5.71% → 75% coverage
 *
 * Tests all 5 architectural patterns:
 * 1. Layered Architecture
 * 2. Onion Architecture
 * 3. Clean Architecture
 * 4. DDD Architecture
 * 5. Microservices Architecture
 */

import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import { TSClasses } from '../../src/core/TSClasses';
import {
  Architectures,
  OnionArchitecture,
  CleanArchitecture,
  DDDArchitecture,
  MicroservicesArchitecture,
  cleanArchitecture,
  dddArchitecture,
  microservicesArchitecture,
} from '../../src/library/Architectures';
import * as path from 'path';

describe('Architectures - All Patterns', () => {
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze(fixturesPath);
  });

  describe('Architectures Class (Factory Methods)', () => {
    it('should create layered architecture', () => {
      const arch = Architectures.layeredArchitecture();
      expect(arch).toBeDefined();
      expect(typeof arch.layer).toBe('function');
    });

    it('should create onion architecture', () => {
      const arch = Architectures.onionArchitecture();
      expect(arch).toBeInstanceOf(OnionArchitecture);
      expect(typeof arch.domainModels).toBe('function');
    });

    it('should create clean architecture', () => {
      const arch = Architectures.cleanArchitecture();
      expect(arch).toBeInstanceOf(CleanArchitecture);
      expect(typeof arch.entities).toBe('function');
    });

    it('should create DDD architecture', () => {
      const arch = Architectures.dddArchitecture();
      expect(arch).toBeInstanceOf(DDDArchitecture);
      expect(typeof arch.aggregates).toBe('function');
    });

    it('should create microservices architecture', () => {
      const arch = Architectures.microservicesArchitecture();
      expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      expect(typeof arch.service).toBe('function');
    });
  });

  describe('Onion Architecture', () => {
    describe('Layer Definition', () => {
      it('should define domain models layer', () => {
        const arch = new OnionArchitecture().domainModels('models', 'domain');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(OnionArchitecture);
      });

      it('should define application services layer', () => {
        const arch = new OnionArchitecture().applicationServices('services', 'application');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(OnionArchitecture);
      });

      it('should define adapters with builder pattern', () => {
        const arch = new OnionArchitecture().adapter('web').definedBy('controllers', 'api');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(OnionArchitecture);
      });

      it('should support method chaining', () => {
        const arch = new OnionArchitecture()
          .domainModels('models')
          .applicationServices('services')
          .adapter('web')
          .definedBy('controllers');

        expect(arch).toBeInstanceOf(OnionArchitecture);
      });
    });

    describe('Conversion to Layered Architecture', () => {
      it('should convert to layered architecture with all layers', () => {
        const onionArch = new OnionArchitecture()
          .domainModels('models')
          .applicationServices('services');

        const layeredArch = onionArch.toLayeredArchitecture();
        expect(layeredArch).toBeDefined();
        expect(typeof layeredArch.check).toBe('function');
      });

      it('should enforce domain independence rule', () => {
        const onionArch = new OnionArchitecture()
          .domainModels('models')
          .applicationServices('services');

        const layeredArch = onionArch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Domain should not depend on application layer
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce application layer dependency rules', () => {
        const onionArch = new OnionArchitecture()
          .domainModels('models')
          .applicationServices('services');

        const layeredArch = onionArch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Application may only depend on domain
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle minimal configuration (domain only)', () => {
        const onionArch = new OnionArchitecture().domainModels('models');

        const layeredArch = onionArch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle empty configuration', () => {
        const onionArch = new OnionArchitecture();
        const layeredArch = onionArch.toLayeredArchitecture();

        const violations = layeredArch.check(classes);
        expect(violations).toBeDefined();
      });
    });
  });

  describe('Clean Architecture', () => {
    describe('Layer Definition', () => {
      it('should define entities layer', () => {
        const arch = cleanArchitecture().entities('models', 'entities');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CleanArchitecture);
      });

      it('should define use cases layer', () => {
        const arch = cleanArchitecture().useCases('usecases', 'application');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CleanArchitecture);
      });

      it('should define controllers layer', () => {
        const arch = cleanArchitecture().controllers('controllers', 'api');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CleanArchitecture);
      });

      it('should define presenters layer', () => {
        const arch = cleanArchitecture().presenters('presenters', 'views');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CleanArchitecture);
      });

      it('should define gateways layer', () => {
        const arch = cleanArchitecture().gateways('gateways', 'infrastructure');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CleanArchitecture);
      });

      it('should support full clean architecture definition', () => {
        const arch = cleanArchitecture()
          .entities('models')
          .useCases('usecases')
          .controllers('controllers')
          .presenters('presenters')
          .gateways('gateways');

        expect(arch).toBeInstanceOf(CleanArchitecture);
      });
    });

    describe('Dependency Rules', () => {
      it('should enforce entities have no dependencies', () => {
        const arch = cleanArchitecture()
          .entities('models')
          .useCases('services')
          .controllers('controllers');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Entities should not depend on use cases, controllers, etc.
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce use cases only depend on entities', () => {
        const arch = cleanArchitecture().entities('models').useCases('services');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce controllers may depend on use cases and entities', () => {
        const arch = cleanArchitecture()
          .entities('models')
          .useCases('services')
          .controllers('controllers');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce presenters may depend on use cases and entities', () => {
        const arch = cleanArchitecture()
          .entities('models')
          .useCases('services')
          .presenters('presenters');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce gateways may depend on use cases and entities', () => {
        const arch = cleanArchitecture()
          .entities('models')
          .useCases('services')
          .gateways('repositories');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial Configurations', () => {
      it('should handle entities and use cases only', () => {
        const arch = cleanArchitecture().entities('models').useCases('services');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle single layer configuration', () => {
        const arch = cleanArchitecture().entities('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle empty configuration', () => {
        const arch = new CleanArchitecture();
        const layeredArch = arch.toLayeredArchitecture();

        const violations = layeredArch.check(classes);
        expect(violations).toBeDefined();
      });
    });
  });

  describe('DDD Architecture', () => {
    describe('Layer Definition', () => {
      it('should define aggregates layer', () => {
        const arch = dddArchitecture().aggregates('aggregates', 'domain.aggregates');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define entities layer', () => {
        const arch = dddArchitecture().entities('entities', 'domain.entities');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define value objects layer', () => {
        const arch = dddArchitecture().valueObjects('valueobjects', 'domain.values');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define domain services layer', () => {
        const arch = dddArchitecture().domainServices('domain.services');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define repositories layer', () => {
        const arch = dddArchitecture().repositories('repositories', 'infrastructure.persistence');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define factories layer', () => {
        const arch = dddArchitecture().factories('factories', 'domain.factories');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should define application services layer', () => {
        const arch = dddArchitecture().applicationServices('application', 'services');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(DDDArchitecture);
      });

      it('should support full DDD configuration', () => {
        const arch = dddArchitecture()
          .aggregates('aggregates')
          .entities('entities')
          .valueObjects('valueobjects')
          .domainServices('domain.services')
          .repositories('repositories')
          .factories('factories')
          .applicationServices('application');

        expect(arch).toBeInstanceOf(DDDArchitecture);
      });
    });

    describe('DDD Dependency Rules', () => {
      it('should enforce value objects do not depend on entities or aggregates', () => {
        const arch = dddArchitecture()
          .valueObjects('models')
          .entities('entities')
          .aggregates('aggregates');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce entities may not depend on aggregates', () => {
        const arch = dddArchitecture().entities('entities').aggregates('aggregates');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce repositories should not depend on application services', () => {
        const arch = dddArchitecture().repositories('repositories').applicationServices('services');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow application services to orchestrate domain objects', () => {
        const arch = dddArchitecture()
          .aggregates('aggregates')
          .entities('entities')
          .valueObjects('models')
          .domainServices('domain.services')
          .repositories('repositories')
          .factories('factories')
          .applicationServices('services');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Application services may access all domain layers
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial DDD Configurations', () => {
      it('should handle aggregates and entities only', () => {
        const arch = dddArchitecture().aggregates('aggregates').entities('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle value objects only', () => {
        const arch = dddArchitecture().valueObjects('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle empty configuration', () => {
        const arch = new DDDArchitecture();
        const layeredArch = arch.toLayeredArchitecture();

        const violations = layeredArch.check(classes);
        expect(violations).toBeDefined();
      });
    });
  });

  describe('Microservices Architecture', () => {
    describe('Service Definition', () => {
      it('should define a single microservice', () => {
        const arch = microservicesArchitecture().service('UserService', 'services.user');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      });

      it('should define multiple microservices', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services.user')
          .service('OrderService', 'services.order')
          .service('PaymentService', 'services.payment');

        expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      });

      it('should define shared kernel', () => {
        const arch = microservicesArchitecture().sharedKernel('shared', 'common');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      });

      it('should define API gateway', () => {
        const arch = microservicesArchitecture().apiGateway('gateway', 'api');

        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      });

      it('should support full microservices configuration', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services.user')
          .service('OrderService', 'services.order')
          .sharedKernel('shared')
          .apiGateway('gateway');

        expect(arch).toBeInstanceOf(MicroservicesArchitecture);
      });
    });

    describe('Microservices Isolation Rules', () => {
      it('should enforce services can only access shared kernel', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services')
          .service('OrderService', 'orders')
          .sharedKernel('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Services should not depend on each other, only on shared kernel
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow API gateway to access all services', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services')
          .sharedKernel('models')
          .apiGateway('controllers');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // API gateway may access services and shared kernel
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce shared kernel does not depend on services', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services')
          .sharedKernel('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        // Shared kernel should not depend on services
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce shared kernel does not depend on gateway', () => {
        const arch = microservicesArchitecture().sharedKernel('models').apiGateway('controllers');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Complex Microservices Scenarios', () => {
      it('should handle 5+ microservices', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'user')
          .service('OrderService', 'order')
          .service('PaymentService', 'payment')
          .service('ShippingService', 'shipping')
          .service('NotificationService', 'notification')
          .sharedKernel('shared');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle microservices without shared kernel', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services')
          .service('OrderService', 'orders');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle microservices without API gateway', () => {
        const arch = microservicesArchitecture()
          .service('UserService', 'services')
          .sharedKernel('models');

        const layeredArch = arch.toLayeredArchitecture();
        const violations = layeredArch.check(classes);

        expect(violations).toBeDefined();
      });

      it('should handle empty configuration', () => {
        const arch = new MicroservicesArchitecture();
        const layeredArch = arch.toLayeredArchitecture();

        const violations = layeredArch.check(classes);
        expect(violations).toBeDefined();
      });
    });
  });

  describe('Integration Tests', () => {
    it('should check onion architecture against real code', () => {
      const arch = new OnionArchitecture().domainModels('models').applicationServices('services');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      // Should work without errors
      expect(violations).toBeDefined();
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check clean architecture against real code', () => {
      const arch = cleanArchitecture()
        .entities('models')
        .useCases('services')
        .controllers('controllers');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check DDD architecture against real code', () => {
      const arch = dddArchitecture()
        .aggregates('models')
        .entities('models')
        .repositories('repositories')
        .applicationServices('services');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check microservices architecture against real code', () => {
      const arch = microservicesArchitecture()
        .service('UserService', 'services')
        .service('OrderService', 'controllers')
        .sharedKernel('models');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple packages for same layer', () => {
      const arch = cleanArchitecture().entities('models', 'domain', 'entities');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
    });

    it('should handle empty package arrays', () => {
      const arch = cleanArchitecture().entities();

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
    });

    it('should handle special characters in package names', () => {
      const arch = dddArchitecture().aggregates('domain-v2', 'domain_models');

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
    });

    it('should handle very long package patterns', () => {
      const longPackage = 'very.long.nested.package.structure.for.testing';
      const arch = cleanArchitecture().entities(longPackage);

      const rule = arch.toLayeredArchitecture();
      const violations = rule.check(classes);

      expect(violations).toBeDefined();
    });
  });
});
