/**
 * Comprehensive tests for WatchMode
 */

import { WatchMode } from '../../src/cli/WatchMode';
import { ArchUnitTS } from '../../src/index';
import * as chokidar from 'chokidar';

// Mock dependencies
jest.mock('chokidar');
jest.mock('../../src/index');

describe('WatchMode', () => {
  let mockWatcher: any;
  let mockArchUnit: any;
  let consoleSpy: jest.SpyInstance;
  let stdoutSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock watcher
    mockWatcher = {
      on: jest.fn().mockReturnThis(),
      close: jest.fn().mockResolvedValue(undefined),
    };

    (chokidar.watch as jest.Mock) = jest.fn().mockReturnValue(mockWatcher);

    // Mock ArchUnitTS
    mockArchUnit = {
      checkRules: jest.fn().mockResolvedValue([]),
    };

    (ArchUnitTS as unknown as jest.Mock).mockImplementation(() => mockArchUnit);

    // Spy on console methods
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    stdoutSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

    jest.useFakeTimers();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
    stdoutSpy.mockRestore();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create watch mode with required options', () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      expect(watchMode).toBeDefined();
    });

    it('should use custom patterns when provided', () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        patterns: ['src/**/*.ts'],
      });

      expect(watchMode).toBeDefined();
    });

    it('should use custom debounce time', () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        debounceMs: 500,
      });

      expect(watchMode).toBeDefined();
    });

    it('should respect noColor option', () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        noColor: true,
      });

      expect(watchMode).toBeDefined();
    });
  });

  describe('Start', () => {
    it('should start watching and run initial check', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      jest.advanceTimersByTime(100);

      expect(chokidar.watch).toHaveBeenCalled();
      expect(mockArchUnit.checkRules).toHaveBeenCalled();

      await watchMode.stop();
    });

    it('should setup file watchers with correct options', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      expect(chokidar.watch).toHaveBeenCalledWith(
        expect.arrayContaining([expect.stringContaining('/test')]),
        expect.objectContaining({
          ignored: expect.arrayContaining(['**/node_modules/**']),
          persistent: true,
        })
      );

      await watchMode.stop();
    });

    it('should register event handlers', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      expect(mockWatcher.on).toHaveBeenCalledWith('add', expect.any(Function));
      expect(mockWatcher.on).toHaveBeenCalledWith('change', expect.any(Function));
      expect(mockWatcher.on).toHaveBeenCalledWith('unlink', expect.any(Function));
      expect(mockWatcher.on).toHaveBeenCalledWith('error', expect.any(Function));

      await watchMode.stop();
    });
  });

  describe('Stop', () => {
    it('should stop watcher and cleanup', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      await watchMode.stop();

      expect(mockWatcher.close).toHaveBeenCalled();
    });

    it('should handle stop when not started', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      await watchMode.stop();
      expect(mockWatcher.close).not.toHaveBeenCalled();
    });

    it('should clear debounce timer on stop', async () => {
      const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      changeHandler('/test/file.ts');

      await watchMode.stop();
      expect(clearTimeoutSpy).toHaveBeenCalled();

      clearTimeoutSpy.mockRestore();
    });
  });

  describe('File Change Handling', () => {
    it('should handle file changed event', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        verbose: true,
      });

      watchMode.start();
      await Promise.resolve();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      changeHandler('/test/file.ts');

      jest.advanceTimersByTime(400);

      expect(mockArchUnit.checkRules).toHaveBeenCalled();

      await watchMode.stop();
    });

    it('should debounce multiple rapid changes', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        debounceMs: 300,
      });

      watchMode.start();
      await Promise.resolve();

      mockArchUnit.checkRules.mockClear();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];

      // Trigger multiple rapid changes
      changeHandler('/test/file1.ts');
      jest.advanceTimersByTime(100);
      changeHandler('/test/file2.ts');
      jest.advanceTimersByTime(100);
      changeHandler('/test/file3.ts');
      jest.advanceTimersByTime(200);

      expect(mockArchUnit.checkRules).toHaveBeenCalledTimes(1);

      await watchMode.stop();
    });

    it('should show file changes in verbose mode', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        verbose: true,
      });

      watchMode.start();
      await Promise.resolve();

      consoleSpy.mockClear();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      changeHandler('/test/file.ts');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('[changed]'));

      await watchMode.stop();
    });

    it('should use colors for events when enabled', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        verbose: true,
        noColor: false,
      });

      watchMode.start();
      await Promise.resolve();

      consoleSpy.mockClear();

      const addHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'add')[1];
      addHandler('/test/file.ts');

      const calls = consoleSpy.mock.calls.map((call) => call.join(''));
      const hasColorCodes = calls.some((call) => call.includes('\x1b['));
      expect(hasColorCodes).toBe(true);

      await watchMode.stop();
    });

    it('should not use colors when disabled', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        verbose: true,
        noColor: true,
      });

      watchMode.start();
      await Promise.resolve();

      consoleSpy.mockClear();

      const addHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'add')[1];
      addHandler('/test/file.ts');

      const calls = consoleSpy.mock.calls.map((call) => call.join(''));
      const hasColorCodes = calls.some((call) => call.includes('\x1b['));
      expect(hasColorCodes).toBe(false);

      await watchMode.stop();
    });
  });

  describe('Check Execution', () => {
    it('should display no violations message when clean', async () => {
      mockArchUnit.checkRules.mockResolvedValue([]);

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      jest.advanceTimersByTime(100);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('No architecture violations')
      );

      await watchMode.stop();
    });

    it('should display violations when found', async () => {
      mockArchUnit.checkRules.mockResolvedValue([
        {
          rule: 'Test Rule',
          message: 'Test violation',
          filePath: '/test/file.ts',
          severity: 'error',
        },
      ]);

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      jest.advanceTimersByTime(100);

      expect(consoleSpy).toHaveBeenCalled();

      await watchMode.stop();
    });

    it('should show changed files count', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      changeHandler('/test/file1.ts');
      changeHandler('/test/file2.ts');
      changeHandler('/test/file3.ts');

      consoleSpy.mockClear();
      jest.advanceTimersByTime(400);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Changed files (3)'));

      await watchMode.stop();
    });

    it('should limit displayed changed files to 10', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      for (let i = 1; i <= 15; i++) {
        changeHandler(`/test/file${i}.ts`);
      }

      consoleSpy.mockClear();
      jest.advanceTimersByTime(400);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('and 5 more'));

      await watchMode.stop();
    });
  });

  describe('Error Handling', () => {
    it('should handle watch errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();

      const errorHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'error')[1];
      errorHandler(new Error('Watch error'));

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      await watchMode.stop();
    });

    it('should handle check errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockArchUnit.checkRules.mockRejectedValue(new Error('Check error'));

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      jest.advanceTimersByTime(100);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      await watchMode.stop();
    });

    it('should handle non-Error exceptions', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockArchUnit.checkRules.mockRejectedValue('String error');

      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
      });

      watchMode.start();
      await Promise.resolve();
      jest.advanceTimersByTime(100);

      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      await watchMode.stop();
    });
  });

  describe('Console Clearing', () => {
    it('should clear console with ANSI codes when colors enabled', async () => {
      const watchMode = new WatchMode({
        basePath: '/test',
        config: { rules: [] },
        noColor: false,
      });

      watchMode.start();
      await Promise.resolve();

      stdoutSpy.mockClear();

      const changeHandler = mockWatcher.on.mock.calls.find((call: any) => call[0] === 'change')[1];
      changeHandler('/test/file.ts');
      jest.advanceTimersByTime(400);

      expect(stdoutSpy).toHaveBeenCalledWith(expect.stringContaining('\x1b[2J'));

      await watchMode.stop();
    });
  });
});
