import { ProgressBar, Spinner, MultiProgressBar } from '../../src/cli/ProgressBar';

describe('ProgressBar', () => {
  let stdoutWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
  });

  it('should create progress bar', () => {
    const bar = new ProgressBar({ total: 100 });
    expect(bar).toBeDefined();
  });

  it('should update progress', () => {
    const bar = new ProgressBar({ total: 100 });
    bar.update(50);
    expect(stdoutWriteSpy).toHaveBeenCalled();
  });

  it('should complete progress', () => {
    const bar = new ProgressBar({ total: 50 });
    bar.complete();
    expect(stdoutWriteSpy).toHaveBeenCalledWith('\n');
  });
});

describe('Spinner', () => {
  let stdoutWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    jest.useFakeTimers();
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    jest.useRealTimers();
  });

  it('should create spinner', () => {
    const spinner = new Spinner();
    expect(spinner).toBeDefined();
    spinner.stop();
  });
});

describe('MultiProgressBar', () => {
  let stdoutWriteSpy: jest.SpyInstance;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
  });

  it('should create multi-progress bar', () => {
    const multiBar = new MultiProgressBar();
    expect(multiBar).toBeDefined();
  });

  it('should add progress bars', () => {
    const multiBar = new MultiProgressBar();
    multiBar.add('task1', 100, 'Task 1');
    expect(stdoutWriteSpy).toHaveBeenCalled();
  });
});
