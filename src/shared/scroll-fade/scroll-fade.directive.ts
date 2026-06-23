import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Appends a gradient fade overlay at the bottom of the host scrollable element.
 * The overlay hides automatically when the user has scrolled to the bottom.
 *
 * CommentLastReviewed: 2026-06-15
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
      const showFade = isScrollable && distanceToBottom > 2;
      host.style.maskImage = showFade
        ? 'linear-gradient(to bottom, black calc(100% - 5rem), transparent 100%)'
        : '';
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
