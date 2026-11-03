import { signal } from '@angular/core';

import { I18nService } from '@/shared/i18n';
import { AnchorRect, TooltipBubbleService } from '@/shared/tooltip';
import { copyToClipboard } from '@/shared/utils';

/**
 * Copies a value to the clipboard and confirms the result in a transient bubble at the cursor (or at
 * the trigger for keyboard activation). `message` mirrors the bubble text for an sr-only live region
 * while the bubble is up. Texts come from `${keyPrefix}.copied` / `${keyPrefix}.copyFailed`.
 *
 * CommentLastReviewed: 2026-11-03
 */
export function createCopyFeedback(
  bubbleService: TooltipBubbleService,
  i18nService: I18nService,
  keyPrefix: string,
) {
  const message = signal('');

  async function copy(value: string, event: MouseEvent, trigger: HTMLElement): Promise<void> {
    let key = 'copied';
    try {
      await copyToClipboard(value);
    } catch {
      key = 'copyFailed';
    }

    // Keyboard activation reports no pointer position (detail === 0) - anchor to the button instead.
    const anchor: AnchorRect =
      event.detail === 0
        ? trigger.getBoundingClientRect()
        : { top: event.clientY, bottom: event.clientY, left: event.clientX, width: 0, height: 0 };

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
