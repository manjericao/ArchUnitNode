/**
 * Progress Bar for CLI operations
 *
 * @module cli/ProgressBar
 */

/**
 * Simple progress bar for terminal
 */
export class ProgressBar {
  private total: number;
  private current: number;
  private width: number;
  private label: string;
  private startTime: number;

  constructor(options: { total: number; width?: number; label?: string }) {
    this.total = options.total;
    this.current = 0;
    this.width = options.width || 40;
    this.label = options.label || 'Progress';
    this.startTime = Date.now();
  }

  /**
   * Update progress
   */
  update(current: number, label?: string): void {
    this.current = current;
    if (label) {
      this.label = label;
    }
    this.render();
  }

  /**
   * Increment progress by 1
   */
  increment(label?: string): void {
    this.update(this.current + 1, label);
  }

  /**
   * Complete the progress bar
   */
  complete(): void {
    this.current = this.total;
    this.render();
    process.stdout.write('\n');
  }

  /**
   * Render the progress bar
   */
  private render(): void {
    const percentage = Math.min(100, Math.max(0, (this.current / this.total) * 100));
    const filled = Math.floor((this.width * percentage) / 100);
    const empty = this.width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    const elapsed = ((Date.now() - this.startTime) / 1000).toFixed(1);
    const eta = this.calculateETA();

    const output = `\r${this.label}: [${bar}] ${percentage.toFixed(1)}% (${this.current}/${this.total}) | ${elapsed}s ${eta}`;

    process.stdout.write(output);
  }

  /**
   * Calculate estimated time remaining
   */
  private calculateETA(): string {
    if (this.current === 0) return '| ETA: --';

    const elapsed = (Date.now() - this.startTime) / 1000;
    const rate = this.current / elapsed;
    const remaining = (this.total - this.current) / rate;

    if (remaining < 60) {
      return `| ETA: ${remaining.toFixed(0)}s`;
    } else {
      const minutes = Math.floor(remaining / 60);
      const seconds = Math.floor(remaining % 60);
      return `| ETA: ${minutes}m ${seconds}s`;
    }
  }
}

/**
 * Spinner for indeterminate operations
 */
export class Spinner {
  private frames: string[];
  private currentFrame: number;
  private interval: NodeJS.Timeout | null;
  private label: string;

  constructor(label: string = 'Loading') {
    this.frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    this.currentFrame = 0;
    this.interval = null;
    this.label = label;
  }

  /**
   * Start the spinner
   */
  start(): void {
    this.interval = setInterval(() => {
      this.render();
      this.currentFrame = (this.currentFrame + 1) % this.frames.length;
    }, 80);
  }

  /**
   * Update spinner label
   */
  update(label: string): void {
    this.label = label;
  }

  /**
   * Stop the spinner
   */
  stop(finalMessage?: string): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    process.stdout.write('\r' + ' '.repeat(process.stdout.columns || 80) + '\r');
    if (finalMessage) {
      console.log(finalMessage);
    }
  }

  /**
   * Render the spinner
   */
  private render(): void {
    const frame = this.frames[this.currentFrame];
    process.stdout.write(`\r${frame} ${this.label}...`);
  }
}

/**
 * Multi-bar progress tracker
 */
export class MultiProgressBar {
  private bars: Map<string, { current: number; total: number; label: string }>;
  private startTime: number;

  constructor() {
    this.bars = new Map();
    this.startTime = Date.now();
  }

  /**
   * Add a progress bar
   */
  add(id: string, total: number, label: string): void {
    this.bars.set(id, { current: 0, total, label });
    this.render();
  }

  /**
   * Update a progress bar
   */
  update(id: string, current: number): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.current = current;
      this.render();
    }
  }

  /**
   * Increment a progress bar
   */
  increment(id: string): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.current++;
      this.render();
    }
  }

  /**
   * Complete a progress bar
   */
  complete(id: string): void {
    const bar = this.bars.get(id);
    if (bar) {
      bar.current = bar.total;
      this.render();
    }
  }

  /**
   * Complete all and clear
   */
  completeAll(): void {
    for (const [id] of this.bars) {
      this.complete(id);
    }
    this.render();
    console.log(''); // New line after completion
  }

  /**
   * Render all progress bars
   */
  private render(): void {
    // Move cursor up to start of progress bars
    if (this.bars.size > 0) {
      process.stdout.write('\r');
    }

    const lines: string[] = [];
    for (const [id, bar] of this.bars) {
      const percentage = (bar.current / bar.total) * 100;
      const filled = Math.floor(percentage / 5); // 20 char width
      const empty = 20 - filled;
      const barStr = '█'.repeat(filled) + '░'.repeat(empty);
      lines.push(`${bar.label}: [${barStr}] ${percentage.toFixed(0)}% (${bar.current}/${bar.total})`);
    }

    // Clear and rewrite
    process.stdout.write('\r' + ' '.repeat(100) + '\r');
    process.stdout.write(lines.join('\n'));
  }
}
