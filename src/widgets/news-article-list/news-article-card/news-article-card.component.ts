import { Component, computed, input } from '@angular/core';

import { NewsArticle, resolveAlt } from '@/entities/cms';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { generateMediaUrl } from '@/shared/lib/cms';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { CardComponent } from '@/shared/ui/card';

/**
 * Renders a single news article as a card: thumbnail cover image, title, a markdown description
 * teaser, plus the category badge and end date on one row.
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-news-article-card',
  imports: [AgridataBadgeComponent, AgridataDatePipe, CardComponent],
  templateUrl: './news-article-card.component.html',
})
export class NewsArticleCardComponent {
  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;

  // Input properties
  readonly article = input.required<NewsArticle>();

  // Computed Signals
  protected readonly imageUrl = computed(() =>
    generateMediaUrl(this.article().image.formats?.thumbnail?.url ?? this.article().image.url),
  );
  protected readonly imageAlt = computed(() =>
    resolveAlt(this.article().imageAlt, this.article().image),
  );
}
