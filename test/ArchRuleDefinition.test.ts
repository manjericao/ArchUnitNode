import { ArchRuleDefinition } from '../src/lang/ArchRuleDefinition';
import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import * as path from 'path';

describe('ArchRuleDefinition', () => {
  let analyzer: CodeAnalyzer;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeEach(() => {
    analyzer = new CodeAnalyzer();
  });

  describe('Naming conventions', () => {
    it('should check that classes ending with "Service" reside in services package', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });

    it('should check that classes ending with "Controller" reside in controllers package', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Controller')
        .should()
        .resideInPackage('controllers');

      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });

    it('should detect violations when naming conventions are not followed', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      // This should fail because User is in models, not services
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('models');

      const violations = rule.check(classes);
      expect(violations.length).toBeGreaterThan(0);
    });
  });

  describe('Decorator/Annotation rules', () => {
    it('should check that classes with @Service decorator reside in services', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .areAnnotatedWith('Service')
        .should()
        .resideInPackage('services');

      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });

    it('should check that classes with @Controller decorator reside in controllers', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .areAnnotatedWith('Controller')
        .should()
        .resideInPackage('controllers');

      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });

    it('should check that classes are annotated with specific decorator', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const rule = ArchRuleDefinition.classes()
        .that()
        .resideInPackage('services')
        .should()
        .beAnnotatedWith('Service');

      const violations = rule.check(classes);
      expect(violations).toHaveLength(0);
    });
  });

  describe('Package rules', () => {
    it('should filter classes by package pattern', async () => {
      const classes = await analyzer.analyze(fixturesPath);

      const serviceClasses = classes.resideInPackage('services');
      const controllerClasses = classes.resideInPackage('controllers');

      expect(serviceClasses.size()).toBeGreaterThan(0);
      expect(controllerClasses.size()).toBeGreaterThan(0);
    });
  });

  describe('Rule description', () => {
    it('should provide a human-readable description', () => {
      const rule = ArchRuleDefinition.classes()
        .that()
        .haveSimpleNameEndingWith('Service')
        .should()
        .resideInPackage('services');

      const description = rule.getDescription();
      expect(description).toBeDefined();
      expect(typeof description).toBe('string');
    });
  });
});
