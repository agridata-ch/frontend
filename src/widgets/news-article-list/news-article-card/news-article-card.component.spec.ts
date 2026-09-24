import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { NewsArticle } from '@/entities/cms';
import { environment } from '@/environments/environment';
import { AgridataBadgeComponent } from '@/shared/ui/badge';

import { NewsArticleCardComponent } from './news-article-card.component';

const baseArticle: NewsArticle = {
  id: 1,
  documentId: 'news-1',
  title: 'Erster Artikel',
  slug: 'erster-artikel',
  description: 'Kurze Beschreibung.',
  teaserText: 'Kurzer Teaser.',
  endDate: '2026-12-31',
  image: {
    id: 10,
    documentId: 'img-1',
    alternativeText: 'Fallback alt',
    url: '/uploads/news-1.jpg',
    formats: {
      thumbnail: {
        name: 'thumbnail_news-1.jpg',
        hash: 'thumb',
        ext: '.jpg',
        mime: 'image/jpeg',
        path: null,
        width: 245,
        height: 138,
        size: 8,
        sizeInBytes: 8000,
        url: '/uploads/thumbnail_news-1.jpg',
      },
    },
  },
  imageAlt: 'Titelbild',
  category: { id: 5, documentId: 'cat-1', name: 'Wetter', slug: 'wetter' },
  createdAt: '2026-12-31',
};

describe('NewsArticleCardComponent', () => {
  let fixture: ComponentFixture<NewsArticleCardComponent>;
  let componentRef: ComponentRef<NewsArticleCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsArticleCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NewsArticleCardComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('article', baseArticle);
    fixture.detectChanges();
  });

  it('renders the article title', () => {
    expect(fixture.nativeElement.textContent).toContain('Erster Artikel');
  });

  it('uses the thumbnail format prefixed with the CMS base url for the image', () => {
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(`${environment.cmsBaseUrl}/uploads/thumbnail_news-1.jpg`);
  });

  it('falls back to the full image url when there is no thumbnail format', () => {
    componentRef.setInput('article', {
      ...baseArticle,
      image: { ...baseArticle.image, formats: undefined },
    });
    fixture.detectChanges();

    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(`${environment.cmsBaseUrl}/uploads/news-1.jpg`);
  });

  it('uses the imageAlt as the alt text', () => {
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    expect(img.getAttribute('alt')).toBe('Titelbild');
  });

  it('shows the category badge when a category is present', () => {
    const badge = fixture.debugElement.query(By.directive(AgridataBadgeComponent));
    expect(badge.componentInstance.text()).toBe('Wetter');
  });

  it('hides the category badge when there is no category', () => {
    componentRef.setInput('article', { ...baseArticle, category: null });
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.directive(AgridataBadgeComponent))).toBeNull();
  });

  it('renders the creation date formatted as dd.MM.yyyy', () => {
    expect(fixture.nativeElement.textContent).toContain('31.12.2026');
  });

  it('renders no creation date when it is empty', () => {
    componentRef.setInput('article', { ...baseArticle, createdAt: '' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('31.12.2026');
  });
});
