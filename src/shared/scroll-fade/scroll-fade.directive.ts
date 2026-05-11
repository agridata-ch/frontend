import { DestroyRef, Directive, ElementRef, afterNextRender, inject } from '@angular/core';

/**
 * Appends a gradient fade overlay at the bottom of the host scrollable element.
 * The overlay hides automatically when the user has scrolled to the bottom.
 *
 * CommentLastReviewed: 2026-05-12
 */
@Directive({
  selector: '[appScrollFade]',
})
export class ScrollFadeDirective {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _setup = afterNextRender(() => {
    const host = this.el.nativeElement;

    const wrapper = document.createElement('div');
    wrapper.className = 'relative';
    host.before(wrapper);
    wrapper.appendChild(host);

    const overlay = document.createElement('div');
    overlay.className =
      'absolute bottom-0 left-0 right-0 h-20 bg-linear-to-b from-transparent to-90% to-white pointer-events-none z-10';
    wrapper.appendChild(overlay);

    const checkScroll = () => {
      const isScrollable = host.scrollHeight > host.clientHeight;
      const distanceToBottom = host.scrollHeight - host.scrollTop - host.clientHeight;
      overlay.classList.toggle('hidden', !isScrollable || distanceToBottom <= 2);
    };

    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(host);

    host.addEventListener('scroll', checkScroll);

    this.destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
      host.removeEventListener('scroll', checkScroll);
      wrapper.before(host);
      wrapper.remove();
    });
  });
}
