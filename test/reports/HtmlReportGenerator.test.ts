import { HtmlReportGenerator } from '../../src/reports/HtmlReportGenerator';
import { ReportData, ReportFormat } from '../../src/reports/types';
import { Severity } from '../../src/types';

describe('HtmlReportGenerator', () => {
  let generator: HtmlReportGenerator;

  beforeEach(() => {
    generator = new HtmlReportGenerator();
  });

  it('should create HTML generator', () => {
    expect(generator).toBeDefined();
  });

  it('should generate valid HTML', () => {
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

    const html = generator.generate(data, {
      format: ReportFormat.HTML,
      outputPath: '/tmp/test.html',
    });

    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('</html>');
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

    const html = generator.generate(data, {
      format: ReportFormat.HTML,
      outputPath: '/tmp/test.html',
    });

    expect(html).toContain('Test violation');
  });

  it('should return .html extension', () => {
    expect(generator.getFileExtension()).toBe('.html');
  });
});
