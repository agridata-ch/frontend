import { effect, ElementRef, Signal, signal, WritableSignal } from '@angular/core';

export enum VerticalPlacement {
  TOP = 'top',
  BOTTOM = 'bottom',
}

/**
 * Chooses the vertical placement for a floating element (popover, tooltip) relative to its trigger.
 * Prefers BOTTOM when the content fits below; when it does not, flips to TOP only if there is more
 * room above than below (so it never gets clipped past the top edge for a trigger near the top of
 * the viewport). Otherwise stays BOTTOM.
 *
 * CommentLastReviewed: 2026-07-10
 *
 * @param triggerRect Vertical bounds of what the floating content anchors to. Accepts a full
 * `DOMRect` as well as a zero-height point, e.g. a mouse cursor position.
 * @param contentHeight Rendered height of the floating content, in pixels.
 * @param viewportHeight Viewport height to measure against; defaults to `window.innerHeight`.
 * @returns BOTTOM when the content fits below the trigger or there is no more room above, otherwise TOP.
 */
export function calculateVerticalPlacement(
  triggerRect: Pick<DOMRect, 'bottom' | 'top'>,
  contentHeight: number,
  viewportHeight: number = window.innerHeight,
  boundaryTop: number = 0,
): VerticalPlacement {
  const spaceBelow = viewportHeight - triggerRect.bottom;
  if (spaceBelow >= contentHeight) {
    return VerticalPlacement.BOTTOM;
  }
  const spaceAbove = triggerRect.top - boundaryTop;
  return spaceAbove > spaceBelow ? VerticalPlacement.TOP : VerticalPlacement.BOTTOM;
}

/**
 * Finds the nearest scrollable/clipping ancestor and returns its top and bottom edge, falling back
 * to the viewport bounds when the trigger sits in unclipped, page-level flow. Both edges must come
 * from the same reference frame so `calculateVerticalPlacement` compares like with like.
 */
function getClippingBoundary(element: HTMLElement): Pick<DOMRect, 'bottom' | 'top'> {
  let ancestor = element.parentElement;
  while (ancestor) {
    if (/(auto|scroll|hidden)/.test(getComputedStyle(ancestor).overflowY)) {
      return ancestor.getBoundingClientRect();
    }
    ancestor = ancestor.parentElement;
  }
  return { top: 0, bottom: window.innerHeight };
}

/**
 * Reactively tracks whether a popover anchored to `trigger` should open above it instead of below,
 * based on `calculateVerticalPlacement` and the space left by the nearest clipping ancestor. Shared
 * by the select-style dropdowns (`agridata-select`, `agridata-multi-select`) so both flip consistently
 * instead of each re-implementing the same effect.
 *
 * CommentLastReviewed: 2026-09-17
 *
 * @param trigger The element the popover is anchored to (e.g. the dropdown's toggle button).
 * @param popover The floating element being placed.
 */
export function createOpenAboveSignal(
  trigger: Signal<ElementRef<HTMLElement> | undefined>,
  popover: Signal<ElementRef<HTMLElement> | undefined>,
): Signal<boolean> {
  const openAbove = signal(false);

  const recalculate = (triggerElement: HTMLElement, popoverElement: HTMLElement): void => {
    const boundary = getClippingBoundary(triggerElement);
    const placement = calculateVerticalPlacement(
      triggerElement.getBoundingClientRect(),
      popoverElement.getBoundingClientRect().height,
      boundary.bottom,
      boundary.top,
    );
    openAbove.set(placement === VerticalPlacement.TOP);
  };

  effect((onCleanup) => {
    const triggerElement = trigger()?.nativeElement;
    const popoverElement = popover()?.nativeElement;
    if (!triggerElement || !popoverElement) {
      return;
    }

    recalculate(triggerElement, popoverElement);

    const resizeObserver = new ResizeObserver(() => recalculate(triggerElement, popoverElement));
    resizeObserver.observe(triggerElement);
    resizeObserver.observe(popoverElement);
    onCleanup(() => resizeObserver.disconnect());
  });

  return openAbove.asReadonly();
}

/**
 * Copies the provided text to the system clipboard
 *
 * CommentLastReviewed: 2026-01-20
 *
 * @param text The text to copy to clipboard
 * @returns A promise that resolves when the text has been copied
 * @throws Error if clipboard operation fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Indents a JSON or XML request template for display. Anything that doesn't look like either is
 * returned unchanged.
 *
 * CommentLastReviewed: 2026-11-02
 *
 * @param value The raw template, may contain `{{placeholders}}`
 * @returns The indented template
 */
export function formatTemplate(value: string): string {
  const trimmed = value.trim();
  if (trimmed.startsWith('<')) return formatXml(trimmed);
  return /^[{[]/.test(trimmed) ? formatJson(trimmed) : value;
}

/**
 * Token-based JSON indentation instead of JSON.parse: templates contain unquoted placeholders
 * (`"pageSize":{{pageSize}}`), which aren't valid JSON. Strings and placeholders are kept as is.
 */
function formatJson(json: string): string {
  const tokens = json.match(/"(?:\\.|[^"\\])*"|\{\{[^{}]*\}\}|[{}[\],:]|[^\s"{}[\],:]+/g) ?? [];
  let depth = 0;
  const newline = (): string => '\n' + '  '.repeat(depth);
  const formatted = tokens
    .map((token) => {
      switch (token) {
        case '{':
        case '[':
          depth++;
          return token + newline();
        case '}':
        case ']':
          depth = Math.max(depth - 1, 0);
          return newline() + token;
        case ',':
          return token + newline();
        case ':':
          return ': ';
        default:
          return token;
      }
    })
    .join('');
  // Collapse empty objects/arrays back onto one line.
  return formatted.replaceAll(/([{[])\n\s*([}\]])/g, '$1$2');
}

// ponytail: line-based indentation, no XML parser; mixed content/CDATA stay as they are.
function formatXml(xml: string): string {
  let depth = 0;
  return xml
    .replaceAll(/>\s*</g, '>\n<')
    .split('\n')
    .map((line) => {
      if (line.startsWith('</')) depth = Math.max(depth - 1, 0);
      const indented = '  '.repeat(depth) + line;
      const opensTag = /^<[^/?!]/.test(line) && !line.endsWith('/>') && !line.includes('</');
      if (opensTag) depth++;
      return indented;
    })
    .join('\n');
}

/**
 * Starts a countdown that decrements the given signal by 1 every second until it reaches 0.
 * Clears any previously running countdown timer before starting a new one.
 *
 * CommentLastReviewed: 2026-03-23
 *
 * @param countdownValue Signal holding the current countdown value.
 * @param durationSeconds Total countdown duration in seconds.
 * @param existingTimer Previously returned timer handle to clear, if any.
 * @returns The new interval handle — store it and pass it back on the next call or to clearInterval.
 */
export function startCountdown(
  countdownValue: WritableSignal<number>,
  durationSeconds: number,
  existingTimer?: ReturnType<typeof setInterval>,
): ReturnType<typeof setInterval> {
  if (existingTimer) {
    clearInterval(existingTimer);
  }

  countdownValue.set(durationSeconds);

  const timer = setInterval(() => {
    const current = countdownValue();
    if (current <= 1) {
      countdownValue.set(0);
      clearInterval(timer);
    } else {
      countdownValue.set(current - 1);
    }
  }, 1000);

  return timer;
}
