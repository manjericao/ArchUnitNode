import { MarkdownReportGenerator } from '../../src/reports/MarkdownReportGenerator';
import { ReportData, ReportFormat } from '../../src/reports/types';
import { Severity } from '../../src/types';

describe('MarkdownReportGenerator', () => {
  let generator: MarkdownReportGenerator;

  beforeEach(() => {
    generator = new MarkdownReportGenerator();
  });

  it('should create Markdown generator', () => {
    expect(generator).toBeDefined();
  });

  it('should generate valid markdown', () => {
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

    const md = generator.generate(data, {
      format: ReportFormat.MARKDOWN,
      outputPath: '/tmp/test.md',
    });

    expect(md).toContain('# ArchUnit Architecture Report');
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

    const md = generator.generate(data, {
      format: ReportFormat.MARKDOWN,
      outputPath: '/tmp/test.md',
    });

    expect(md).toContain('🚨 Violations');
  });

  it('should return .md extension', () => {
    expect(generator.getFileExtension()).toBe('.md');
  });
});
