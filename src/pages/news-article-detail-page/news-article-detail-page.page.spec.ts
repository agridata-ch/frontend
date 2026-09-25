import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { CmsService, NewsArticle, NewsArticlesResponse } from '@/entities/cms';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import { TitleService } from '@/shared/lib/title.service';
import {
  createMockCmsService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockTitleService,
  MockCmsService,
  MockErrorHandlerService,
  MockI18nService,
  MockTitleService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { NewsArticleDetailPage } from './news-article-detail-page.page';

const article = (overrides: Partial<NewsArticle> = {}): NewsArticle => ({
  id: 1,
  documentId: 'news-1',
  title: 'Erster Artikel',
  slug: 'erster-artikel',
  description: 'Beschreibung',
  teaserText: 'Teaser',
  endDate: null,
  image: { id: 10, documentId: 'img-1', alternativeText: null, url: '/uploads/news-1.jpg' },
  imageAlt: 'Titelbild',
  category: { id: 5, documentId: 'cat-1', name: 'Wetter', slug: 'wetter' },
  createdAt: '2026-01-01',
  locale: 'de',
  localizations: [{ id: 2, documentId: 'news-1', locale: 'fr', slug: 'premier-article' }],
  ...overrides,
});

const response = (articles: NewsArticle[]): NewsArticlesResponse => ({
  data: articles,
  meta: { pagination: { page: 1, pageSize: 1, pageCount: 1, total: articles.length } },
});

describe('NewsArticleDetailPage', () => {
  let fixture: ComponentFixture<NewsArticleDetailPage>;
  let component: NewsArticleDetailPage;
  let cmsService: MockCmsService;
  let errorService: MockErrorHandlerService;
  let i18nService: MockI18nService;
  let titleService: MockTitleService;
  let router: Router;
  let navSpy: ReturnType<typeof vi.spyOn>;

  async function init(slug = 'erster-artikel'): Promise<void> {
    fixture = TestBed.createComponent(NewsArticleDetailPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('slug', slug);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    cmsService = createMockCmsService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();
    titleService = createMockTitleService();

    await TestBed.configureTestingModule({
      imports: [NewsArticleDetailPage, createTranslocoTestingModule()],
      providers: [
        { provide: CmsService, useValue: cmsService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: i18nService },
        { provide: TitleService, useValue: titleService },
        provideRouter([]),
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  describe('loading', () => {
    it('fetches the article by slug independent of the active locale', async () => {
      cmsService.fetchNewsArticle.mockResolvedValue(response([article()]));

      await init('erster-artikel');

      expect(cmsService.fetchNewsArticle).toHaveBeenCalledWith('erster-artikel', [
        'de',
        'fr',
        'it',
      ]);
      expect(component['article']()).toEqual(article());
    });

    it('sets the page title from the article title', async () => {
      cmsService.fetchNewsArticle.mockResolvedValue(response([article({ title: 'Titel' })]));

      await init();

      expect(titleService.setTranslatedTitle).toHaveBeenCalledWith('Titel');
    });

    it('navigates to not-found when no article matches the slug', async () => {
      cmsService.fetchNewsArticle.mockResolvedValue(response([]));

      await init('unbekannt');

      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND]);
    });
  });

  describe('errors', () => {
    // Spy error() on a fresh fixture before the first detectChanges so the effect reads it on its
    // initial run (a later re-spy would not re-trigger the effect).
    function createWithError(error: Error): void {
      fixture = TestBed.createComponent(NewsArticleDetailPage);
      component = fixture.componentInstance;
      vi.spyOn(component['articleResource'], 'error').mockReturnValue(error);
      fixture.detectChanges();
    }

    it('navigates to not-found on a 404 error', () => {
      const cause = new HttpErrorResponse({ status: 404 });

      createWithError(new Error('Not found', { cause }));

      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND], {
        state: { error: 'Not found' },
      });
    });

    it('handles other errors and navigates to the error page', () => {
      const cause = new HttpErrorResponse({ status: 500 });
      const error = new Error('Boom', { cause });

      createWithError(error);

      expect(errorService.handleError).toHaveBeenCalledWith(error);
      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.ERROR]);
    });
  });

  describe('locale switch', () => {
    it('navigates to the translated slug when the language changes', async () => {
      cmsService.fetchNewsArticle.mockResolvedValue(response([article()]));
      await init();

      i18nService.setActiveLang('fr');
      await fixture.whenStable();

      expect(navSpy).toHaveBeenCalledWith([`/${ROUTE_PATHS.NEWS_PATH}`, 'premier-article'], {
        replaceUrl: true,
      });
    });

    it('navigates to not-found when the article has no translation in the target locale', async () => {
      cmsService.fetchNewsArticle.mockResolvedValue(response([article({ localizations: [] })]));
      await init();

      i18nService.setActiveLang('fr');
      await fixture.whenStable();

      expect(navSpy).toHaveBeenCalledWith([ROUTE_PATHS.NOT_FOUND]);
    });

    it('redirects to the reader-locale slug when opening a link in a different locale', async () => {
      // Active lang is 'de'; the opened slug belongs to the Italian entry.
      cmsService.fetchNewsArticle.mockResolvedValue(
        response([
          article({
            slug: 'primo-articolo',
            locale: 'it',
            localizations: [{ id: 2, documentId: 'news-1', locale: 'de', slug: 'erster-artikel' }],
          }),
        ]),
      );

      await init('primo-articolo');

      expect(navSpy).toHaveBeenCalledWith([`/${ROUTE_PATHS.NEWS_PATH}`, 'erster-artikel'], {
        replaceUrl: true,
      });
    });
  });
});
