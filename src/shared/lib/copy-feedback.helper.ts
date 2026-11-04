import { signal } from '@angular/core';

import { I18nService } from '@/shared/i18n';
import { AnchorRect, TooltipBubbleService } from '@/shared/tooltip';
import { copyToClipboard } from '@/shared/utils';

/**
 * Copies a value to the clipboard and confirms the result in a transient bubble at the cursor (or at
 * the trigger, `event.currentTarget`, for keyboard activation). `message` mirrors the bubble text
 * for an sr-only live region while the bubble is up. Texts come from `${keyPrefix}.copied` /
 * `${keyPrefix}.copyFailed`.
 *
 * CommentLastReviewed: 2026-11-04
 */
export function createCopyFeedback(
  bubbleService: TooltipBubbleService,
  i18nService: I18nService,
  keyPrefix: string,
) {
  const message = signal('');

  async function copy(value: string, event: Event): Promise<void> {
    // Read synchronously: currentTarget is cleared once dispatch ends, before the await resumes.
    const triggerRect =
      event.currentTarget instanceof Element
        ? event.currentTarget.getBoundingClientRect()
        : new DOMRect();
    let key = 'copied';
    try {
      await copyToClipboard(value);
    } catch {
      key = 'copyFailed';
    }

    // Keyboard activation reports no pointer position (detail === 0) - anchor to the button instead.
    const anchor: AnchorRect =
      event instanceof MouseEvent && event.detail !== 0
        ? { top: event.clientY, bottom: event.clientY, left: event.clientX, width: 0, height: 0 }
        : triggerRect;

    const text = i18nService.translate(`${keyPrefix}.${key}`);
    // Show first: it runs the previous bubble's onHide, which would otherwise clear the new message.
    bubbleService.showTransient(
      text,
      () => anchor,
      1500,
      () => message.set(''),
    );
    message.set(text);
  }

  return { message: message.asReadonly(), copy };
}
