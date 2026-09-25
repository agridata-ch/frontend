import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, input, resource, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { faArrowRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { CmsService, NewsArticle, NewsArticlesResponse, resolveAlt } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nPipe, I18nService } from '@/shared/i18n';
import { generateMediaUrl } from '@/shared/lib/cms';
import { TitleService } from '@/shared/lib/title.service';
import { MarkdownPipe } from '@/shared/markdown';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { BlockRendererComponent } from '@/widgets/cms-blocks';
import { CmsFooterBlockComponent } from '@/widgets/cms-blocks/cms-footer-block';

import { availableLangs } from '../../../transloco.config';

/**
 * Renders a single news article (title, date, category, cover image, markdown body, attachment
 * links) plus its CMS blocks and footer. Reuses the CMS page chrome minus the hero. On a runtime
 * language switch it resolves the article's slug in the new locale and navigates there; a missing
 * translation or unknown slug routes to not-found.
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-news-article-detail-page',
  imports: [
    RouterLink,
    FontAwesomeModule,
    AgridataBadgeComponent,
    AgridataDatePipe,
    BlockRendererComponent,
    CmsFooterBlockComponent,
    ErrorOutletComponent,
    I18nPipe,
    I18nDirective,
    MarkdownPipe,
  ],
  templateUrl: './news-article-detail-page.page.html',
})
export class NewsArticleDetailPage {
  // Injects
  private readonly cmsService = inject(CmsService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly titleService = inject(TitleService);

  // Constants
  protected readonly ROUTE_PATHS = ROUTE_PATHS;
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly breadcrumbIcon = faArrowRight;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly generateMediaUrl = generateMediaUrl;
  protected readonly resolveAlt = resolveAlt;

  // Input properties
  // binds to the route parameter :slug
  readonly slug = input<string>('');

  // Signals
  // Resolves the article by searching the active locale first, then the others, so a link whose
  // slug belongs to another language still loads (Strapi matches a slug only under its own locale).
  // localeSwitchEffect then redirects to the active locale's slug. lang() is read for ordering only
  // (not a resource param): a language switch redirects to a new slug, which re-runs the loader.
  protected readonly articleResource = resource({
    params: () => ({ slug: this.slug() }),
    loader: ({ params }) => {
      const active = this.i18nService.lang();
      const locales = [active, ...availableLangs.filter((lang) => lang !== active)];
      return this.cmsService.fetchNewsArticle(params.slug, locales);
    },
  });

  // Computed Signals
  protected readonly article = computed(() => {
    if (this.articleResource.error()) return undefined;
    return (this.articleResource.value() as NewsArticlesResponse | undefined)?.data?.[0];
  });

  // Effects
  // Keeps the URL slug in sync with the active language: navigate to the sibling-locale slug, or to
  // not-found when the article has no translation in the target locale.
  private readonly localeSwitchEffect = effect(() => {
    const lang = this.i18nService.lang();
    const article = this.article();
    if (!article?.locale || article.locale === lang) return;

    untracked(() => this.navigateToLocalizedSlug(article, lang));
  });

  // Mirrors the CMS page error handling and routes to not-found for an unknown slug (empty result).
  private readonly errorEffect = effect(() => {
    const error = this.articleResource.error();
    if (error) {
      if (error?.cause instanceof HttpErrorResponse && error?.cause.status === 404) {
        this.router.navigate([ROUTE_PATHS.NOT_FOUND], { state: { error: error.message } }).then();
      } else {
        this.errorService.handleError(error);
        this.router.navigate([ROUTE_PATHS.ERROR]).then();
      }
      return;
    }

    if (this.articleResource.isLoading()) return;

    if (!this.article()) {
      this.router.navigate([ROUTE_PATHS.NOT_FOUND]).then();
    }
  });

  private readonly titleEffect = effect(() => {
    this.titleService.setTranslatedTitle(this.article()?.title);
  });

  private navigateToLocalizedSlug(article: NewsArticle, lang: string): void {
    const translated = article.localizations?.find((localization) => localization.locale === lang);
    if (translated) {
      this.router.navigate([`/${ROUTE_PATHS.NEWS_PATH}`, translated.slug], { replaceUrl: true });
    } else {
      this.router.navigate([ROUTE_PATHS.NOT_FOUND]).then();
    }
  }
}
