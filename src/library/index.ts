/**
 * Architectural Pattern Library
 *
 * Pre-built architectural patterns for common design styles.
 */

// Layered Architecture
export {
  LayeredArchitecture,
  LayerDefinition,
  LayerAccessRuleBuilder,
  layeredArchitecture,
} from './LayeredArchitecture';

// Pre-defined Architecture Patterns
export {
  Architectures,
  OnionArchitecture,
  AdapterBuilder,
  CleanArchitecture,
  DDDArchitecture,
  MicroservicesArchitecture,
  cleanArchitecture,
  dddArchitecture,
  microservicesArchitecture,
} from './Architectures';

// Extended Pattern Library
export {
  MVCArchitecture,
  MVVMArchitecture,
  CQRSArchitecture,
  EventDrivenArchitecture,
  PortsAndAdaptersArchitecture,
  mvcArchitecture,
  mvvmArchitecture,
  cqrsArchitecture,
  eventDrivenArchitecture,
  portsAndAdaptersArchitecture,
} from './PatternLibrary';
