import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CmsService, NewsArticle, NewsArticlesResponse } from '@/entities/cms';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockCmsService,
  createMockErrorHandlerService,
  createMockI18nService,
  MockCmsService,
  MockErrorHandlerService,
  MockI18nService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { NewsArticleListComponent } from './news-article-list.component';

class MockIntersectionObserver {
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn();
  constructor(_callback: IntersectionObserverCallback) {}
}

const article = (id: number): NewsArticle => ({
  id,
  documentId: `news-${id}`,
  title: `Artikel ${id}`,
  slug: `artikel-${id}`,
  description: 'Beschreibung',
  teaserText: 'Teaser',
  endDate: null,
  image: { id, documentId: `img-${id}`, alternativeText: null, url: `/uploads/${id}.jpg` },
  imageAlt: 'Alt',
  category: null,
  createdAt: '2026-01-01',
});

const page = (articles: NewsArticle[], pageCount: number, total: number): NewsArticlesResponse => ({
  data: articles,
  meta: { pagination: { page: 1, pageSize: 10, pageCount, total } },
});

describe('NewsArticleListComponent', () => {
  let fixture: ComponentFixture<NewsArticleListComponent>;
  let component: NewsArticleListComponent;
  let cmsService: MockCmsService;
  let errorService: MockErrorHandlerService;
  let i18nService: MockI18nService;
  const originalObserver = globalThis.IntersectionObserver;

  // Renders the component, which loads the first page in its locale effect.
  async function init(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    cmsService = createMockCmsService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [NewsArticleListComponent, createTranslocoTestingModule()],
      providers: [
        { provide: CmsService, useValue: cmsService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: i18nService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsArticleListComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
  });

  it('loads the first page for the active locale on init', async () => {
    cmsService.fetchNewsArticles.mockResolvedValue(page([article(1), article(2)], 1, 2));

    await init();

    expect(cmsService.fetchNewsArticles).toHaveBeenCalledWith('de', 1, 10);
    expect(component['articles']()).toHaveLength(2);
    expect(component['hasMore']()).toBe(false);
  });

  it('appends the next page on loadNext and stops at the last page', async () => {
    cmsService.fetchNewsArticles
      .mockResolvedValueOnce(page([article(1), article(2)], 2, 3))
      .mockResolvedValueOnce(page([article(3)], 2, 3));

    await init();
    expect(component['hasMore']()).toBe(true);

    await component['loadNext']();

    expect(cmsService.fetchNewsArticles).toHaveBeenLastCalledWith('de', 2, 10);
    expect(component['articles']()).toHaveLength(3);
    expect(component['hasMore']()).toBe(false);
  });

  it('handles a load error and stops further loading', async () => {
    const error = new HttpErrorResponse({ status: 500 });
    cmsService.fetchNewsArticles.mockRejectedValue(error);

    await init();

    expect(errorService.handleError).toHaveBeenCalledWith(error);
    expect(component['error']()).toBe(error);

    await component['loadNext']();
    // The error guard blocks any further request beyond the failed initial one.
    expect(cmsService.fetchNewsArticles).toHaveBeenCalledTimes(1);
  });

  it('reloads from the first page when the language changes', async () => {
    cmsService.fetchNewsArticles.mockResolvedValue(page([article(1)], 1, 1));
    await init();

    cmsService.fetchNewsArticles.mockResolvedValue(page([article(9)], 1, 1));
    i18nService.lang.set('fr');
    await init();

    expect(cmsService.fetchNewsArticles).toHaveBeenLastCalledWith('fr', 1, 10);
    expect(component['articles']()).toEqual([article(9)]);
  });
});
