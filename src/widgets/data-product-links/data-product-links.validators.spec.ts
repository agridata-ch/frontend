import { FormControl } from '@angular/forms';

import {
  absoluteUrlValidator,
  filterFilledLinks,
  isEmptyLink,
} from './data-product-links.validators';

describe('absoluteUrlValidator', () => {
  it('accepts empty values and absolute http(s) URLs', () => {
    expect(absoluteUrlValidator(new FormControl(''))).toBeNull();
    expect(absoluteUrlValidator(new FormControl('   '))).toBeNull();
    expect(absoluteUrlValidator(new FormControl('http://example.com'))).toBeNull();
    expect(absoluteUrlValidator(new FormControl('https://example.com'))).toBeNull();
    expect(absoluteUrlValidator(new FormControl('HTTP://example.com'))).toBeNull();
    expect(absoluteUrlValidator(new FormControl('HTTPS://example.com'))).toBeNull();
  });

  it('rejects URLs without an absolute http(s) scheme', () => {
    expect(absoluteUrlValidator(new FormControl('example.com'))).toEqual({
      absoluteUrl: true,
    });

    expect(absoluteUrlValidator(new FormControl('ftp://example.com'))).toEqual({
      absoluteUrl: true,
    });
  });
});

describe('isEmptyLink', () => {
  it('returns true only when both fields are empty or whitespace-only', () => {
    expect(isEmptyLink({ displayText: '', url: '' })).toBe(true);
    expect(isEmptyLink({ displayText: '   ', url: '\t' })).toBe(true);
    expect(isEmptyLink({ displayText: 'Docs', url: '' })).toBe(false);
    expect(isEmptyLink({ displayText: '', url: 'https://example.com' })).toBe(false);
  });
});

describe('filterFilledLinks', () => {
  it('drops empty rows and keeps rows with at least one filled field', () => {
    const links = [
      { displayText: 'Docs', url: 'https://example.com' },
      { displayText: '', url: '' },
      { displayText: '  ', url: '  ' },
      { displayText: 'Partial', url: '' },
    ];

    expect(filterFilledLinks(links)).toEqual([
      { displayText: 'Docs', url: 'https://example.com' },
      { displayText: 'Partial', url: '' },
    ]);
  });
});
