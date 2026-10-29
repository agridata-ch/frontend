import { normalizeUid } from './uid.util';

describe('normalizeUid', () => {
  it.each([
    ['CHE-123.456.789', 'CHE123456789'],
    ['che 123 456 789', 'CHE123456789'],
    ['CHE123456789', 'CHE123456789'],
    ['', ''],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeUid(input)).toBe(expected);
  });
});
