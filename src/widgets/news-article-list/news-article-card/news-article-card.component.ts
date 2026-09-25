import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { faArrowRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NewsArticle, resolveAlt } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nPipe } from '@/shared/i18n';
import { generateMediaUrl } from '@/shared/lib/cms';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent } from '@/shared/ui/button';
import { CardComponent } from '@/shared/ui/card';

import { ButtonVariants } from './../../../shared/ui/button/button.model';

/**
 * Renders a single news article as a card: thumbnail cover image, title, a markdown description
 * teaser, plus the category badge and end date on one row.
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-news-article-card',
  imports: [
    AgridataBadgeComponent,
    AgridataDatePipe,
    CardComponent,
    FontAwesomeModule,
    I18nPipe,
    RouterLink,
    ButtonComponent,
  ],
  templateUrl: './news-article-card.component.html',
})
export class NewsArticleCardComponent {
  // Injects
  private readonly router = inject(Router);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly readMoreIcon = faArrowRight;
  protected readonly ROUTES_PATHS = ROUTE_PATHS;

  // Input properties
  readonly article = input.required<NewsArticle>();

  // Computed Signals
  protected readonly imageUrl = computed(() =>
    generateMediaUrl(this.article().image.formats?.thumbnail?.url ?? this.article().image.url),
  );
  protected readonly imageAlt = computed(() =>
    resolveAlt(this.article().imageAlt, this.article().image),
  );

  // Methods
  protected readonly routeToDetail = (slug: string) => {
    this.router.navigate([ROUTE_PATHS.NEWS_PATH, slug]);
  };
}
