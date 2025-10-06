import { Component, input } from '@angular/core';

import { Card } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { MarkdownPipe } from '@/shared/markdown/markdown.pipe';

export type CardSize = 'small' | 'medium' | 'large';

/**
 * Implements the logic for displaying a card block.
 *
 * CommentLastReviewed: 2025-09-02
 */
@Component({
  selector: 'app-card-block',
  imports: [MarkdownPipe],
  templateUrl: './card-block.component.html',
})
export class CardBlockComponent {
  readonly card = input.required<Card>();
  readonly size = input<CardSize>('medium');

  protected readonly generateMediaUrl = generateMediaUrl;
}
