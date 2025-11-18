# Architectural Pattern Library Guide

ArchUnit-TS provides a comprehensive library of predefined architectural patterns that help you enforce common design styles in your TypeScript applications. This guide covers all available patterns with examples and best practices.

## Table of Contents

- [Overview](#overview)
- [Available Patterns](#available-patterns)
  - [Layered Architecture](#layered-architecture)
  - [Clean Architecture](#clean-architecture)
  - [Hexagonal Architecture (Ports & Adapters)](#hexagonal-architecture-ports--adapters)
  - [Onion Architecture](#onion-architecture)
  - [MVC (Model-View-Controller)](#mvc-model-view-controller)
  - [MVVM (Model-View-ViewModel)](#mvvm-model-view-viewmodel)
  - [CQRS (Command Query Responsibility Segregation)](#cqrs-command-query-responsibility-segregation)
  - [Event-Driven Architecture](#event-driven-architecture)
  - [DDD (Domain-Driven Design)](#ddd-domain-driven-design)
  - [Microservices Architecture](#microservices-architecture)
- [Combining Patterns](#combining-patterns)
- [Custom Patterns](#custom-patterns)
- [Best Practices](#best-practices)
- [API Reference](#api-reference)

---

## Overview

Architectural patterns provide proven solutions for organizing code and enforcing dependencies. ArchUnit-TS makes it easy to:

- **Define** your architecture pattern with fluent APIs
- **Enforce** architectural rules automatically
- **Validate** violations in CI/CD pipelines
- **Document** your architecture as code

### Why Use Predefined Patterns?

1. **Consistency** - Follow industry-standard practices
2. **Validation** - Automatic dependency checking
3. **Documentation** - Self-documenting code structure
4. **Onboarding** - Easier for new team members
5. **Refactoring** - Clear boundaries prevent architectural erosion

---

## Available Patterns

### Layered Architecture

Classic N-tier architecture with horizontal layers.

**Structure:**
```
┌─────────────────────────────┐
│     Presentation Layer      │
├─────────────────────────────┤
│      Business Logic         │
├─────────────────────────────┤
│      Data Access Layer      │
└─────────────────────────────┘
```

**Usage:**

```typescript
import { layeredArchitecture } from 'archunit-ts';

const rule = layeredArchitecture()
  .layer('Controllers').definedBy('controllers')
  .layer('Services').definedBy('services')
  .layer('Repositories').definedBy('repositories')
  .layer('Models').definedBy('models')

  // Define access rules
  .whereLayer('Controllers').mayOnlyAccessLayers('Services', 'Models')
  .whereLayer('Services').mayOnlyAccessLayers('Repositories', 'Models')
  .whereLayer('Repositories').mayOnlyAccessLayers('Models')
  .whereLayer('Models').mayNotAccessLayers('Controllers', 'Services', 'Repositories');

const violations = rule.check(classes);
```

**Key Rules:**
- Upper layers can depend on lower layers
- Lower layers cannot depend on upper layers
- Each layer has single responsibility

**Example Project Structure:**
```
src/
├── controllers/
│   ├── UserController.ts
│   └── ProductController.ts
├── services/
│   ├── UserService.ts
│   └── ProductService.ts
├── repositories/
│   ├── UserRepository.ts
│   └── ProductRepository.ts
└── models/
    ├── User.ts
    └── Product.ts
```

**When to Use:**
- Traditional enterprise applications
- Simple, well-understood requirements
- Teams new to architecture patterns
- CRUD-heavy applications

---

### Clean Architecture

Uncle Bob's Clean Architecture with dependency inversion.

**Structure:**
```
┌─────────────────────────────────────┐
│         Frameworks & Drivers        │
│  ┌───────────────────────────────┐  │
│  │    Interface Adapters         │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │   Application Business  │  │  │
│  │  │  ┌───────────────────┐  │  │  │
│  │  │  │   Entities        │  │  │  │
│  │  │  └───────────────────┘  │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

**Usage:**

```typescript
import { cleanArchitecture } from 'archunit-ts';

const rule = cleanArchitecture()
  .entities('domain/entities')
  .useCases('application/usecases')
  .controllers('adapters/controllers')
  .presenters('adapters/presenters')
  .gateways('adapters/gateways')
  .toLayeredArchitecture();

const violations = rule.check(classes);
```

**Key Principles:**
1. **Dependency Rule** - Dependencies point inward only
2. **Entities** - Enterprise business rules (innermost)
3. **Use Cases** - Application-specific business rules
4. **Interface Adapters** - Convert data formats
5. **Frameworks** - External interfaces (outermost)

**Example:**

```typescript
// ❌ BAD: Entity depends on framework
// src/domain/entities/User.ts
import { Column } from 'typeorm'; // Framework dependency!

export class User {
  @Column()
  name: string;
}

// ✅ GOOD: Entity has no external dependencies
// src/domain/entities/User.ts
export class User {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string
  ) {}
}

// Use case depends only on entities
// src/application/usecases/CreateUser.ts
import { User } from '../../domain/entities/User';
import { UserRepository } from '../ports/UserRepository'; // Interface, not implementation

export class CreateUserUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(name: string, email: string): Promise<User> {
    const user = new User(generateId(), name, email);
    await this.userRepo.save(user);
    return user;
  }
}
```

**When to Use:**
- Complex business logic
- Long-lived applications
- Independent testability required
- Framework-agnostic domain

---

### Hexagonal Architecture (Ports & Adapters)

Isolates core logic from external concerns.

**Structure:**
```
        ┌─────────────────┐
        │    Adapters     │
        │  (REST, DB,     │
        │   Queue, etc)   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │     Ports       │
        │  (Interfaces)   │
        └────────┬────────┘
                 │
        ┌────────▼────────┐
        │     Domain      │
        │  (Core Logic)   │
        └─────────────────┘
```

**Usage:**

```typescript
import { portsAndAdaptersArchitecture } from 'archunit-ts';

const rule = portsAndAdaptersArchitecture()
  .domain('core/domain')
  .ports('core/ports')
  .adapters('infrastructure/adapters')
  .application('core/application');

const violations = rule.check(classes);
```

**Key Concepts:**
- **Ports** - Interfaces defining communication contracts
- **Adapters** - Implementations of ports (inbound/outbound)
- **Domain** - Pure business logic
- **Application** - Use cases orchestrating domain

**Example:**

```typescript
// Port (interface)
// src/core/ports/PaymentGateway.ts
export interface PaymentGateway {
  charge(amount: number, cardToken: string): Promise<PaymentResult>;
}

// Adapter implementation
// src/infrastructure/adapters/StripeAdapter.ts
import { PaymentGateway } from '../../core/ports/PaymentGateway';
import Stripe from 'stripe';

export class StripeAdapter implements PaymentGateway {
  private stripe = new Stripe(process.env.STRIPE_KEY);

  async charge(amount: number, cardToken: string): Promise<PaymentResult> {
    const charge = await this.stripe.charges.create({
      amount,
      currency: 'usd',
      source: cardToken,
    });
    return { success: true, transactionId: charge.id };
  }
}

// Domain uses port, not adapter
// src/core/domain/OrderService.ts
import { PaymentGateway } from '../ports/PaymentGateway';

export class OrderService {
  constructor(private paymentGateway: PaymentGateway) {}

  async processOrder(order: Order): Promise<void> {
    await this.paymentGateway.charge(order.total, order.paymentToken);
  }
}
```

**When to Use:**
- Swappable infrastructure
- Testing without external dependencies
- Multiple client types (API, CLI, GUI)
- Cloud-agnostic applications

---

### Onion Architecture

Similar to Hexagonal, emphasizing dependency inversion.

**Usage:**

```typescript
import { Architectures } from 'archunit-ts';

const rule = Architectures.onionArchitecture()
  .domainModels('domain/models')
  .applicationServices('application')
  .adapter('infrastructure')
  .definedBy('infrastructure/persistence', 'infrastructure/api')
  .toLayeredArchitecture();

const violations = rule.check(classes);
```

---

### MVC (Model-View-Controller)

Classic pattern for web applications.

**Structure:**
```
┌──────┐       ┌────────────┐       ┌───────┐
│ View │◄──────│ Controller │──────►│ Model │
└──────┘       └────────────┘       └───────┘
    │                                    ▲
    └────────────────────────────────────┘
```

**Usage:**

```typescript
import { mvcArchitecture } from 'archunit-ts';

const rule = mvcArchitecture()
  .models('models')
  .views('views')
  .controllers('controllers');

const violations = rule.check(classes);
```

**Key Rules:**
- Models don't depend on Views or Controllers
- Views don't depend on Controllers
- Controllers can access both Models and Views

**Example:**

```typescript
// Model (data + business logic)
// src/models/User.ts
export class User {
  constructor(
    public id: string,
    public name: string,
    public email: string
  ) {}

  isValid(): boolean {
    return this.email.includes('@');
  }
}

// View (presentation)
// src/views/UserView.ts
import { User } from '../models/User'; // ✅ Allowed

export class UserView {
  render(user: User): string {
    return `<div>${user.name} (${user.email})</div>`;
  }
}

// Controller (flow control)
// src/controllers/UserController.ts
import { User } from '../models/User';
import { UserView } from '../views/UserView';

export class UserController {
  constructor(
    private userService: UserService,
    private view: UserView
  ) {}

  async showUser(id: string): Promise<string> {
    const user = await this.userService.getUser(id);
    return this.view.render(user);
  }
}
```

**When to Use:**
- Web applications
- Server-side rendering
- Simple to medium complexity
- Team familiar with MVC

---

### MVVM (Model-View-ViewModel)

Data binding pattern for rich UIs.

**Structure:**
```
┌──────┐       ┌───────────┐       ┌───────┐
│ View │◄─────►│ ViewModel │──────►│ Model │
└──────┘       └───────────┘       └───────┘
  (UI)        (Presentation        (Data +
               Logic)               Logic)
```

**Usage:**

```typescript
import { mvvmArchitecture } from 'archunit-ts';

const rule = mvvmArchitecture()
  .models('models')
  .viewModels('viewmodels')
  .views('views');

const violations = rule.check(classes);
```

**Key Rules:**
- Models don't depend on ViewModels or Views
- ViewModels depend on Models, not Views
- Views only depend on ViewModels

**Example:**

```typescript
// Model
// src/models/Product.ts
export class Product {
  constructor(
    public id: string,
    public name: string,
    public price: number
  ) {}
}

// ViewModel
// src/viewmodels/ProductViewModel.ts
import { Product } from '../models/Product';
import { observable, computed } from 'mobx';

export class ProductViewModel {
  @observable private product: Product;

  constructor(product: Product) {
    this.product = product;
  }

  @computed get displayName(): string {
    return this.product.name.toUpperCase();
  }

  @computed get formattedPrice(): string {
    return `$${this.product.price.toFixed(2)}`;
  }

  updatePrice(newPrice: number): void {
    this.product.price = newPrice;
  }
}

// View (React component)
// src/views/ProductView.tsx
import { observer } from 'mobx-react';
import { ProductViewModel } from '../viewmodels/ProductViewModel';

export const ProductView = observer(({ viewModel }: { viewModel: ProductViewModel }) => {
  return (
    <div>
      <h2>{viewModel.displayName}</h2>
      <span>{viewModel.formattedPrice}</span>
    </div>
  );
});
```

**When to Use:**
- Rich client applications (React, Angular, Vue)
- Two-way data binding
- Complex UI state management
- Testable presentation logic

---

### CQRS (Command Query Responsibility Segregation)

Separates reads and writes.

**Structure:**
```
Commands ──► Write Model ──► Domain
             (Optimized
              for writes)

Queries  ──► Read Model
             (Optimized
              for reads)
```

**Usage:**

```typescript
import { cqrsArchitecture } from 'archunit-ts';

const rule = cqrsArchitecture()
  .commands('commands')
  .queries('queries')
  .handlers('handlers')
  .domain('domain')
  .readModel('read-model')
  .writeModel('write-model');

const violations = rule.check(classes);
```

**Key Rules:**
- Commands don't return data (void/Promise<void>)
- Queries don't modify state
- Commands and Queries are independent
- Read and Write models are separated

**Example:**

```typescript
// Command (write)
// src/commands/CreateUser.ts
export class CreateUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string
  ) {}
}

// Command Handler
// src/handlers/CreateUserHandler.ts
export class CreateUserHandler {
  constructor(private writeRepo: UserWriteRepository) {}

  async handle(command: CreateUserCommand): Promise<void> { // ✅ Returns void
    const user = new User(command.name, command.email);
    await this.writeRepo.save(user);
  }
}

// Query (read)
// src/queries/GetUserById.ts
export class GetUserByIdQuery {
  constructor(public readonly userId: string) {}
}

// Query Handler
// src/handlers/GetUserByIdHandler.ts
export class GetUserByIdHandler {
  constructor(private readRepo: UserReadRepository) {}

  async handle(query: GetUserByIdQuery): Promise<UserDto> { // ✅ Returns data
    return this.readRepo.findById(query.userId);
  }
}

// Write Model (normalized)
// src/write-model/User.ts
export class User {
  id: string;
  name: string;
  email: string;
}

// Read Model (denormalized, optimized for queries)
// src/read-model/UserListItem.ts
export interface UserListItem {
  id: string;
  displayName: string;
  email: string;
  lastLoginDate: Date;
  orderCount: number;  // Denormalized
  totalSpent: number;  // Denormalized
}
```

**When to Use:**
- High-traffic systems
- Different optimization needs for reads/writes
- Event sourcing
- Complex reporting requirements

---

### Event-Driven Architecture

Asynchronous communication via events.

**Structure:**
```
Publisher ──► Event Bus ──► Subscriber
              (Events)      (Handler)
```

**Usage:**

```typescript
import { eventDrivenArchitecture } from 'archunit-ts';

const rule = eventDrivenArchitecture()
  .events('events')
  .publishers('publishers')
  .subscribers('subscribers')
  .domain('domain')
  .eventBus('infrastructure/event-bus');

const violations = rule.check(classes);
```

**Key Rules:**
- Events are immutable (readonly properties, no setters)
- Publishers and Subscribers don't directly depend on each other
- Events have no dependencies on infrastructure
- EventBus doesn't depend on Publishers/Subscribers

**Example:**

```typescript
// Event (immutable)
// src/events/UserCreatedEvent.ts
export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly timestamp: Date = new Date()
  ) {}

  // ❌ No setters allowed - events must be immutable
}

// Publisher
// src/publishers/UserPublisher.ts
import { UserCreatedEvent } from '../events/UserCreatedEvent';
import { EventBus } from '../infrastructure/EventBus';

export class UserPublisher {
  constructor(private eventBus: EventBus) {}

  publishUserCreated(userId: string, email: string): void {
    const event = new UserCreatedEvent(userId, email);
    this.eventBus.publish(event);
  }
}

// Subscriber
// src/subscribers/EmailSubscriber.ts
import { UserCreatedEvent } from '../events/UserCreatedEvent';

export class EmailSubscriber {
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.sendWelcomeEmail(event.email);
  }
}

// Another Subscriber (independent)
// src/subscribers/AnalyticsSubscriber.ts
import { UserCreatedEvent } from '../events/UserCreatedEvent';

export class AnalyticsSubscriber {
  async handle(event: UserCreatedEvent): Promise<void> {
    await this.trackSignup(event.userId, event.timestamp);
  }
}
```

**When to Use:**
- Microservices
- Decoupled systems
- Asynchronous workflows
- Scalability requirements

---

### DDD (Domain-Driven Design)

Tactical patterns for domain modeling.

**Usage:**

```typescript
import { dddArchitecture } from 'archunit-ts';

const rule = dddArchitecture()
  .aggregates('domain/aggregates')
  .entities('domain/entities')
  .valueObjects('domain/value-objects')
  .domainServices('domain/services')
  .repositories('infrastructure/repositories')
  .factories('domain/factories')
  .applicationServices('application');

const violations = rule.check(classes);
```

**Key DDD Rules:**
- Value Objects don't depend on Entities or Aggregates
- Entities don't depend on Aggregates
- Repositories don't depend on Application Services
- Application Services orchestrate domain objects

**Example:**

```typescript
// Value Object (immutable, no identity)
// src/domain/value-objects/Email.ts
export class Email {
  private constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email');
    }
  }

  static create(email: string): Email {
    return new Email(email);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }

  private isValid(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// Entity (has identity)
// src/domain/entities/Order.ts
import { OrderId } from '../value-objects/OrderId';
import { Money } from '../value-objects/Money';

export class Order {
  constructor(
    private readonly id: OrderId,
    private total: Money,
    private status: OrderStatus
  ) {}

  getId(): OrderId {
    return this.id;
  }

  confirm(): void {
    if (this.status !== OrderStatus.DRAFT) {
      throw new Error('Only draft orders can be confirmed');
    }
    this.status = OrderStatus.CONFIRMED;
  }
}

// Aggregate Root
// src/domain/aggregates/Customer.ts
import { CustomerId } from '../value-objects/CustomerId';
import { Email } from '../value-objects/Email';
import { Order } from '../entities/Order';

export class Customer {
  private orders: Order[] = [];

  constructor(
    private readonly id: CustomerId,
    private email: Email
  ) {}

  placeOrder(order: Order): void {
    // Aggregate root enforces invariants
    if (this.hasUnpaidOrders()) {
      throw new Error('Cannot place order with unpaid orders');
    }
    this.orders.push(order);
  }

  private hasUnpaidOrders(): boolean {
    return this.orders.some(o => !o.isPaid());
  }
}

// Repository (interface in domain)
// src/domain/repositories/CustomerRepository.ts
import { Customer } from '../aggregates/Customer';
import { CustomerId } from '../value-objects/CustomerId';

export interface CustomerRepository {
  findById(id: CustomerId): Promise<Customer | null>;
  save(customer: Customer): Promise<void>;
}

// Repository implementation (in infrastructure)
// src/infrastructure/repositories/MongoCustomerRepository.ts
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';

export class MongoCustomerRepository implements CustomerRepository {
  async findById(id: CustomerId): Promise<Customer | null> {
    // MongoDB implementation
  }

  async save(customer: Customer): Promise<void> {
    // MongoDB implementation
  }
}
```

**When to Use:**
- Complex domain logic
- Ubiquitous language needed
- Long-lived projects
- Collaboration with domain experts

---

### Microservices Architecture

Independent, deployable services.

**Usage:**

```typescript
import { microservicesArchitecture } from 'archunit-ts';

const rule = microservicesArchitecture()
  .service('UserService', 'services/user')
  .service('OrderService', 'services/order')
  .service('PaymentService', 'services/payment')
  .sharedKernel('shared/kernel')
  .apiGateway('api-gateway');

const violations = rule.check(classes);
```

**Key Rules:**
- Services can only access Shared Kernel (not other services)
- API Gateway can access all services
- Shared Kernel doesn't depend on services

**Example:**

```typescript
// Shared Kernel (common code)
// src/shared/kernel/types/Money.ts
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}
}

// Service 1 (independent)
// src/services/user/UserService.ts
import { Money } from '../../shared/kernel/types/Money'; // ✅ Can access shared kernel

export class UserService {
  // ❌ Cannot import from OrderService or PaymentService
}

// Service 2 (independent)
// src/services/order/OrderService.ts
import { Money } from '../../shared/kernel/types/Money'; // ✅ Can access shared kernel

export class OrderService {
  // Services communicate via events or API, not direct imports
}

// API Gateway
// src/api-gateway/Gateway.ts
import { UserService } from '../services/user/UserService';
import { OrderService } from '../services/order/OrderService';

export class ApiGateway {
  // ✅ Gateway can access all services
  constructor(
    private userService: UserService,
    private orderService: OrderService
  ) {}
}
```

**When to Use:**
- Large teams
- Independent deployment needed
- Different scaling requirements per service
- Polyglot architecture

---

## Combining Patterns

You can combine multiple patterns:

```typescript
import {
  cleanArchitecture,
  cqrsArchitecture,
  eventDrivenArchitecture,
  RuleComposer
} from 'archunit-ts';

// Clean Architecture + CQRS
const cleanCqrs = RuleComposer.allOf([
  cleanArchitecture()
    .entities('domain/entities')
    .useCases('application/usecases')
    .toLayeredArchitecture(),

  cqrsArchitecture()
    .commands('application/commands')
    .queries('application/queries')
    .handlers('application/handlers')
]);

// Event-Driven + Microservices
const eventDrivenMicroservices = RuleComposer.allOf([
  eventDrivenArchitecture()
    .events('shared/events')
    .publishers('services/*/publishers')
    .subscribers('services/*/subscribers'),

  microservicesArchitecture()
    .service('UserService', 'services/user')
    .service('OrderService', 'services/order')
    .sharedKernel('shared')
]);
```

---

## Custom Patterns

Create your own patterns by extending BaseArchRule:

```typescript
import { BaseArchRule } from 'archunit-ts';
import { TSClasses, ArchitectureViolation } from 'archunit-ts';

export class MyCustomArchitecture extends BaseArchRule {
  private layerA?: string[];
  private layerB?: string[];

  constructor() {
    super('My Custom Architecture');
  }

  public layerA(...packages: string[]): this {
    this.layerA = packages;
    return this;
  }

  public layerB(...packages: string[]): this {
    this.layerB = packages;
    return this;
  }

  public check(classes: TSClasses): ArchitectureViolation[] {
    // Custom validation logic
    const violations: ArchitectureViolation[] = [];

    // Your rules here...

    return violations;
  }
}
```

---

## Best Practices

### 1. Start Simple

```typescript
// ✅ GOOD: Start with basic layered architecture
const rule = layeredArchitecture()
  .layer('API').definedBy('api')
  .layer('Business').definedBy('business')
  .layer('Data').definedBy('data');
```

### 2. Evolve Gradually

```typescript
// As complexity grows, add more layers
const rule = layeredArchitecture()
  .layer('Controllers').definedBy('api/controllers')
  .layer('Services').definedBy('business/services')
  .layer('Domain').definedBy('business/domain')
  .layer('Repositories').definedBy('data/repositories');
```

### 3. Test Early

```typescript
// Add to your test suite
describe('Architecture', () => {
  it('should follow layered architecture', async () => {
    const classes = await analyzer.analyze('./src');
    const violations = rule.check(classes);
    expect(violations).toHaveLength(0);
  });
});
```

### 4. Use in CI/CD

```typescript
// In your CI script
const violations = await archUnit.checkRule('./src', rule);
if (violations.length > 0) {
  console.error(formatViolations(violations));
  process.exit(1);
}
```

### 5. Combine with Metrics

```typescript
import { ArchitecturalMetricsAnalyzer } from 'archunit-ts';

const classes = await analyzer.analyze('./src');
const violations = rule.check(classes);
const metrics = new ArchitecturalMetricsAnalyzer(classes, violations);

console.log(ArchitecturalMetricsAnalyzer.formatMetrics(metrics.calculateMetrics()));
```

### 6. Document Your Pattern

```typescript
// Create a factory function for your specific architecture
export function createMyProjectArchitecture() {
  return cleanArchitecture()
    .entities('src/domain/entities')
    .useCases('src/application/use-cases')
    .controllers('src/presentation/controllers')
    .gateways('src/infrastructure/gateways')
    .toLayeredArchitecture();
}

// Use consistently across your project
const rule = createMyProjectArchitecture();
```

---

## API Reference

### Pattern Factory Functions

```typescript
// Layered Architecture
function layeredArchitecture(): LayeredArchitecture

// Clean Architecture
function cleanArchitecture(): CleanArchitecture

// Hexagonal/Ports & Adapters
function portsAndAdaptersArchitecture(): PortsAndAdaptersArchitecture

// MVC
function mvcArchitecture(): MVCArchitecture

// MVVM
function mvvmArchitecture(): MVVMArchitecture

// CQRS
function cqrsArchitecture(): CQRSArchitecture

// Event-Driven
function eventDrivenArchitecture(): EventDrivenArchitecture

// DDD
function dddArchitecture(): DDDArchitecture

// Microservices
function microservicesArchitecture(): MicroservicesArchitecture
```

### Common Methods

All patterns extend BaseArchRule and implement:

```typescript
interface ArchitecturePattern {
  check(classes: TSClasses): ArchitectureViolation[];
  asWarning(): this;
  asError(): this;
  getSeverity(): Severity;
}
```

### LayeredArchitecture API

```typescript
class LayeredArchitecture {
  layer(name: string): LayerDefinition;
  whereLayer(name: string): LayerAccessRuleBuilder;
}

class LayerDefinition {
  definedBy(...packages: string[]): LayeredArchitecture;
}

class LayerAccessRuleBuilder {
  mayOnlyAccessLayers(...layers: string[]): LayeredArchitecture;
  mayNotAccessLayers(...layers: string[]): LayeredArchitecture;
}
```

### Pattern-Specific APIs

See individual pattern sections for detailed APIs and examples.

---

## Examples

### Complete Express.js Application

```typescript
import { layeredArchitecture, ArchUnitTS } from 'archunit-ts';

const rule = layeredArchitecture()
  .layer('Routes').definedBy('routes')
  .layer('Controllers').definedBy('controllers')
  .layer('Services').definedBy('services')
  .layer('Models').definedBy('models')
  .layer('Database').definedBy('database')

  .whereLayer('Routes').mayOnlyAccessLayers('Controllers')
  .whereLayer('Controllers').mayOnlyAccessLayers('Services', 'Models')
  .whereLayer('Services').mayOnlyAccessLayers('Models', 'Database')
  .whereLayer('Models').mayNotAccessLayers('Routes', 'Controllers', 'Services', 'Database')
  .whereLayer('Database').mayOnlyAccessLayers('Models');

const archUnit = new ArchUnitTS();
const violations = await archUnit.checkRule('./src', rule);
ArchUnitTS.assertNoViolations(violations);
```

### React Application with MVVM

```typescript
import { mvvmArchitecture } from 'archunit-ts';

const rule = mvvmArchitecture()
  .models('src/models')
  .viewModels('src/viewmodels')
  .views('src/components');

// Ensures:
// - Components only import ViewModels
// - ViewModels only import Models
// - Models are pure and independent
```

### Microservices with Event-Driven

```typescript
import { microservicesArchitecture, eventDrivenArchitecture, RuleComposer } from 'archunit-ts';

const microservicesRule = microservicesArchitecture()
  .service('Auth', 'services/auth')
  .service('Orders', 'services/orders')
  .service('Payments', 'services/payments')
  .sharedKernel('shared')
  .apiGateway('gateway');

const eventRule = eventDrivenArchitecture()
  .events('shared/events')
  .publishers('services/*/publishers')
  .subscribers('services/*/subscribers')
  .eventBus('infrastructure/event-bus');

const combined = RuleComposer.allOf([microservicesRule, eventRule]);
```

---

## Next Steps

- [Rule Composition](./RULE_COMPOSITION.md) - Combine patterns with logical operators
- [Violation Intelligence](./VIOLATION_INTELLIGENCE.md) - Smart violation analysis
- [Architectural Metrics](./ARCHITECTURAL_METRICS.md) - Measure architecture quality
- [Testing Guide](./TESTING.md) - Test your architectural rules

---

## Glossary

- **Layer** - Horizontal slice of functionality
- **Dependency Rule** - Direction of allowed dependencies
- **Bounded Context** - Explicit boundary within a domain (DDD)
- **Aggregate** - Cluster of entities treated as a unit (DDD)
- **Port** - Interface for external communication
- **Adapter** - Implementation of a port
- **Command** - Request to perform an action
- **Query** - Request to retrieve data
- **Event** - Fact that something happened
- **Publisher** - Emits events
- **Subscriber** - Reacts to events
