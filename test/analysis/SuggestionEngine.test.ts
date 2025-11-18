import { SuggestionEngine } from '../../src/analysis/SuggestionEngine';
import { ArchitectureViolation, Severity } from '../../src/types';

describe('SuggestionEngine', () => {
  let engine: SuggestionEngine;

  beforeEach(() => {
    engine = new SuggestionEngine();
  });

  it('should create suggestion engine', () => {
    expect(engine).toBeDefined();
  });

  it('should generate fix for naming violations', () => {
    const violation: ArchitectureViolation = {
      message: "Class 'UserManager' should end with 'Service'",
      filePath: '/src/UserManager.ts',
      rule: 'Service naming convention',
      severity: Severity.ERROR,
    };

    const fix = engine.generateFix(violation);
    expect(fix).toBeDefined();
    expect(fix?.description).toContain('Service');
  });

  it('should generate alternatives', () => {
    const violation: ArchitectureViolation = {
      message: "Class 'User' should end with 'Service'",
      filePath: '/src/User.ts',
      rule: "Services should end with 'Service'",
      severity: Severity.ERROR,
    };

    const alternatives = engine.generateAlternatives(violation);
    expect(alternatives).toContain('UserService');
  });
});
