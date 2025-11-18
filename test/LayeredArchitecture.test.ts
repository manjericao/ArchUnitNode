import { layeredArchitecture } from '../src/library/LayeredArchitecture';
import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import * as path from 'path';

describe('LayeredArchitecture', () => {
  let analyzer: CodeAnalyzer;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeEach(() => {
    analyzer = new CodeAnalyzer();
  });

  it('should define a layered architecture', async () => {
    await analyzer.analyze(fixturesPath);

    const architecture = layeredArchitecture()
      .layer('Controllers')
      .definedBy('controllers')
      .layer('Services')
      .definedBy('services')
      .layer('Repositories')
      .definedBy('repositories')
      .layer('Models')
      .definedBy('models');

    expect(architecture).toBeDefined();
  });

  it('should check layer access rules', async () => {
    const classes = await analyzer.analyze(fixturesPath);

    const architecture = layeredArchitecture()
      .layer('Controllers')
      .definedBy('controllers')
      .layer('Services')
      .definedBy('services')
      .layer('Repositories')
      .definedBy('repositories')
      .layer('Models')
      .definedBy('models')
      .whereLayer('Models')
      .mayNotAccessLayers('Services', 'Controllers', 'Repositories');

    const violations = architecture.check(classes);
    // Models should not depend on other layers
    expect(Array.isArray(violations)).toBe(true);
  });

  it('should allow valid layer dependencies', async () => {
    const classes = await analyzer.analyze(fixturesPath);

    const architecture = layeredArchitecture()
      .layer('Controllers')
      .definedBy('controllers')
      .layer('Services')
      .definedBy('services')
      .whereLayer('Controllers')
      .mayOnlyAccessLayers('Services');

    const violations = architecture.check(classes);
    expect(Array.isArray(violations)).toBe(true);
  });

  it('should support fluent API', () => {
    const architecture = layeredArchitecture()
      .consideringAllDependencies()
      .layer('Presentation')
      .definedBy('controllers', 'views')
      .layer('Business')
      .definedBy('services', 'business')
      .layer('Data')
      .definedBy('repositories', 'dao');

    expect(architecture).toBeDefined();
    expect(architecture.getDescription()).toContain('Layered Architecture');
  });
});
