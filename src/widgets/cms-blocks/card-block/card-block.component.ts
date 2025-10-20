import { Component, computed, input } from '@angular/core';

import { Card } from '@/entities/cms';
import { generateMediaUrl } from '@/shared/lib/cms';
import { MarkdownPipe } from '@/shared/markdown/markdown.pipe';

export type CardSize = 'small' | 'medium' | 'large';

/**
 * Implements the logic for displaying a card block.
 *
 * CommentLastReviewed: 2025-10-20
 */
@Component({
  selector: 'app-card-block',
  imports: [MarkdownPipe],
  templateUrl: './card-block.component.html',
})
export class CardBlockComponent {
  readonly card = input.required<Card>();
  readonly size = input<CardSize>('medium');
  readonly bgColorClass = input<string>();

  protected readonly generateMediaUrl = generateMediaUrl;

  readonly isColorized = computed(() => this.card().colorized);
  readonly cardColor = computed(() => {
    const color = this.card().color;
    switch (color) {
      case 'Blue':
        return 'bg-agridata-primary-300';
      case 'Green':
        return 'bg-agridata-secondary-600';
      case 'Yellow':
        return 'bg-yellow-200';
      case 'Red':
        return 'bg-red-300';
      case 'Orange':
        return 'bg-orange-300';
    }
  });

  readonly colorClasses = computed(() => {
    return this.isColorized()
      ? `text-white ${this.cardColor()}`
      : (this.bgColorClass() ?? 'bg-agridata-content-gray');
  });
}
