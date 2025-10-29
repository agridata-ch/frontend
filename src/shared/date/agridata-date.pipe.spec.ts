import { AgridataDatePipe } from './agridata-date.pipe';

describe('AgridataDatePipe', () => {
  let pipe: AgridataDatePipe;

  beforeEach(() => {
    pipe = new AgridataDatePipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('short format', () => {
    it('should format Date object to short format (dd.MM.yyyy)', () => {
      const date = new Date(2025, 9, 14); // October 14, 2025
      const result = pipe.transform(date, 'short');
      expect(result).toBe('14.10.2025');
    });

    it('should format Date object to short format when format not specified', () => {
      const date = new Date(2025, 9, 14);
      const result = pipe.transform(date);
      expect(result).toBe('14.10.2025');
    });

    it('should format string date to short format', () => {
      const result = pipe.transform('2025-10-14', 'short');
      expect(result).toBe('14.10.2025');
    });

    it('should format number timestamp to short format', () => {
      const timestamp = new Date(2025, 9, 14).getTime();
      const result = pipe.transform(timestamp, 'short');
      expect(result).toBe('14.10.2025');
    });

    it('should format zero timestamp to short format', () => {
      const result = pipe.transform(0, 'short');
      expect(result).toBe('01.01.1970');
    });
  });

  describe('long format', () => {
    it('should format Date object to long format (dd.MM.yyyy HH:mm:ss.SSS)', () => {
      const date = new Date(2025, 9, 14, 15, 30, 45, 123);
      const result = pipe.transform(date, 'long');
      expect(result).toBe('14.10.2025 15:30:45.123');
    });

    it('should format string date to long format', () => {
      const dateString = '2025-10-14T15:30:45.123Z';
      const result = pipe.transform(dateString, 'long');
      expect(result).toContain('2025');
      expect(result).toContain(':');
      expect(result).toContain('.');
    });

    it('should format number timestamp to long format', () => {
      const date = new Date(2025, 9, 14, 15, 30, 45, 123);
      const result = pipe.transform(date.getTime(), 'long');
      expect(result).toBe('14.10.2025 15:30:45.123');
    });

    it('should format zero timestamp to long format', () => {
      const result = pipe.transform(0, 'long');
      expect(result).toContain('01.01.1970');
    });
  });

  describe('edge cases and invalid inputs', () => {
    it('should return empty string for null', () => {
      const result = pipe.transform(null);
      expect(result).toBe('');
    });

    it('should return empty string for undefined', () => {
      const result = pipe.transform(undefined);
      expect(result).toBe('');
    });

    it('should return empty string for invalid date string', () => {
      const result = pipe.transform('invalid-date');
      expect(result).toBe('');
    });

    it('should return empty string for NaN', () => {
      const result = pipe.transform(NaN);
      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = pipe.transform('');
      expect(result).toBe('');
    });

    it('should handle date at beginning of year', () => {
      const date = new Date(2025, 0, 1);
      const result = pipe.transform(date, 'short');
      expect(result).toBe('01.01.2025');
    });

    it('should handle date at end of year', () => {
      const date = new Date(2025, 11, 31);
      const result = pipe.transform(date, 'short');
      expect(result).toBe('31.12.2025');
    });

    it('should handle single digit days and months', () => {
      const date = new Date(2025, 0, 5);
      const result = pipe.transform(date, 'short');
      expect(result).toBe('05.01.2025');
    });

    it('should handle midnight time in long format', () => {
      const date = new Date(2025, 9, 14, 0, 0, 0, 0);
      const result = pipe.transform(date, 'long');
      expect(result).toBe('14.10.2025 00:00:00.000');
    });
  });
});
