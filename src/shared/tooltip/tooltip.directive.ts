import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { TooltipBubble, TooltipBubbleService } from '@/shared/tooltip/tooltip-bubble.service';

/**
 * Accessible tooltip following the WAI-ARIA tooltip pattern and WCAG 2.1 SC 1.4.13.
 *
 * Shows a styled tooltip on hover and keyboard focus. It stays open while the pointer is over the
 * tooltip itself (hoverable), is dismissible with the Escape key, and is persistent (no auto-hide
 * timeout). Placement defaults to below the host and flips above when there is not enough room; the
 * horizontal position is centred on the host and clamped to the viewport.
 *
 * This directive is the behaviour half of the tooltip: it decides *when* a bubble is shown, from the
 * host's pointer and focus events. `TooltipBubbleService` owns the bubble element itself.
 *
 * The host keeps its own accessible name (e.g. `aria-label`); the tooltip is `aria-hidden` visual
 * reinforcement, so screen readers announce the name only once. As a progressive-enhancement
 * fallback the directive reads the host's native `title` (when no explicit text is passed) and
 * removes the attribute so the slow native browser tooltip never fires alongside ours.
 *
 * Activating the host (click) hides the tooltip; it reappears on the next hover/focus. This keeps
 * the tooltip out of the way when a click triggers host movement or a label change (e.g. a toggle
 * button that animates into a new position).
 *
 * CommentLastReviewed: 2026-08-04
 */
@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  private readonly bubbleService = inject(TooltipBubbleService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);

  // Constants
  private readonly hideGraceMs = 100;

  // Input properties
  readonly appTooltip = input<string>('');
  readonly tooltipShowDelay = input<number>(250);

  // Signals
  private readonly nativeTitle = signal<string>('');
  private readonly visible = signal(false);

  // Computed Signals
  private readonly text = computed(() => this.appTooltip() || this.nativeTitle());

  private bubble?: TooltipBubble;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  // Effects
  private readonly renderEffect = effect(() => {
    const text = this.text();
    if (this.visible() && text) {
      this.showTooltip(text);
    } else {
      this.hideTooltip();
    }
  });

  private readonly setupEffect = afterNextRender(() => {
    const host = this.elementRef.nativeElement;

    // Read the native title (fallback source) and strip it so the slow native tooltip never fires.
    const title = host.getAttribute('title');
    if (title) {
      this.nativeTitle.set(title);
      host.removeAttribute('title');
    }

    const show = () => this.scheduleShow();
    const hide = () => this.scheduleHide();
    const dismiss = () => this.hideNow();

    host.addEventListener('mouseenter', show);
    host.addEventListener('mouseleave', hide);
    host.addEventListener('focusin', show);
    host.addEventListener('focusout', hide);
    host.addEventListener('click', dismiss);

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('mouseenter', show);
      host.removeEventListener('mouseleave', hide);
      host.removeEventListener('focusin', show);
      host.removeEventListener('focusout', hide);
      host.removeEventListener('click', dismiss);
      this.clearTimers();
      this.hideTooltip();
    });
  });

  private clearTimers(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }

  private hideNow(): void {
    this.clearTimers();
    this.visible.set(false);
  }

  private hideTooltip(): void {
    this.bubble?.hide();
    this.bubble = undefined;
  }

  private scheduleHide(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.hideTimer = setTimeout(() => this.visible.set(false), this.hideGraceMs);
  }

  private scheduleShow(): void {
    clearTimeout(this.hideTimer);
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(() => this.visible.set(true), this.tooltipShowDelay());
  }

  private showTooltip(text: string): void {
    // A stale handle means another owner took the bubble over, so show a fresh one instead.
    if (this.bubble?.setText(text)) {
      return;
    }

    this.bubble = this.bubbleService.show(
      text,
      () => this.elementRef.nativeElement.getBoundingClientRect(),
      {
        onDismiss: () => this.hideNow(),
        onPointerEnter: () => clearTimeout(this.hideTimer),
        onPointerLeave: () => this.scheduleHide(),
      },
    );
  }
}
