import { FormControl } from '@angular/forms';

import { validateAdvantages } from './data-request-form-request-advantages.model';

const makeControl = (value: unknown) => new FormControl(value);

describe('validateAdvantages', () => {
  it('should return null for null value', () => {
    expect(validateAdvantages(makeControl(null))).toBeNull();
  });

  it('should return null for undefined value', () => {
    expect(validateAdvantages(makeControl(undefined))).toBeNull();
  });

  it('should return null for empty array', () => {
    expect(validateAdvantages(makeControl([]))).toBeNull();
  });

  it('should return null when all advantages have all three languages with at least 5 chars', () => {
    expect(
      validateAdvantages(makeControl([{ de: 'Vorteil', fr: 'Avantage', it: 'Vantaggio' }])),
    ).toBeNull();
  });

  it('should return null for multiple fully-valid advantages', () => {
    expect(
      validateAdvantages(
        makeControl([
          { de: 'Vorteil 1', fr: 'Avantage 1', it: 'Vantaggio 1' },
          { de: 'Vorteil 2', fr: 'Avantage 2', it: 'Vantaggio 2' },
        ]),
      ),
    ).toBeNull();
  });

  it('should return advantagesInvalid when de is missing', () => {
    expect(validateAdvantages(makeControl([{ de: '', fr: 'Avantage', it: 'Vantaggio' }]))).toEqual({
      advantagesInvalid: true,
    });
  });

  it('should return advantagesInvalid when fr is missing', () => {
    expect(validateAdvantages(makeControl([{ de: 'Vorteil', fr: '', it: 'Vantaggio' }]))).toEqual({
      advantagesInvalid: true,
    });
  });

  it('should return advantagesInvalid when it is missing', () => {
    expect(validateAdvantages(makeControl([{ de: 'Vorteil', fr: 'Avantage', it: '' }]))).toEqual({
      advantagesInvalid: true,
    });
  });

  it('should return advantagesInvalid when a field is undefined', () => {
    expect(validateAdvantages(makeControl([{ de: 'Vorteil', fr: 'Avantage' }]))).toEqual({
      advantagesInvalid: true,
    });
  });

  it('should return advantagesInvalid when de is shorter than 5 chars', () => {
    expect(
      validateAdvantages(makeControl([{ de: 'abc', fr: 'Avantage', it: 'Vantaggio' }])),
    ).toEqual({ advantagesInvalid: true });
  });

  it('should return advantagesInvalid when fr is shorter than 5 chars', () => {
    expect(validateAdvantages(makeControl([{ de: 'Vorteil', fr: 'ok', it: 'Vantaggio' }]))).toEqual(
      { advantagesInvalid: true },
    );
  });

  it('should return advantagesInvalid when it is shorter than 5 chars', () => {
    expect(validateAdvantages(makeControl([{ de: 'Vorteil', fr: 'Avantage', it: 'ci' }]))).toEqual({
      advantagesInvalid: true,
    });
  });

  it('should return advantagesInvalid when any one advantage in the array is invalid', () => {
    expect(
      validateAdvantages(
        makeControl([
          { de: 'Vorteil 1', fr: 'Avantage 1', it: 'Vantaggio 1' },
          { de: 'abc', fr: 'Avantage 2', it: 'Vantaggio 2' },
        ]),
      ),
    ).toEqual({ advantagesInvalid: true });
  });

  it('should accept fields with exactly 5 chars', () => {
    expect(validateAdvantages(makeControl([{ de: '12345', fr: '12345', it: '12345' }]))).toBeNull();
  });
});
