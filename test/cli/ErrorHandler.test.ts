import { ErrorHandler, ErrorType } from '../../src/cli/ErrorHandler';

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler(false); // Disable colors for testing
  });

  it('should create error handler', () => {
    expect(handler).toBeDefined();
  });

  it('should parse configuration errors', () => {
    const error = new Error('Cannot find module config');
    const parsed = handler.parseError(error);

    expect(parsed.type).toBe(ErrorType.CONFIGURATION);
    expect(parsed.suggestions.length).toBeGreaterThan(0);
  });

  it('should parse file system errors', () => {
    const error = new Error('ENOENT: no such file or directory');
    const parsed = handler.parseError(error);

    expect(parsed.type).toBe(ErrorType.FILE_SYSTEM);
    expect(parsed.suggestions.length).toBeGreaterThan(0);
  });

  it('should format errors', () => {
    const error = new Error('Test error');
    const parsed = handler.parseError(error);
    const formatted = handler.formatError(parsed);

    expect(formatted).toBeDefined();
    expect(typeof formatted).toBe('string');
    expect(formatted).toContain('Error');
  });

  it('should format with suggestions', () => {
    const error = new Error('Config not found');
    const parsed = handler.parseError(error);
    const formatted = handler.formatError(parsed);

    expect(formatted).toContain('Suggestions');
  });
});
