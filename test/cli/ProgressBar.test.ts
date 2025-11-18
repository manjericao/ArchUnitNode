/**
 * Comprehensive tests for ProgressBar, Spinner, and MultiProgressBar
 */

import { ProgressBar, Spinner, MultiProgressBar } from '../../src/cli/ProgressBar';

// Mock stdout.write to capture output
let writtenOutput: string[] = [];
const originalWrite = process.stdout.write;

beforeEach(() => {
  writtenOutput = [];
  // @ts-expect-error - Mocking stdout.write
  process.stdout.write = jest.fn((str: string) => {
    writtenOutput.push(str);
    return true;
  });
});

afterEach(() => {
  process.stdout.write = originalWrite;
});

describe('ProgressBar', () => {
  describe('Constructor', () => {
    it('should create progress bar with required options', () => {
      const bar = new ProgressBar({ total: 100 });

      expect(bar).toBeDefined();
    });

    it('should use default width if not provided', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(50);

      const output = writtenOutput.join('');
      // Should contain progress bar characters
      expect(output).toContain('█');
      expect(output).toContain('░');
    });

    it('should use custom width when provided', () => {
      const bar = new ProgressBar({ total: 100, width: 20 });
      bar.update(50);

      const output = writtenOutput.join('');
      expect(output).toContain('█');
    });

    it('should use default label if not provided', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(50);

      const output = writtenOutput.join('');
      expect(output).toContain('Progress:');
    });

    it('should use custom label when provided', () => {
      const bar = new ProgressBar({ total: 100, label: 'Testing' });
      bar.update(50);

      const output = writtenOutput.join('');
      expect(output).toContain('Testing:');
    });
  });

  describe('Update', () => {
    it('should update progress', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.update(25);

      const output = writtenOutput.join('');
      expect(output).toContain('25.0%');
      expect(output).toContain('25/100');
    });

    it('should update progress and label', () => {
      const bar = new ProgressBar({ total: 100, label: 'Initial' });
      writtenOutput = [];

      bar.update(50, 'Updated Label');

      const output = writtenOutput.join('');
      expect(output).toContain('Updated Label:');
      expect(output).toContain('50.0%');
    });

    it('should handle 0 progress', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.update(0);

      const output = writtenOutput.join('');
      expect(output).toContain('0.0%');
      expect(output).toContain('ETA: --');
    });

    it('should handle 100% progress', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.update(100);

      const output = writtenOutput.join('');
      expect(output).toContain('100.0%');
      expect(output).toContain('100/100');
    });

    it('should handle progress over 100%', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.update(150);

      const output = writtenOutput.join('');
      // Should cap at 100%
      expect(output).toContain('100.0%');
    });

    it('should update label without changing progress', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(50);
      writtenOutput = [];

      bar.update(50, 'New Label');

      const output = writtenOutput.join('');
      expect(output).toContain('New Label:');
      expect(output).toContain('50.0%');
    });
  });

  describe('Increment', () => {
    it('should increment progress by 1', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(10);
      writtenOutput = [];

      bar.increment();

      const output = writtenOutput.join('');
      expect(output).toContain('11/100');
    });

    it('should increment and update label', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(10);
      writtenOutput = [];

      bar.increment('Processing item 11');

      const output = writtenOutput.join('');
      expect(output).toContain('Processing item 11:');
      expect(output).toContain('11/100');
    });

    it('should increment from 0', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.increment();

      const output = writtenOutput.join('');
      expect(output).toContain('1/100');
    });
  });

  describe('Complete', () => {
    it('should set progress to 100% and add newline', () => {
      const bar = new ProgressBar({ total: 100 });
      bar.update(50);
      writtenOutput = [];

      bar.complete();

      const output = writtenOutput.join('');
      expect(output).toContain('100.0%');
      expect(output).toContain('100/100');
      expect(output).toContain('\n');
    });

    it('should complete from 0', () => {
      const bar = new ProgressBar({ total: 50 });
      writtenOutput = [];

      bar.complete();

      const output = writtenOutput.join('');
      expect(output).toContain('100.0%');
      expect(output).toContain('50/50');
    });
  });

  describe('ETA Calculation', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should show ETA in seconds for short remaining time', () => {
      const bar = new ProgressBar({ total: 100 });

      bar.update(10);
      jest.advanceTimersByTime(1000); // 1 second elapsed for 10%

      writtenOutput = [];
      bar.update(50); // 50% done

      const output = writtenOutput.join('');
      expect(output).toContain('ETA:');
      expect(output).toMatch(/\d+s/);
    });

    it('should show ETA in minutes and seconds for longer times', () => {
      const bar = new ProgressBar({ total: 100 });

      bar.update(1);
      jest.advanceTimersByTime(120000); // 2 minutes for 1%

      writtenOutput = [];
      bar.update(2);

      const output = writtenOutput.join('');
      expect(output).toContain('ETA:');
      expect(output).toMatch(/\d+m \d+s/);
    });

    it('should show -- for ETA when current is 0', () => {
      const bar = new ProgressBar({ total: 100 });
      writtenOutput = [];

      bar.update(0);

      const output = writtenOutput.join('');
      expect(output).toContain('ETA: --');
    });
  });

  describe('Progress Bar Rendering', () => {
    it('should render filled and empty bars', () => {
      const bar = new ProgressBar({ total: 100, width: 10 });
      writtenOutput = [];

      bar.update(50);

      const output = writtenOutput.join('');
      expect(output).toContain('█');
      expect(output).toContain('░');
    });

    it('should render all filled when complete', () => {
      const bar = new ProgressBar({ total: 100, width: 10 });
      writtenOutput = [];

      bar.update(100);

      const output = writtenOutput.join('');
      expect(output).toContain('█'.repeat(10));
    });

    it('should render all empty at start', () => {
      const bar = new ProgressBar({ total: 100, width: 10 });
      writtenOutput = [];

      bar.update(0);

      const output = writtenOutput.join('');
      expect(output).toContain('░'.repeat(10));
    });

    it('should show elapsed time', () => {
      jest.useFakeTimers();
      const bar = new ProgressBar({ total: 100 });

      jest.advanceTimersByTime(2500);
      writtenOutput = [];

      bar.update(50);
      jest.useRealTimers();

      const output = writtenOutput.join('');
      expect(output).toMatch(/\d+\.\d+s/);
    });
  });
});

