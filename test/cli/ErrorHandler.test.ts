import { ErrorHandler } from '../../src/cli/ErrorHandler';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  it('should create error handler', () => {
    expect(handler).toBeDefined();
  });

  it('should parse errors', () => {
    const error = new Error('test.ts(10,5): error TS2304');
    const parsed = handler.parseError(error);

    expect(parsed.type).toBe('compilation');
  });

  it('should format errors', () => {
    const error = new Error('Test error');
    const formatted = handler.formatError(error, { colors: false });

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
  });

  it('should return exit codes', () => {
    const error = new Error('test.ts(10,5): error TS2304');
    const exitCode = handler.getExitCode(error);

    expect(exitCode).toBe(1);
  });
});
