import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, effect, inject, signal, untracked } from '@angular/core';

import { CmsService, NewsArticle, NewsArticlesResponse } from '@/entities/cms';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { InfiniteScrollComponent } from '@/shared/infinite-scroll';
import { CardComponent } from '@/shared/ui/card';
import { EmptyStateComponent } from '@/shared/ui/empty-state';

import { NewsArticleCardComponent } from './news-article-card/news-article-card.component';

/**
 * Reusable news article list: a responsive grid of article cards. The first page is loaded on init
 * (and whenever the language changes); further pages are appended as the user scrolls to the bottom.
 *
 * CommentLastReviewed: 2026-09-24
 */
@Component({
  selector: 'app-news-article-list',
  imports: [
    CardComponent,
    EmptyStateComponent,
    I18nDirective,
    InfiniteScrollComponent,
    NewsArticleCardComponent,
  ],
  templateUrl: './news-article-list.component.html',
})
export class NewsArticleListComponent {
  // Injects
  private readonly cmsService = inject(CmsService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
  private readonly PAGE_SIZE = 10;

  // Signals
  protected readonly articles = signal<NewsArticle[]>([]);
  protected readonly loading = signal(false);
  protected readonly totalPages = signal(1);
  protected readonly error = signal<unknown>(undefined);
  private readonly page = signal(0);
  private requestId = 0;

  // Computed Signals
  protected readonly hasMore = computed(() => this.page() < this.totalPages());
  protected readonly loaded = computed(() => this.page() > 0);
  // Fixed-length placeholder grid shown while a page loads.
  protected readonly skeletons = computed(() => Array.from({ length: this.PAGE_SIZE }));

  // Effects
  // Loads the first page and re-loads whenever the language changes; the request-id guard drops any
  // in-flight response the reset supersedes.
  private readonly _localeEffect = effect(() => {
    this.i18nService.lang();
    untracked(() => void this.reload());
  });

  protected async loadNext(): Promise<void> {
    if (this.loading() || !this.hasMore() || this.error()) return;

    await this.load();
  }

  // Fetches the current page and appends it. A per-request id guards against stale responses: a
  // reset (language change) or newer page supersedes any in-flight request, whose result is dropped.
  private async load(): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    try {
      const response = (await this.cmsService.fetchNewsArticles(
        this.i18nService.lang(),
        this.page() + 1,
        this.PAGE_SIZE,
      )) as NewsArticlesResponse;
      if (requestId !== this.requestId) return;

      this.articles.update((current) => [...current, ...response.data]);
      this.totalPages.set(response.meta.pagination.pageCount);
      this.page.update((current) => current + 1);
    } catch (error: unknown) {
      if (requestId !== this.requestId) return;
      if (error instanceof Error || error instanceof HttpErrorResponse) {
        this.errorService.handleError(error);
      }
      this.error.set(error);
    } finally {
      if (requestId === this.requestId) {
        this.loading.set(false);
      }
    }
  }

  // Resets paging and reloads from the first page (Strapi pagination is 1-based).
  private reload(): Promise<void> {
    this.page.set(0);
    this.totalPages.set(1);
    this.articles.set([]);
    this.error.set(undefined);
    return this.load();
  }
}