describe('Spinner', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Constructor', () => {
    it('should create spinner with default label', () => {
      const spinner = new Spinner();

      expect(spinner).toBeDefined();
    });

    it('should create spinner with custom label', () => {
      const spinner = new Spinner('Processing');

      expect(spinner).toBeDefined();
    });
  });

  describe('Start', () => {
    it('should start spinner animation', () => {
      const spinner = new Spinner('Loading');
      writtenOutput = [];

      spinner.start();
      jest.advanceTimersByTime(100);

      const output = writtenOutput.join('');
      expect(output).toContain('Loading...');
      expect(output.length).toBeGreaterThan(0);

      spinner.stop();
    });

    it('should rotate through animation frames', () => {
      const spinner = new Spinner('Test');
      writtenOutput = [];

      spinner.start();

      // Advance through multiple frames
      jest.advanceTimersByTime(80);
      const frame1 = writtenOutput.join('');

      writtenOutput = [];
      jest.advanceTimersByTime(80);
      const frame2 = writtenOutput.join('');

      // Frames should be different
      expect(frame1).not.toBe(frame2);

      spinner.stop();
    });
  });

  describe('Update', () => {
    it('should update spinner label', () => {
      const spinner = new Spinner('Initial');
      spinner.start();

      writtenOutput = [];
      spinner.update('Updated');
      jest.advanceTimersByTime(100);

      const output = writtenOutput.join('');
      expect(output).toContain('Updated...');

      spinner.stop();
    });
  });

  describe('Stop', () => {
    it('should stop spinner and clear line', () => {
      const spinner = new Spinner('Test');
      spinner.start();
      jest.advanceTimersByTime(100);

      writtenOutput = [];
      spinner.stop();

      const output = writtenOutput.join('');
      expect(output).toContain('\r');
    });

    it('should stop spinner and show final message', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const spinner = new Spinner('Test');
      spinner.start();
      jest.advanceTimersByTime(100);

      spinner.stop('Completed!');

      expect(consoleSpy).toHaveBeenCalledWith('Completed!');

      consoleSpy.mockRestore();
    });

    it('should handle multiple stops gracefully', () => {
      const spinner = new Spinner('Test');
      spinner.start();

      spinner.stop();
      spinner.stop(); // Should not throw

      expect(true).toBe(true);
    });

    it('should stop without final message', () => {
      const spinner = new Spinner('Test');
      spinner.start();
      jest.advanceTimersByTime(100);

      writtenOutput = [];
      spinner.stop();

      expect(writtenOutput.length).toBeGreaterThan(0);
    });
  });
});

