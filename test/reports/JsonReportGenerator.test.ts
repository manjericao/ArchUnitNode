import { JsonReportGenerator } from '../../src/reports/JsonReportGenerator';
import { ReportData, ReportFormat } from '../../src/reports/types';
import { Severity } from '../../src/types';

describe('JsonReportGenerator', () => {
  let generator: JsonReportGenerator;

  beforeEach(() => {
    generator = new JsonReportGenerator();
  });

  it('should create JSON generator', () => {
    expect(generator).toBeDefined();
  });

  it('should generate valid JSON', () => {
    const data: ReportData = {
      metadata: {
        title: 'Test',
        timestamp: new Date().toISOString(),
        totalFiles: 0,
        totalViolations: 0,
        rulesChecked: 0,
      },
      violations: [],
    };

    const json = generator.generate(data, {
      format: ReportFormat.JSON,
      outputPath: '/tmp/test.json',
    });

    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('should include violations', () => {
    const data: ReportData = {
      metadata: {
        title: 'Test',
        timestamp: new Date().toISOString(),
        totalFiles: 1,
        totalViolations: 1,
        rulesChecked: 1,
      },
      violations: [
        {
          message: 'Test violation',
          filePath: '/src/Test.ts',
          rule: 'Test rule',
          severity: Severity.ERROR,
        },
      ],
    };

    const json = generator.generate(data, {
      format: ReportFormat.JSON,
      outputPath: '/tmp/test.json',
    });

    const parsed = JSON.parse(json);
    expect(parsed.violations).toHaveLength(1);
  });

  it('should return .json extension', () => {
    expect(generator.getFileExtension()).toBe('.json');
  });
});
