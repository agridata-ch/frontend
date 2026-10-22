import { lockPageScroll } from './scroll-lock.util';

describe('lockPageScroll', () => {
  const html = document.documentElement;

  beforeEach(() => {
    html.style.overflow = 'auto';
  });

  it('hides the page overflow while locked and restores the previous value on release', () => {
    const release = lockPageScroll(document);
    expect(html.style.overflow).toBe('hidden');

    release();
    expect(html.style.overflow).toBe('auto');
  });

  it('keeps the page locked until every lock is released', () => {
    const releaseFirst = lockPageScroll(document);
    const releaseSecond = lockPageScroll(document);

    releaseFirst();
    expect(html.style.overflow).toBe('hidden');

    releaseSecond();
    expect(html.style.overflow).toBe('auto');
  });

  it('ignores repeated releases of the same lock', () => {
    const releaseFirst = lockPageScroll(document);
    const releaseSecond = lockPageScroll(document);

    releaseFirst();
    releaseFirst();
    expect(html.style.overflow).toBe('hidden');

    releaseSecond();
    expect(html.style.overflow).toBe('auto');
  });
});
