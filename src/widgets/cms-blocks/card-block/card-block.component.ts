import { Component, input } from '@angular/core';

import { Card } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';

/**
 * Implements the logic for displaying a card block.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-card-block',
  imports: [],
  templateUrl: './card-block.component.html',
})
export class CardBlockComponent {
  readonly card = input.required<Card>();

  protected readonly generateMediaUrl = generateMediaUrl;
}
