import { DOCUMENT } from '@angular/common';
import { inject, RendererFactory2, Service } from '@angular/core';

import { calculateVerticalPlacement, VerticalPlacement } from '@/shared/utils';

/**
 * Vertical and horizontal bounds the bubble anchors to. Satisfied by `getBoundingClientRect()` as
 * well as by a zero-size point, e.g. `{ top: y, bottom: y, left: x, width: 0, height: 0 }` for a
 * mouse cursor.
 */
export type AnchorRect = Pick<DOMRect, 'bottom' | 'height' | 'left' | 'top' | 'width'>;

/**
 * Hooks a hoverable, dismissible bubble needs so its owner can keep its own state in sync.
 */
export type TooltipBubbleHooks = {
  /** Escape was pressed while the bubble was open. */
  onDismiss?: () => void;
  /** Pointer entered the bubble itself. */
  onPointerEnter?: () => void;
  /** Pointer left the bubble itself. */
  onPointerLeave?: () => void;
};

/**
 * Handle to the bubble a caller currently owns. Both calls become no-ops once another caller has
 * taken the bubble over, so owners cannot destroy or rewrite each other's bubble.
 */
export type TooltipBubble = {
  hide(): void;
  /** Retitles the bubble; `false` means the handle is stale and the caller has to show a new one. */
  setText(text: string): boolean;
};

const BUBBLE_CLASSES =
  'rounded bg-agridata-primary-text px-2 py-1 text-xs text-white shadow max-w-4/5 sm:max-w-1/3';
const GAP = 8;

/**
 * Owns the tooltip bubble element: creates it on `document.body`, positions it against an anchor, and
 * tears it down again. Appending to the body is what keeps the bubble out of ancestor clipping, which
 * matters because a `backdrop-filter` or `transform` ancestor (e.g. a side panel) makes itself the
 * containing block for `position: fixed` descendants.
 *
 * This is the element half of the tooltip; `TooltipDirective` is the behaviour half (hover, focus,
 * delays) and is the main consumer. `showTransient` serves one-off feedback that is not attached to a
 * host at all, such as a "copied to clipboard" confirmation at the mouse cursor.
 *
 * Only one bubble exists at a time; showing a new one replaces the previous.
 *
 * CommentLastReviewed: 2026-08-04
 */
@Service()
export class TooltipBubbleService {
  private readonly document = inject(DOCUMENT);
  private readonly renderer = inject(RendererFactory2).createRenderer(null, null);

  private anchor?: () => AnchorRect;
  private element?: HTMLElement;
  private hooks?: TooltipBubbleHooks;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private generation = 0;
  private transientOnHide?: () => void;

  private readonly reposition = () => this.position();

  private readonly onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      const onDismiss = this.hooks?.onDismiss;
      this.destroy();
      onDismiss?.();
    }
  };

  /**
   * Shows a bubble that stays until hidden. It is hoverable and dismissible with Escape, and is
   * `aria-hidden` so screen readers announce the host's own accessible name only once.
   */
  show(text: string, anchor: () => AnchorRect, hooks?: TooltipBubbleHooks): TooltipBubble {
    const generation = this.create(text, anchor, true);
    this.hooks = hooks;

    return {
      hide: () => {
        if (this.generation === generation) {
          this.destroy();
        }
      },
      setText: (next: string) => {
        if (this.generation !== generation || !this.element) {
          return false;
        }
        this.renderer.setProperty(this.element, 'textContent', next);
        this.position();
        return true;
      },
    };
  }

  /**
   * Shows a bubble that hides itself after `durationMs`. It ignores the pointer entirely, so it can
   * sit under the cursor without swallowing hovers or clicks. `onHide` also runs when another caller
   * takes the bubble over early, so the caller's own state never gets stranded.
   */
  showTransient(
    text: string,
    anchor: () => AnchorRect,
    durationMs: number,
    onHide?: () => void,
  ): void {
    const generation = this.create(text, anchor, false);
    this.transientOnHide = onHide;
    this.hideTimer = setTimeout(() => {
      if (this.generation === generation) {
        this.destroy();
      }
      this.finishTransient();
    }, durationMs);
  }

  private create(text: string, anchor: () => AnchorRect, interactive: boolean): number {
    this.finishTransient();
    this.destroy();
    this.anchor = anchor;

    const element = this.renderer.createElement('span');
    this.renderer.setAttribute(element, 'role', 'tooltip');
    this.renderer.setAttribute(element, 'aria-hidden', 'true');
    this.renderer.setProperty(element, 'textContent', text);
    this.renderer.setAttribute(
      element,
      'class',
      `fixed z-50 whitespace-pre-line ${interactive ? 'pointer-events-auto' : 'pointer-events-none'} ${BUBBLE_CLASSES}`,
    );

    if (interactive) {
      // Keep the bubble open while the pointer is over it (WCAG 1.4.13 "hoverable").
      this.renderer.listen(element, 'mouseenter', () => this.hooks?.onPointerEnter?.());
      this.renderer.listen(element, 'mouseleave', () => this.hooks?.onPointerLeave?.());
      this.document.addEventListener('keydown', this.onKeydown);
    }

    this.renderer.appendChild(this.document.body, element);
    this.element = element;

    // Track the anchor while visible rather than keeping always-on listeners.
    window.addEventListener('scroll', this.reposition, true);
    window.addEventListener('resize', this.reposition);

    this.position();
    return ++this.generation;
  }

  private destroy(): void {
    if (!this.element) {
      return;
    }
    window.removeEventListener('scroll', this.reposition, true);
    window.removeEventListener('resize', this.reposition);
    this.document.removeEventListener('keydown', this.onKeydown);
    this.renderer.removeChild(this.document.body, this.element);
    this.anchor = undefined;
    this.element = undefined;
    this.hooks = undefined;
  }

  private finishTransient(): void {
    clearTimeout(this.hideTimer);
    this.hideTimer = undefined;

    const onHide = this.transientOnHide;
    this.transientOnHide = undefined;
    onHide?.();
  }

  private position(): void {
    const anchor = this.anchor?.();
    if (!this.element || !anchor) {
      return;
    }

    const bubble = this.element.getBoundingClientRect();
    const placement = calculateVerticalPlacement(anchor, bubble.height + GAP);
    const top =
      placement === VerticalPlacement.BOTTOM
        ? anchor.bottom + GAP
        : anchor.top - bubble.height - GAP;

    // Centre horizontally on the anchor, then clamp within the viewport.
    const rawLeft = anchor.left + anchor.width / 2 - bubble.width / 2;
    const maxLeft = window.innerWidth - bubble.width - GAP;
    const left = Math.max(GAP, Math.min(rawLeft, maxLeft));

    this.renderer.setStyle(this.element, 'top', `${top}px`);
    this.renderer.setStyle(this.element, 'left', `${left}px`);
  }
}
