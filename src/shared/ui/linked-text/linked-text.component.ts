import { Component, computed, input } from '@angular/core';

import { LinkedTextParts } from '@/shared/utils';

/**
 * Renders a parsed linked-text snippet (`before` + optional link + `after`) produced by
 * `parseLinkedText`. The link is emitted only when a valid href resolves — either an
 * explicit `href` input or a `configOption:linkText` scheme (mailto:/tel:) from the parts;
 * otherwise the link text is rendered as plain text so a malformed translation never
 * produces a broken anchor.
 *
 * CommentLastReviewed: 2026-07-23
 */
@Component({
  selector: 'app-linked-text',
  templateUrl: './linked-text.component.html',
})
export class LinkedTextComponent {
  // Input properties
  readonly parts = input.required<LinkedTextParts>();
  readonly href = input<string>();

  // Computed Signals
  protected readonly resolvedHref = computed<string | null>(() => {
    const explicit = this.href();
    if (explicit) return explicit;

    const { urlSchema, linkText } = this.parts();
    if (urlSchema && linkText) return `${urlSchema}:${linkText}`;

    return null;
  });
}
