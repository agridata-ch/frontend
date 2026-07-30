import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Fades the content of the host scrollable element out at its top and bottom edge via a mask, so
 * content dissolves instead of being cut off. Each edge fades only while there is content beyond it:
 * the top fade appears once the user has scrolled down, the bottom fade hides at the bottom.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Directive({
  selector: '[appScrollFade]',
})
export class ScrollFadeDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _setup = afterNextRender(() => {
    const host = this.el.nativeElement;

    const checkScroll = () => {
      const isScrollable = host.scrollHeight > host.clientHeight;
      const distanceToBottom = host.scrollHeight - host.scrollTop - host.clientHeight;
      const showTopFade = isScrollable && host.scrollTop > 2;
      const showBottomFade = isScrollable && distanceToBottom > 2;

      if (!showTopFade && !showBottomFade) {
        host.style.maskImage = '';
        return;
      }

      const top = showTopFade ? 'transparent 0, black 2rem' : 'black 0';
      const bottom = showBottomFade ? 'black calc(100% - 5rem), transparent 100%' : 'black 100%';
      host.style.maskImage = `linear-gradient(to bottom, ${top}, ${bottom})`;
    };

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(host);
    Array.from<Element>(host.children).forEach((child) => resizeObserver.observe(child));

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        Array.from(mutation.addedNodes)
          .filter((node): node is Element => node instanceof Element)
          .forEach((node) => resizeObserver.observe(node));
      }
      checkScroll();
    });
    mutationObserver.observe(host, { childList: true });

    host.addEventListener('scroll', checkScroll);

    this.destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      host.removeEventListener('scroll', checkScroll);
      host.style.maskImage = '';
    });
  });
}
