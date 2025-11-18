import * as fs from 'fs';
import * as path from 'path';
import { ReportManager } from '../../src/reports/ReportManager';
import { ReportFormat } from '../../src/reports/types';
import { Severity } from '../../src/types';

describe('ReportManager', () => {
  let manager: ReportManager;
  let tempDir: string;

  beforeEach(() => {
    manager = new ReportManager();
    tempDir = path.join(__dirname, 'temp-report-' + Date.now());
  });

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore
      }
    }
  });

  it('should create report manager', () => {
    expect(manager).toBeDefined();
  });

  it('should generate JSON report', async () => {
    const violations = [
      {
        message: 'Test',
        filePath: '/src/Test.ts',
        rule: 'Test rule',
        severity: Severity.ERROR,
      },
    ];

    const outputPath = path.join(tempDir, 'report.json');
    const result = await manager.generateReport(violations, {
      format: ReportFormat.JSON,
      outputPath,
    });

    expect(result).toBe(outputPath);
    expect(fs.existsSync(outputPath)).toBe(true);
  });
});
