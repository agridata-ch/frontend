import { Component, computed, input } from '@angular/core';

import { LinkedTextParts } from '@/shared/utils';

/**
 * Renders a parsed linked-text snippet (`before` + optional link + `after`) produced by
 * `parseLinkedText`. The link is emitted only when a valid href resolves — either an
 * explicit `href` input or a `configOption:linkText` scheme (mailto:/tel:) from the parts;
 * otherwise the link text is rendered as plain text so a malformed translation never
 * produces a broken anchor.
 *
 * The whole snippet is built as one HTML string and bound via a single `[innerHTML]`, so no
 * template whitespace sits between the parts. This keeps the exact spacing baked into the parsed
 * strings (e.g. `after: '.'` renders directly after the link, with no stray space) and stays
 * correct regardless of how the template file is formatted. Angular sanitizes the bound string
 * on assignment, which escapes the text and preserves the safe `<a>` markup.
 *
 * CommentLastReviewed: 2026-09-18
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
  protected readonly content = computed<string>(() => {
    const { before, linkText, after } = this.parts();
    const href = this.resolvedHref();
    const link = href
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer" class="underline hover:text-agridata-primary-600">${linkText ?? ''}</a>`
      : (linkText ?? '');

    return before + link + after;
  });

  private readonly resolvedHref = computed<string | null>(() => {
    const explicit = this.href();
    if (explicit) return explicit;

    const { urlSchema, linkText } = this.parts();
    if (urlSchema && linkText) return `${urlSchema}:${linkText}`;

    return null;
  });
}
