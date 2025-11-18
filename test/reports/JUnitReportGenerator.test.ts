import { JUnitReportGenerator } from '../../src/reports/JUnitReportGenerator';
import { ReportData, ReportFormat } from '../../src/reports/types';
import { Severity } from '../../src/types';

describe('JUnitReportGenerator', () => {
  let generator: JUnitReportGenerator;

  beforeEach(() => {
    generator = new JUnitReportGenerator();
  });

  it('should create JUnit generator', () => {
    expect(generator).toBeDefined();
  });

  it('should generate valid XML', () => {
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

    const xml = generator.generate(data, {
      format: ReportFormat.JUNIT,
      outputPath: '/tmp/test.xml',
    });

    expect(xml).toContain('<?xml version="1.0"');
    expect(xml).toContain('<testsuites');
  });

  it('should include failures', () => {
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

    const xml = generator.generate(data, {
      format: ReportFormat.JUNIT,
      outputPath: '/tmp/test.xml',
    });

    expect(xml).toContain('<failure');
  });

  it('should return .xml extension', () => {
    expect(generator.getFileExtension()).toBe('.xml');
  });
});
