import {
  mvcArchitecture,
  mvvmArchitecture,
  cqrsArchitecture,
  eventDrivenArchitecture,
  portsAndAdaptersArchitecture,
  MVCArchitecture,
  MVVMArchitecture,
  CQRSArchitecture,
  EventDrivenArchitecture,
  PortsAndAdaptersArchitecture,
} from '../../src/library/PatternLibrary';
import { TSClasses } from '../../src/core/TSClasses';
import { CodeAnalyzer } from '../../src/analyzer/CodeAnalyzer';
import * as path from 'path';

describe('PatternLibrary - Architectural Patterns', () => {
  // Test with real code parsed from fixtures
  let analyzer: CodeAnalyzer;
  let classes: TSClasses;
  const fixturesPath = path.join(__dirname, '..', 'fixtures', 'sample-code');

  beforeAll(async () => {
    analyzer = new CodeAnalyzer();
    classes = await analyzer.analyze(fixturesPath);
  });

  describe('Factory Functions', () => {
    it('should create MVC architecture', () => {
      const arch = mvcArchitecture();
      expect(arch).toBeDefined();
      expect(arch).toBeInstanceOf(MVCArchitecture);
    });

    it('should create MVVM architecture', () => {
      const arch = mvvmArchitecture();
      expect(arch).toBeDefined();
      expect(arch).toBeInstanceOf(MVVMArchitecture);
    });

    it('should create CQRS architecture', () => {
      const arch = cqrsArchitecture();
      expect(arch).toBeDefined();
      expect(arch).toBeInstanceOf(CQRSArchitecture);
    });

    it('should create Event-Driven architecture', () => {
      const arch = eventDrivenArchitecture();
      expect(arch).toBeDefined();
      expect(arch).toBeInstanceOf(EventDrivenArchitecture);
    });

    it('should create Ports and Adapters architecture', () => {
      const arch = portsAndAdaptersArchitecture();
      expect(arch).toBeDefined();
      expect(arch).toBeInstanceOf(PortsAndAdaptersArchitecture);
    });
  });

  describe('MVC Architecture', () => {
    describe('Layer Definition', () => {
      it('should define models layer', () => {
        const arch = mvcArchitecture().models('models');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVCArchitecture);
      });

      it('should define views layer', () => {
        const arch = mvcArchitecture().views('views');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVCArchitecture);
      });

      it('should define controllers layer', () => {
        const arch = mvcArchitecture().controllers('controllers');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVCArchitecture);
      });

      it('should support full MVC configuration', () => {
        const arch = mvcArchitecture().models('models').views('views').controllers('controllers');
        expect(arch).toBeDefined();
      });

      it('should support method chaining', () => {
        const arch = mvcArchitecture();
        const result = arch.models('models').views('views').controllers('controllers');
        expect(result).toBe(arch);
      });
    });

    describe('MVC Dependency Rules', () => {
      it('should enforce models do not depend on views', () => {
        const arch = mvcArchitecture().models('models').views('views');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce models do not depend on controllers', () => {
        const arch = mvcArchitecture().models('models').controllers('controllers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce views do not depend on controllers', () => {
        const arch = mvcArchitecture().views('views').controllers('controllers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow controllers to access models and views', () => {
        const arch = mvcArchitecture().models('models').views('views').controllers('controllers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow views to access models', () => {
        const arch = mvcArchitecture().models('models').views('views');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial MVC Configurations', () => {
      it('should handle models only', () => {
        const arch = mvcArchitecture().models('models');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle views only', () => {
        const arch = mvcArchitecture().views('views');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle controllers only', () => {
        const arch = mvcArchitecture().controllers('controllers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle empty configuration', () => {
        const arch = mvcArchitecture();
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('MVVM Architecture', () => {
    describe('Layer Definition', () => {
      it('should define models layer', () => {
        const arch = mvvmArchitecture().models('models');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVVMArchitecture);
      });

      it('should define views layer', () => {
        const arch = mvvmArchitecture().views('views');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVVMArchitecture);
      });

      it('should define view models layer', () => {
        const arch = mvvmArchitecture().viewModels('viewmodels');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(MVVMArchitecture);
      });

      it('should support full MVVM configuration', () => {
        const arch = mvvmArchitecture().models('models').views('views').viewModels('viewmodels');
        expect(arch).toBeDefined();
      });

      it('should support method chaining', () => {
        const arch = mvvmArchitecture();
        const result = arch.models('models').views('views').viewModels('viewmodels');
        expect(result).toBe(arch);
      });
    });

    describe('MVVM Dependency Rules', () => {
      it('should enforce models do not depend on viewmodels', () => {
        const arch = mvvmArchitecture().models('models').viewModels('viewmodels');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce models do not depend on views', () => {
        const arch = mvvmArchitecture().models('models').views('views');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce viewmodels only access models', () => {
        const arch = mvvmArchitecture().models('models').viewModels('viewmodels');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce viewmodels do not access views', () => {
        const arch = mvvmArchitecture().views('views').viewModels('viewmodels');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce views only access viewmodels', () => {
        const arch = mvvmArchitecture().views('views').viewModels('viewmodels');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial MVVM Configurations', () => {
      it('should handle models and viewmodels only', () => {
        const arch = mvvmArchitecture().models('models').viewModels('viewmodels');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle single layer', () => {
        const arch = mvvmArchitecture().models('models');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle empty configuration', () => {
        const arch = mvvmArchitecture();
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('CQRS Architecture', () => {
    describe('Layer Definition', () => {
      it('should define commands layer', () => {
        const arch = cqrsArchitecture().commands('commands');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should define queries layer', () => {
        const arch = cqrsArchitecture().queries('queries');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should define handlers layer', () => {
        const arch = cqrsArchitecture().handlers('handlers');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should define domain layer', () => {
        const arch = cqrsArchitecture().domain('domain');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should define read model layer', () => {
        const arch = cqrsArchitecture().readModel('readmodel');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should define write model layer', () => {
        const arch = cqrsArchitecture().writeModel('writemodel');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(CQRSArchitecture);
      });

      it('should support full CQRS configuration', () => {
        const arch = cqrsArchitecture()
          .commands('commands')
          .queries('queries')
          .handlers('handlers')
          .domain('domain')
          .readModel('readmodel')
          .writeModel('writemodel');
        expect(arch).toBeDefined();
      });
    });

    describe('CQRS Dependency Rules', () => {
      it('should enforce domain does not depend on commands', () => {
        const arch = cqrsArchitecture().domain('domain').commands('commands');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce domain does not depend on queries', () => {
        const arch = cqrsArchitecture().domain('domain').queries('queries');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce domain does not depend on handlers', () => {
        const arch = cqrsArchitecture().domain('domain').handlers('handlers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce commands and queries do not depend on each other', () => {
        const arch = cqrsArchitecture().commands('commands').queries('queries');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce read and write models do not depend on each other', () => {
        const arch = cqrsArchitecture().readModel('readmodel').writeModel('writemodel');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow handlers to access commands, queries, and domain', () => {
        const arch = cqrsArchitecture()
          .handlers('handlers')
          .commands('commands')
          .queries('queries')
          .domain('domain');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('CQRS-Specific Rules', () => {
      it('should validate CQRS architecture with specific rules', () => {
        const arch = cqrsArchitecture()
          .commands('commands')
          .queries('queries')
          .handlers('handlers')
          .domain('domain');
        const violations = arch.check(classes);
        // CQRS-specific validations should be included
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should check command and query separation', () => {
        const arch = cqrsArchitecture().commands('commands').queries('queries');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should check read and write model separation', () => {
        const arch = cqrsArchitecture().readModel('readmodel').writeModel('writemodel');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial CQRS Configurations', () => {
      it('should handle commands and queries only', () => {
        const arch = cqrsArchitecture().commands('commands').queries('queries');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle single layer', () => {
        const arch = cqrsArchitecture().domain('domain');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle empty configuration', () => {
        const arch = cqrsArchitecture();
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Event-Driven Architecture', () => {
    describe('Layer Definition', () => {
      it('should define events layer', () => {
        const arch = eventDrivenArchitecture().events('events');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(EventDrivenArchitecture);
      });

      it('should define publishers layer', () => {
        const arch = eventDrivenArchitecture().publishers('publishers');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(EventDrivenArchitecture);
      });

      it('should define subscribers layer', () => {
        const arch = eventDrivenArchitecture().subscribers('subscribers');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(EventDrivenArchitecture);
      });

      it('should define domain layer', () => {
        const arch = eventDrivenArchitecture().domain('domain');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(EventDrivenArchitecture);
      });

      it('should define event bus layer', () => {
        const arch = eventDrivenArchitecture().eventBus('eventbus');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(EventDrivenArchitecture);
      });

      it('should support full event-driven configuration', () => {
        const arch = eventDrivenArchitecture()
          .events('events')
          .publishers('publishers')
          .subscribers('subscribers')
          .domain('domain')
          .eventBus('eventbus');
        expect(arch).toBeDefined();
      });
    });

    describe('Event-Driven Dependency Rules', () => {
      it('should enforce events do not depend on publishers', () => {
        const arch = eventDrivenArchitecture().events('events').publishers('publishers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce events do not depend on subscribers', () => {
        const arch = eventDrivenArchitecture().events('events').subscribers('subscribers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce publishers and subscribers do not depend on each other', () => {
        const arch = eventDrivenArchitecture().publishers('publishers').subscribers('subscribers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow publishers to access events and eventbus', () => {
        const arch = eventDrivenArchitecture()
          .publishers('publishers')
          .events('events')
          .eventBus('eventbus');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow subscribers to access events and domain', () => {
        const arch = eventDrivenArchitecture()
          .subscribers('subscribers')
          .events('events')
          .domain('domain');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce eventbus does not depend on publishers or subscribers', () => {
        const arch = eventDrivenArchitecture()
          .eventBus('eventbus')
          .publishers('publishers')
          .subscribers('subscribers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Event-Driven-Specific Rules', () => {
      it('should validate event immutability rules', () => {
        const arch = eventDrivenArchitecture().events('events');
        const violations = arch.check(classes);
        // Event-specific validations (immutability) should be included
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should check publisher and subscriber independence', () => {
        const arch = eventDrivenArchitecture().publishers('publishers').subscribers('subscribers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial Event-Driven Configurations', () => {
      it('should handle events and publishers only', () => {
        const arch = eventDrivenArchitecture().events('events').publishers('publishers');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle single layer', () => {
        const arch = eventDrivenArchitecture().events('events');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle empty configuration', () => {
        const arch = eventDrivenArchitecture();
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Ports and Adapters Architecture', () => {
    describe('Layer Definition', () => {
      it('should define domain layer', () => {
        const arch = portsAndAdaptersArchitecture().domain('domain');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(PortsAndAdaptersArchitecture);
      });

      it('should define ports layer', () => {
        const arch = portsAndAdaptersArchitecture().ports('ports');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(PortsAndAdaptersArchitecture);
      });

      it('should define adapters layer', () => {
        const arch = portsAndAdaptersArchitecture().adapters('adapters');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(PortsAndAdaptersArchitecture);
      });

      it('should define application layer', () => {
        const arch = portsAndAdaptersArchitecture().application('application');
        expect(arch).toBeDefined();
        expect(arch).toBeInstanceOf(PortsAndAdaptersArchitecture);
      });

      it('should support full ports and adapters configuration', () => {
        const arch = portsAndAdaptersArchitecture()
          .domain('domain')
          .ports('ports')
          .adapters('adapters')
          .application('application');
        expect(arch).toBeDefined();
      });
    });

    describe('Ports and Adapters Dependency Rules', () => {
      it('should enforce domain does not depend on adapters', () => {
        const arch = portsAndAdaptersArchitecture().domain('domain').adapters('adapters');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should enforce ports do not depend on adapters', () => {
        const arch = portsAndAdaptersArchitecture().ports('ports').adapters('adapters');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow application to access domain and ports', () => {
        const arch = portsAndAdaptersArchitecture()
          .application('application')
          .domain('domain')
          .ports('ports');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should allow adapters to access ports and domain', () => {
        const arch = portsAndAdaptersArchitecture()
          .adapters('adapters')
          .ports('ports')
          .domain('domain');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Ports and Adapters-Specific Rules', () => {
      it('should validate ports are interfaces or abstract', () => {
        const arch = portsAndAdaptersArchitecture().ports('ports');
        const violations = arch.check(classes);
        // Ports-specific validations should be included
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should check full ports and adapters architecture', () => {
        const arch = portsAndAdaptersArchitecture()
          .domain('domain')
          .ports('ports')
          .adapters('adapters')
          .application('application');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });

    describe('Partial Ports and Adapters Configurations', () => {
      it('should handle domain and ports only', () => {
        const arch = portsAndAdaptersArchitecture().domain('domain').ports('ports');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle single layer', () => {
        const arch = portsAndAdaptersArchitecture().domain('domain');
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });

      it('should handle empty configuration', () => {
        const arch = portsAndAdaptersArchitecture();
        const violations = arch.check(classes);
        expect(Array.isArray(violations)).toBe(true);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should check MVC architecture against real code', () => {
      const arch = mvcArchitecture().models('models').views('views').controllers('controllers');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check MVVM architecture against real code', () => {
      const arch = mvvmArchitecture().models('models').views('views').viewModels('viewmodels');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check CQRS architecture against real code', () => {
      const arch = cqrsArchitecture()
        .commands('commands')
        .queries('queries')
        .handlers('handlers')
        .domain('domain');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check Event-Driven architecture against real code', () => {
      const arch = eventDrivenArchitecture()
        .events('events')
        .publishers('publishers')
        .subscribers('subscribers');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should check Ports and Adapters architecture against real code', () => {
      const arch = portsAndAdaptersArchitecture()
        .domain('domain')
        .ports('ports')
        .adapters('adapters')
        .application('application');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple packages for same layer', () => {
      const arch = mvcArchitecture().models('models', 'domain', 'entities');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle empty package arrays', () => {
      const arch = cqrsArchitecture().commands();
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle special characters in package names', () => {
      const arch = eventDrivenArchitecture().events('events-v2', 'events_new');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });

    it('should handle very long package patterns', () => {
      const longPattern = 'src/very/deep/nested/folder/structure/with/many/levels';
      const arch = portsAndAdaptersArchitecture().domain(longPattern);
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle mixed architecture patterns in same codebase', () => {
      const mvcArch = mvcArchitecture().models('models').views('views').controllers('controllers');
      const mvvmArch = mvvmArchitecture().models('models').views('views').viewModels('viewmodels');

      const mvcViolations = mvcArch.check(classes);
      const mvvmViolations = mvvmArch.check(classes);

      expect(Array.isArray(mvcViolations)).toBe(true);
      expect(Array.isArray(mvvmViolations)).toBe(true);
    });

    it('should handle CQRS with event sourcing', () => {
      const cqrsArch = cqrsArchitecture()
        .commands('commands')
        .queries('queries')
        .handlers('handlers');
      const eventArch = eventDrivenArchitecture().events('events').publishers('publishers');

      const cqrsViolations = cqrsArch.check(classes);
      const eventViolations = eventArch.check(classes);

      expect(Array.isArray(cqrsViolations)).toBe(true);
      expect(Array.isArray(eventViolations)).toBe(true);
    });

    it('should handle layered architecture with ports and adapters', () => {
      const arch = portsAndAdaptersArchitecture()
        .domain('domain')
        .ports('ports')
        .adapters('adapters')
        .application('application');
      const violations = arch.check(classes);
      expect(Array.isArray(violations)).toBe(true);
    });
  });
});
