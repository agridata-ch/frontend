import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  Renderer2,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { calculateVerticalPlacement, VerticalPlacement } from '@/shared/utils';

/**
 * Accessible tooltip following the WAI-ARIA tooltip pattern and WCAG 2.1 SC 1.4.13.
 *
 * Shows a styled tooltip on hover and keyboard focus. It stays open while the pointer is over the
 * tooltip itself (hoverable), is dismissible with the Escape key, and is persistent (no auto-hide
 * timeout). Placement defaults to below the host and flips above when there is not enough room; the
 * horizontal position is centred on the host and clamped to the viewport.
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
 * CommentLastReviewed: 2026-07-09
 */
@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  private readonly document = inject(DOCUMENT);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly renderer = inject(Renderer2);
  private readonly destroyRef = inject(DestroyRef);

  // Constants
  private readonly gap = 8;
  private readonly hideGraceMs = 100;

  // Input properties
  readonly appTooltip = input<string>('');
  readonly tooltipShowDelay = input<number>(250);

  // Signals
  private readonly nativeTitle = signal<string>('');
  private readonly visible = signal(false);

  // Computed Signals
  private readonly text = computed(() => this.appTooltip() || this.nativeTitle());

  private tooltipElement?: HTMLElement;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private readonly reposition = () => this.position();
  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      this.hideNow();
    }
  };

  // Effects
  private readonly renderEffect = effect(() => {
    const text = this.text();
    if (this.visible() && text) {
      this.showTooltip(text);
    } else {
      this.destroyTooltip();
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
      this.destroyTooltip();
    });
  });

  private clearTimers(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }

  private createTooltip(text: string): void {
    const tooltip = this.renderer.createElement('span');
    this.renderer.setAttribute(tooltip, 'role', 'tooltip');
    this.renderer.setAttribute(tooltip, 'aria-hidden', 'true');
    this.renderer.setProperty(tooltip, 'textContent', text);
    this.renderer.setAttribute(
      tooltip,
      'class',
      'pointer-events-auto fixed z-50 whitespace-nowrap rounded bg-agridata-primary-text px-2 py-1 text-xs text-white shadow',
    );

    // Keep the tooltip open while the pointer is over it (WCAG 1.4.13 "hoverable").
    this.renderer.listen(tooltip, 'mouseenter', () => clearTimeout(this.hideTimer));
    this.renderer.listen(tooltip, 'mouseleave', () => this.scheduleHide());

    this.renderer.appendChild(this.document.body, tooltip);
    this.tooltipElement = tooltip;

    // Reposition while visible so the tooltip tracks the host during scroll/resize, and only listen
    // for the Escape dismiss while a tooltip is actually shown (no always-on per-instance listener).
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);
    this.document.addEventListener('keydown', this.onKeydown);
  }

  private destroyTooltip(): void {
    if (!this.tooltipElement) {
      return;
    }
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    this.document.removeEventListener('keydown', this.onKeydown);
    this.renderer.removeChild(this.document.body, this.tooltipElement);
    this.tooltipElement = undefined;
  }

  private hideNow(): void {
    this.clearTimers();
    this.visible.set(false);
  }

  private position(): void {
    const tooltip = this.tooltipElement;
    if (!tooltip) {
      return;
    }

    const hostRect = this.elementRef.nativeElement.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    const placement = calculateVerticalPlacement(hostRect, tooltipRect.height + this.gap);
    const top =
      placement === VerticalPlacement.BOTTOM
        ? hostRect.bottom + this.gap
        : hostRect.top - tooltipRect.height - this.gap;

    // Centre horizontally on the host, then clamp within the viewport.
    const rawLeft = hostRect.left + hostRect.width / 2 - tooltipRect.width / 2;
    const maxLeft = window.innerWidth - tooltipRect.width - this.gap;
    const left = Math.max(this.gap, Math.min(rawLeft, maxLeft));

    this.renderer.setStyle(tooltip, 'top', `${top}px`);
    this.renderer.setStyle(tooltip, 'left', `${left}px`);
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
    if (this.tooltipElement) {
      this.renderer.setProperty(this.tooltipElement, 'textContent', text);
    } else {
      this.createTooltip(text);
    }
    this.position();
  }
}
