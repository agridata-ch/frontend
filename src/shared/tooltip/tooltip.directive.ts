import { DOCUMENT } from '@angular/common';
import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';

import { TooltipBubble, TooltipBubbleService } from '@/shared/tooltip/tooltip-bubble.service';

const FOCUSABLE = 'a[href], button, input, select, textarea, [tabindex], [contenteditable="true"]';

let nextDescriptionId = 0;

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
 * The bubble is `aria-hidden` visual reinforcement. As a progressive-enhancement fallback the
 * directive reads the host's native `title` (when no explicit text is passed) and removes the
 * attribute so the slow native browser tooltip never fires alongside ours.
 *
 * Interactive hosts (a control, inside one, or containing one) keep their own accessible name, so
 * screen readers announce it only once. Activating them (click/tap) runs their action and hides the
 * tooltip; touch users get no tooltip there, which is fine because the name already carries it.
 *
 * Non-interactive hosts (badges, info icons, truncated text) become a toggletip: the directive makes
 * them focusable buttons, a click/tap or Enter/Space toggles the bubble (the only way to see it on
 * touch), and a tap outside closes it. The toggle click does not bubble, so a clickable parent (e.g.
 * a card) does not act on it. The text reaches screen readers as the host's `aria-label` when the
 * host has no text of its own, and as `aria-describedby` otherwise. A tooltip that merely repeats
 * the host text (e.g. a truncated title) stays a plain tooltip, since it adds no information.
 *
 * CommentLastReviewed: 2026-10-02
 */
@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  private readonly bubbleService = inject(TooltipBubbleService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly document = inject(DOCUMENT);

  // Constants
  private readonly hideGraceMs = 100;

  // Input properties
  readonly appTooltip = input<string>('');
  readonly tooltipShowDelay = input<number>(250);

  // Signals
  private readonly isNonInteractive = signal(false);
  private readonly nativeTitle = signal<string>('');
  private readonly visible = signal(false);

  // Computed Signals
  private readonly text = computed(() => this.appTooltip() || this.nativeTitle());

  private bubble?: TooltipBubble;
  private description?: HTMLElement;
  private isToggletip = false;
  private ownsAriaLabel = false;
  private showTimer?: ReturnType<typeof setTimeout>;
  private hideTimer?: ReturnType<typeof setTimeout>;

  private readonly onOutsidePointerdown = (event: PointerEvent) => {
    if (!(event.target instanceof Node && this.elementRef.nativeElement.contains(event.target))) {
      this.hideNow();
    }
  };

  // Effects
  private readonly renderEffect = effect(() => {
    const text = this.text();
    if (this.visible() && text) {
      this.showTooltip(text);
    } else {
      this.hideTooltip();
    }
  });

  private readonly toggletipAttributesEffect = afterRenderEffect(() => {
    const text = this.text();
    const hostText = this.elementRef.nativeElement.textContent?.trim() ?? '';
    // A tooltip that repeats the host text (e.g. a truncated title) adds nothing, so it stays plain.
    this.isToggletip = this.isNonInteractive() && !!text && text !== hostText;
    if (this.isToggletip) {
      this.applyToggletipAttributes(text, hostText);
    } else {
      this.removeToggletipAttributes();
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

    this.isNonInteractive.set(!host.closest(FOCUSABLE) && !host.querySelector(FOCUSABLE));

    const show = () => this.scheduleShow();
    const hide = () => this.scheduleHide();
    const activate = (event: MouseEvent) => {
      if (this.isToggletip) {
        // Keep a clickable parent (e.g. app-card) from acting on a tap meant for the toggletip.
        event.stopPropagation();
        this.toggle();
      } else {
        this.hideNow();
      }
    };
    const keydown = (event: KeyboardEvent) => {
      if (this.isToggletip && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        this.toggle();
      }
    };

    host.addEventListener('mouseenter', show);
    host.addEventListener('mouseleave', hide);
    host.addEventListener('focusin', show);
    host.addEventListener('focusout', hide);
    host.addEventListener('click', activate);
    host.addEventListener('keydown', keydown);

    this.destroyRef.onDestroy(() => {
      host.removeEventListener('mouseenter', show);
      host.removeEventListener('mouseleave', hide);
      host.removeEventListener('focusin', show);
      host.removeEventListener('focusout', hide);
      host.removeEventListener('click', activate);
      host.removeEventListener('keydown', keydown);
      this.clearTimers();
      this.hideTooltip();
      this.description?.remove();
    });
  });

  private applyToggletipAttributes(text: string, hostText: string): void {
    const host = this.elementRef.nativeElement;
    host.setAttribute('tabindex', '0');
    host.setAttribute('role', 'button');

    if (!hostText && (this.ownsAriaLabel || !host.hasAttribute('aria-label'))) {
      host.setAttribute('aria-label', text);
      this.ownsAriaLabel = true;
    }

    if (hostText) {
      this.description ??= this.createDescription();
      this.description.textContent = text;
      host.setAttribute('aria-describedby', this.description.id);
    } else {
      host.removeAttribute('aria-describedby');
    }
  }

  private clearTimers(): void {
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
  }

  private createDescription(): HTMLElement {
    // Lives on the body, not in the host, because hosts like fa-icon re-render their own content.
    const description = this.document.createElement('span');
    description.id = `app-tooltip-description-${nextDescriptionId++}`;
    description.hidden = true;
    this.document.body.appendChild(description);
    return description;
  }

  private hideNow(): void {
    this.clearTimers();
    this.visible.set(false);
  }

  private hideTooltip(): void {
    this.document.removeEventListener('pointerdown', this.onOutsidePointerdown);
    this.bubble?.hide();
    this.bubble = undefined;
  }

  private removeToggletipAttributes(): void {
    const host = this.elementRef.nativeElement;
    if (host.getAttribute('role') !== 'button') {
      return;
    }
    host.removeAttribute('tabindex');
    host.removeAttribute('role');
    host.removeAttribute('aria-describedby');
    if (this.ownsAriaLabel) {
      host.removeAttribute('aria-label');
      this.ownsAriaLabel = false;
    }
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
    if (this.isToggletip) {
      // Tap outside closes a toggletip; touch has no mouseleave to do it.
      this.document.addEventListener('pointerdown', this.onOutsidePointerdown);
    }

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

  private toggle(): void {
    this.clearTimers();
    this.visible.update((visible) => !visible);
  }
}
