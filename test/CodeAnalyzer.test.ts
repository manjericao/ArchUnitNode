import { CodeAnalyzer } from '../src/analyzer/CodeAnalyzer';
import * as path from 'path';

describe('CodeAnalyzer', () => {
  let analyzer: CodeAnalyzer;
  const fixturesPath = path.join(__dirname, 'fixtures', 'sample-code');

  beforeEach(() => {
    analyzer = new CodeAnalyzer();
  });

  it('should analyze TypeScript files', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    expect(classes.size()).toBeGreaterThan(0);
  });

  it('should find classes in the codebase', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const allClasses = classes.getAll();

    const classNames = allClasses.map((c) => c.name);
    expect(classNames).toContain('UserService');
    expect(classNames).toContain('UserController');
    expect(classNames).toContain('UserRepository');
    expect(classNames).toContain('User');
  });

  it('should identify decorators', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const userService = classes.getAll().find((c) => c.name === 'UserService');

    expect(userService).toBeDefined();
    expect(userService!.isAnnotatedWith('Service')).toBe(true);
  });

  it('should filter classes by package', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const services = classes.resideInPackage('services');

    expect(services.size()).toBeGreaterThan(0);
    const serviceClasses = services.getAll();
    expect(serviceClasses.some((c) => c.name === 'UserService')).toBe(true);
  });

  it('should identify class properties', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const user = classes.getAll().find((c) => c.name === 'User');

    expect(user).toBeDefined();
    expect(user!.properties.length).toBeGreaterThan(0);
  });

  it('should identify class methods', async () => {
    const classes = await analyzer.analyze(fixturesPath);
    const userService = classes.getAll().find((c) => c.name === 'UserService');

    expect(userService).toBeDefined();
    expect(userService!.methods.length).toBeGreaterThan(0);
    const methodNames = userService!.methods.map((m) => m.name);
    expect(methodNames).toContain('getUser');
    expect(methodNames).toContain('createUser');
  });
});