describe('MultiProgressBar', () => {
  describe('Constructor', () => {
    it('should create empty multi-progress bar', () => {
      const multi = new MultiProgressBar();

      expect(multi).toBeDefined();
    });
  });

  describe('Add', () => {
    it('should add a progress bar', () => {
      const multi = new MultiProgressBar();
      writtenOutput = [];

      multi.add('task1', 100, 'Task 1');

      const output = writtenOutput.join('');
      expect(output).toContain('Task 1:');
      expect(output).toContain('0/100');
    });

    it('should add multiple progress bars', () => {
      const multi = new MultiProgressBar();
      writtenOutput = [];

      multi.add('task1', 100, 'Task 1');
      multi.add('task2', 50, 'Task 2');

      const output = writtenOutput.join('');
      expect(output).toContain('Task 1:');
      expect(output).toContain('Task 2:');
    });
  });

  describe('Update', () => {
    it('should update existing bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      writtenOutput = [];

      multi.update('task1', 50);

      const output = writtenOutput.join('');
      expect(output).toContain('50%');
      expect(output).toContain('50/100');
    });

    it('should not update non-existent bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      writtenOutput = [];

      multi.update('nonexistent', 50);

      // Should not crash
      expect(true).toBe(true);
    });
  });

  describe('Increment', () => {
    it('should increment existing bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      multi.update('task1', 10);
      writtenOutput = [];

      multi.increment('task1');

      const output = writtenOutput.join('');
      expect(output).toContain('11/100');
    });

    it('should not increment non-existent bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      writtenOutput = [];

      multi.increment('nonexistent');

      // Should not crash
      expect(true).toBe(true);
    });
  });

  describe('Complete', () => {
    it('should complete a specific bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      writtenOutput = [];

      multi.complete('task1');

      const output = writtenOutput.join('');
      expect(output).toContain('100%');
      expect(output).toContain('100/100');
    });

    it('should not complete non-existent bar', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Task 1');
      writtenOutput = [];

      multi.complete('nonexistent');

      // Should not crash
      expect(true).toBe(true);
    });
  });

  describe('CompleteAll', () => {
    it('should complete all bars', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const multi = new MultiProgressBar();

      multi.add('task1', 100, 'Task 1');
      multi.add('task2', 50, 'Task 2');
      multi.update('task1', 50);
      multi.update('task2', 25);

      writtenOutput = [];
      multi.completeAll();

      const output = writtenOutput.join('');
      expect(output).toContain('100%');
      expect(output).toContain('100/100');
      expect(output).toContain('50/50');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should handle empty bar list', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const multi = new MultiProgressBar();

      multi.completeAll();

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Rendering', () => {
    it('should render multiple bars correctly', () => {
      const multi = new MultiProgressBar();
      writtenOutput = [];

      multi.add('task1', 100, 'Task 1');
      multi.add('task2', 200, 'Task 2');
      multi.update('task1', 50);
      multi.update('task2', 100);

      const output = writtenOutput.join('');
      expect(output).toContain('Task 1:');
      expect(output).toContain('Task 2:');
      expect(output).toContain('50%');
      expect(output).toContain('█');
      expect(output).toContain('░');
    });

    it('should render bars with progress characters', () => {
      const multi = new MultiProgressBar();
      multi.add('task1', 100, 'Test');
      writtenOutput = [];

      multi.update('task1', 50);

      const output = writtenOutput.join('');
      expect(output).toContain('█');
      expect(output).toContain('░');
    });
  });
});
