import { formatDate } from './date-utils';

describe('formatDate', () => {
  it('returns undefined for undefined input', () => {
    expect(formatDate(undefined)).toBeUndefined();
  });

  it('returns undefined for invalid date string', () => {
    expect(formatDate('not-a-date')).toBeUndefined();
  });

  it('returns formatted date for valid ISO string', () => {
    expect(formatDate('2024-06-01T12:00:00Z')).toBe('01.06.2024');
  });

  it('returns formatted date for Date object', () => {
    expect(formatDate(new Date('2024-06-01T12:00:00Z'))).toBe('01.06.2024');
  });

  it('returns formatted date for timestamp', () => {
    const timestamp = Date.UTC(2024, 5, 1, 12, 0, 0); // June is month 5 (0-based)
    expect(formatDate(timestamp)).toBe('01.06.2024');
  });
});
