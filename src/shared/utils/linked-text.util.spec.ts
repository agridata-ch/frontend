import { parseLinkedText } from './linked-text.util';

describe('parseLinkedText', () => {
  it('splits the string into before, linkText, and after', () => {
    expect(parseLinkedText('Please check [agate] for details.')).toEqual({
      before: 'Please check ',
      linkText: 'agate',
      after: ' for details.',
    });
  });

  it('handles a link at the very start of the string', () => {
    expect(parseLinkedText('[agate] is the system.')).toEqual({
      before: '',
      linkText: 'agate',
      after: ' is the system.',
    });
  });

  it('handles a link at the very end of the string', () => {
    expect(parseLinkedText('See the [agate]')).toEqual({
      before: 'See the ',
      linkText: 'agate',
      after: '',
    });
  });

  it('returns linkText null and full text as before when no brackets are present', () => {
    expect(parseLinkedText('No link in this text.')).toEqual({
      before: 'No link in this text.',
      linkText: null,
      after: '',
    });
  });

  it('returns linkText null when only the opening bracket is present', () => {
    expect(parseLinkedText('Missing [closing bracket.')).toEqual({
      before: 'Missing [closing bracket.',
      linkText: null,
      after: '',
    });
  });

  it('returns linkText null for an empty string', () => {
    expect(parseLinkedText('')).toEqual({
      before: '',
      linkText: null,
      after: '',
    });
  });

  it('uses the first bracket pair when multiple pairs exist', () => {
    expect(parseLinkedText('See [first] and [second].')).toEqual({
      before: 'See ',
      linkText: 'first',
      after: ' and [second].',
    });
  });
});
