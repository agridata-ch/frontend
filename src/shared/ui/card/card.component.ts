import { Component, input, output } from '@angular/core';

import { TooltipDirective } from '@/shared/tooltip';

/**
 * Generic content card providing shared chrome and layout. Renders an optional image, title and
 * description plus `[cardTags]` (badges/tags) and `[cardFooter]` (bottom-aligned
 * actions) projection slots for consumer-specific content. Holds no domain knowledge.
 * Emits `handleClick` when the card is clicked, unless the user is selecting text.
 *
 * CommentLastReviewed: 2026-09-30
 */
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  imports: [TooltipDirective],
  host: { class: 'cursor-pointer', '(click)': 'click()' },
})
export class CardComponent {
  readonly title = input<string>('');
  readonly description = input<string>('');
  readonly imageUrl = input<string>();
  readonly imageAlt = input<string>('');
  readonly loading = input(false);
  readonly handleClick = output<void>();

  protected click(): void {
    // A drag-select fires click on mouseup; don't navigate away while the user selects text.
    if (!getSelection()?.toString()) {
      this.handleClick.emit();
    }
  }
}
