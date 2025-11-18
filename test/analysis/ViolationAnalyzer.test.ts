import { ViolationAnalyzer } from '../../src/analysis/ViolationAnalyzer';
import { ArchitectureViolation, Severity } from '../../src/types';

describe('ViolationAnalyzer', () => {
  let analyzer: ViolationAnalyzer;
  let sampleViolations: ArchitectureViolation[];

  beforeEach(() => {
    sampleViolations = [
      {
        message: "Class 'UserService' should end with 'Repository'",
        filePath: '/src/UserService.ts',
        rule: 'Repository naming convention',
        severity: Severity.ERROR,
      },
      {
        message: "Class 'OrderService' should end with 'Repository'",
        filePath: '/src/OrderService.ts',
        rule: 'Repository naming convention',
        severity: Severity.ERROR,
      },
    ];
  });

  it('should create violation analyzer', () => {
    analyzer = new ViolationAnalyzer(sampleViolations);
    expect(analyzer).toBeDefined();
  });

  it('should enhance violations', () => {
    analyzer = new ViolationAnalyzer(sampleViolations);
    const enhanced = analyzer.enhance();

    expect(enhanced).toHaveLength(2);
    enhanced.forEach((v) => {
      expect(v.id).toBeDefined();
      expect(v.category).toBeDefined();
      expect(v.impactScore).toBeDefined();
    });
  });

  it('should group by root cause', () => {
    analyzer = new ViolationAnalyzer(sampleViolations);
    const groups = analyzer.groupByRootCause();

    expect(groups).toBeDefined();
    expect(groups.length).toBeGreaterThan(0);
  });

  it('should perform full analysis', () => {
    analyzer = new ViolationAnalyzer(sampleViolations);
    const analysis = analyzer.analyze();

    expect(analysis.total).toBe(2);
    expect(analysis.groups).toBeDefined();
    expect(analysis.topPriority).toBeDefined();
  });
});
