import { Component, input } from '@angular/core';

import { TooltipDirective } from '@/shared/tooltip';

/**
 * Generic content card providing shared chrome and layout. Renders an optional image, title and
 * description plus `[cardTags]` (badges/tags) and `[cardFooter]` (bottom-aligned
 * actions) projection slots for consumer-specific content. Holds no domain knowledge.
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [TooltipDirective],
})
export class CardComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly imageUrl = input<string>();
  readonly imageAlt = input<string>('');
  readonly loading = input(false);
}
