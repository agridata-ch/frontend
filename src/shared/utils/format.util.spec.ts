import { formatBytes } from './format.util';

describe('formatBytes', () => {
  it('formats bytes below 1024 as B', () => {
    expect(formatBytes(512)).toBe('512B');
  });

  it('formats bytes below 1MB as kB', () => {
    expect(formatBytes(2048)).toBe('2kB');
  });

  it('formats bytes at or above 1MB as MB', () => {
    expect(formatBytes(2 * 1024 * 1024)).toBe('2.00MB');
  });
});
