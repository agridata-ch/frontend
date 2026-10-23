// Shared by every caller (modals, sidepanel) so overlapping locks don't fight over the html overflow style.
let lockCount = 0;
let previousHtmlOverflow = '';

/**
 * Locks page scrolling by hiding the html overflow. Reference-counted, so the page only becomes
 * scrollable again once every lock has been released. Returns the release function.
 */
export function lockPageScroll(document: Document): () => void {
  const html = document.documentElement;
  if (lockCount === 0) {
    previousHtmlOverflow = html.style.overflow;
    html.style.overflow = 'hidden';
  }
  lockCount++;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount--;
    if (lockCount === 0) {
      html.style.overflow = previousHtmlOverflow;
    }
  };
}
