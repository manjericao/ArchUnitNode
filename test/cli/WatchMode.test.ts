import { WatchMode, WatchOptions } from '../../src/cli/WatchMode';
import { ArchUnitConfig } from '../../src/config/ConfigLoader';

jest.mock('chokidar');
jest.mock('../../src/index');
jest.mock('../../src/utils/ViolationFormatter');

describe('WatchMode', () => {
  let mockConfig: ArchUnitConfig;

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();

    mockConfig = {
      rules: [],
      patterns: ['**/*.ts'],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create watch mode', () => {
    const options: WatchOptions = {
      basePath: '/test/path',
      config: mockConfig,
    };

    const watchMode = new WatchMode(options);
    expect(watchMode).toBeDefined();
  });

  it('should handle stop when not started', async () => {
    const options: WatchOptions = {
      basePath: '/test/path',
      config: mockConfig,
    };

    const watchMode = new WatchMode(options);
    await expect(watchMode.stop()).resolves.not.toThrow();
  });
});
