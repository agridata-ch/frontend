import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { Image, SEO, SeoOpenGraph } from '@/entities/cms';

import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let metaService: Meta;
  let doc: Document;
  let mockRouter: { url: string };

  const mockImage: Image = {
    alternativeText: 'Test Image Alt',
    documentId: 'doc-123',
    id: 1,
    url: 'https://example.com/image.jpg',
  };

  const mockSeo: SEO = {
    keywords: 'test, keywords, seo',
    metaDescription: 'Test description for SEO',
    metaImage: mockImage,
    metaTitle: 'Test Title',
    openGraph: {
      ogDescription: 'OG Description',
      ogImage: mockImage,
      ogTitle: 'OG Title',
      ogType: 'website',
      ogUrl: 'https://example.com/page',
    },
    structuredData: { '@type': 'WebPage', name: 'Test Page' } as unknown as JSON,
  };

  beforeEach(() => {
    mockRouter = {
      url: '/test-page',
    };

    TestBed.configureTestingModule({
      providers: [SeoService, Meta, { provide: Router, useValue: mockRouter }],
    });

    service = TestBed.inject(SeoService);
    metaService = TestBed.inject(Meta);
    doc = TestBed.inject(DOCUMENT);
  });

  afterEach(() => {
    // Clean up any added tags
    const linkTags = doc.head.querySelectorAll('link[rel="canonical"]');
    for (const tag of linkTags) {
      (tag as HTMLElement).remove();
    }

    const scriptTags = doc.head.querySelectorAll(
      'script[type="application/ld+json"][data-structured-data]',
    );
    for (const tag of scriptTags) {
      (tag as HTMLElement).remove();
    }
  });

  describe('Basic meta tags', () => {
    it('should set meta description', () => {
      service.updateSeo(mockSeo);

      const descriptionTag = metaService.getTag('name="description"');
      expect(descriptionTag?.content).toBe(mockSeo.metaDescription);
    });

    it('should set meta keywords', () => {
      service.updateSeo(mockSeo);

      const keywordsTag = metaService.getTag('name="keywords"');
      expect(keywordsTag?.content).toBe(mockSeo.keywords);
    });

    it('should remove meta description when content is null', () => {
      const seoWithoutDescription = { ...mockSeo, metaDescription: null as unknown as string };
      service.updateSeo(seoWithoutDescription);

      const descriptionTag = metaService.getTag('name="description"');
      expect(descriptionTag).toBeNull();
    });

    it('should remove meta keywords when content is null', () => {
      const seoWithoutKeywords = { ...mockSeo, keywords: null as unknown as string };
      service.updateSeo(seoWithoutKeywords);

      const keywordsTag = metaService.getTag('name="keywords"');
      expect(keywordsTag).toBeNull();
    });
  });

  describe('Canonical URL', () => {
    it('should set canonical URL based on current route', () => {
      mockRouter.url = '/test-page';
      service.updateSeo(mockSeo);

      const canonicalLink = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLink?.href).toBe('http://localhost/test-page');
    });

    it('should update existing canonical URL when route changes', () => {
      mockRouter.url = '/page-one';
      service.updateSeo(mockSeo);

      let canonicalLink = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLink?.href).toBe('http://localhost/page-one');

      mockRouter.url = '/page-two';
      service.updateSeo(mockSeo);

      canonicalLink = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLink?.href).toBe('http://localhost/page-two');
    });

    it('should not duplicate canonical link tags', () => {
      service.updateSeo(mockSeo);
      service.updateSeo(mockSeo);

      const canonicalLinks = doc.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLinks.length).toBe(1);
    });
  });

  describe('Open Graph tags', () => {
    it('should set og:title', () => {
      service.updateSeo(mockSeo);

      const ogTitleTag = metaService.getTag('property="og:title"');
      expect(ogTitleTag?.content).toBe(mockSeo.openGraph.ogTitle);
    });

    it('should set og:description', () => {
      service.updateSeo(mockSeo);

      const ogDescriptionTag = metaService.getTag('property="og:description"');
      expect(ogDescriptionTag?.content).toBe(mockSeo.openGraph.ogDescription);
    });

    it('should set og:type', () => {
      service.updateSeo(mockSeo);

      const ogTypeTag = metaService.getTag('property="og:type"');
      expect(ogTypeTag?.content).toBe(mockSeo.openGraph.ogType);
    });

    it('should set og:url', () => {
      service.updateSeo(mockSeo);

      const ogUrlTag = metaService.getTag('property="og:url"');
      expect(ogUrlTag?.content).toBe(mockSeo.openGraph.ogUrl);
    });

    it('should set og:image', () => {
      service.updateSeo(mockSeo);

      const ogImageTag = metaService.getTag('property="og:image"');
      expect(ogImageTag?.content).toBe(mockImage.url);
    });

    it('should set og:image:alt', () => {
      service.updateSeo(mockSeo);

      const ogImageAltTag = metaService.getTag('property="og:image:alt"');
      expect(ogImageAltTag?.content).toBe(mockImage.alternativeText);
    });

    it('should use fallback values when openGraph is not provided', () => {
      const seoWithoutOg = { ...mockSeo, openGraph: null as unknown as SeoOpenGraph };
      service.updateSeo(seoWithoutOg);

      const ogTitleTag = metaService.getTag('property="og:title"');
      const ogDescriptionTag = metaService.getTag('property="og:description"');
      const ogImageTag = metaService.getTag('property="og:image"');

      expect(ogTitleTag?.content).toBe(mockSeo.metaTitle);
      expect(ogDescriptionTag?.content).toBe(mockSeo.metaDescription);
      expect(ogImageTag?.content).toBe(mockSeo.metaImage.url);
    });

    it('should use fallback image when ogImage is not provided', () => {
      const ogWithoutImage = { ...mockSeo.openGraph, ogImage: null as unknown as Image };
      const seoWithOgNoImage = { ...mockSeo, openGraph: ogWithoutImage };
      service.updateSeo(seoWithOgNoImage);

      const ogImageTag = metaService.getTag('property="og:image"');
      expect(ogImageTag?.content).toBe(mockSeo.metaImage.url);
    });
  });

  describe('Twitter Card tags', () => {
    it('should set twitter:card as summary_large_image when image is available', () => {
      service.updateSeo(mockSeo);

      const twitterCardTag = metaService.getTag('name="twitter:card"');
      expect(twitterCardTag?.content).toBe('summary_large_image');
    });

    it('should set twitter:card as summary when image is not available', () => {
      const seoWithoutImage = {
        ...mockSeo,
        metaImage: null as unknown as Image,
        openGraph: { ...mockSeo.openGraph, ogImage: null as unknown as Image },
      };
      service.updateSeo(seoWithoutImage);

      const twitterCardTag = metaService.getTag('name="twitter:card"');
      expect(twitterCardTag?.content).toBe('summary');
    });

    it('should set twitter:title', () => {
      service.updateSeo(mockSeo);

      const twitterTitleTag = metaService.getTag('name="twitter:title"');
      expect(twitterTitleTag?.content).toBe(mockSeo.openGraph.ogTitle);
    });

    it('should set twitter:description', () => {
      service.updateSeo(mockSeo);

      const twitterDescriptionTag = metaService.getTag('name="twitter:description"');
      expect(twitterDescriptionTag?.content).toBe(mockSeo.openGraph.ogDescription);
    });

    it('should set twitter:image when available', () => {
      service.updateSeo(mockSeo);

      const twitterImageTag = metaService.getTag('name="twitter:image"');
      expect(twitterImageTag?.content).toBe(mockImage.url);
    });
  });

  describe('Structured Data (JSON-LD)', () => {
    it('should inject JSON-LD script when structuredData is an object', () => {
      service.updateSeo(mockSeo);

      const jsonLdScript = doc.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScript).toBeTruthy();

      const parsedData = JSON.parse(jsonLdScript!.text);
      expect(parsedData).toEqual({ '@type': 'WebPage', name: 'Test Page' });
    });

    it('should inject JSON-LD script when structuredData is a string', () => {
      const jsonString = '{"@type":"Organization","name":"Test Org"}';
      const seoWithJsonString = { ...mockSeo, structuredData: jsonString as unknown as JSON };
      service.updateSeo(seoWithJsonString);

      const jsonLdScript = doc.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScript).toBeTruthy();

      const parsedData = JSON.parse(jsonLdScript!.text);
      expect(parsedData).toEqual({ '@type': 'Organization', name: 'Test Org' });
    });

    it('should remove JSON-LD script when structuredData is invalid', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const seoWithInvalidJson = { ...mockSeo, structuredData: 'invalid json' as unknown as JSON };
      service.updateSeo(seoWithInvalidJson);

      const jsonLdScript = doc.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScript).toBeNull();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        '[SeoService] Failed to parse structuredData string.',
      );

      consoleWarnSpy.mockRestore();
    });

    it('should replace existing JSON-LD script when updating', () => {
      service.updateSeo(mockSeo);

      const updatedSeo = {
        ...mockSeo,
        structuredData: { '@type': 'Article', headline: 'Updated' } as unknown as JSON,
      };
      service.updateSeo(updatedSeo);

      const jsonLdScripts = doc.head.querySelectorAll<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScripts.length).toBe(1);

      const parsedData = JSON.parse(jsonLdScripts[0].text);
      expect(parsedData).toEqual({ '@type': 'Article', headline: 'Updated' });
    });

    it('should remove JSON-LD script when structuredData is null', () => {
      service.updateSeo(mockSeo);

      const seoWithoutStructuredData = { ...mockSeo, structuredData: null as unknown as JSON };
      service.updateSeo(seoWithoutStructuredData);

      const jsonLdScript = doc.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScript).toBeNull();
    });
  });

  describe('resetSeo', () => {
    it('should reset to default meta tags when SEO object is null', () => {
      service.updateSeo(mockSeo);

      service.updateSeo(null as unknown as SEO);

      const descriptionTag = metaService.getTag('name="description"');
      const keywordsTag = metaService.getTag('name="keywords"');
      const ogTitleTag = metaService.getTag('property="og:title"');
      const twitterCardTag = metaService.getTag('name="twitter:card"');

      expect(descriptionTag?.content).toBe(
        "Der Datenraum für den Schweizer Agrar- und Ernährungssektor L'espace de données pour le secteur agricole et alimentaire suisse Lo spazio di dati della filiera agroalimentare svizzera",
      );
      expect(keywordsTag?.content).toBe(
        'agridata, agridata.ch, Landwirtschaft, Agrar, Ernährung, Datenraum, Schweiz, Agriculture, agroalimentaire, alimentation, salle des données, Suisse, Agricoltura, agroalimentare, alimentazione, data room, Svizzera',
      );
      expect(ogTitleTag?.content).toBe('agridata.ch');
      expect(twitterCardTag?.content).toBe('summary_large_image');
    });

    it('should reset canonical link to current route when SEO object is null', () => {
      mockRouter.url = '/some-page';
      service.updateSeo(mockSeo);

      service.updateSeo(null as unknown as SEO);

      const canonicalLink = doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      expect(canonicalLink?.href).toBe('http://localhost/some-page');
    });

    it('should remove og:image:alt when resetting', () => {
      service.updateSeo(mockSeo);

      service.updateSeo(null as unknown as SEO);

      const ogImageAltTag = metaService.getTag('property="og:image:alt"');
      expect(ogImageAltTag).toBeNull();
    });

    it('should remove JSON-LD scripts when SEO object is null', () => {
      service.updateSeo(mockSeo);

      service.updateSeo(null as unknown as SEO);

      const jsonLdScript = doc.head.querySelector<HTMLScriptElement>(
        'script[type="application/ld+json"][data-structured-data="page"]',
      );
      expect(jsonLdScript).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle SEO object with empty strings', () => {
      const emptySeo: SEO = {
        keywords: '',
        metaDescription: '',
        metaImage: null as unknown as Image,
        metaTitle: '',
        openGraph: null as unknown as SeoOpenGraph,
        structuredData: null as unknown as JSON,
      };

      service.updateSeo(emptySeo);

      const descriptionTag = metaService.getTag('name="description"');
      const keywordsTag = metaService.getTag('name="keywords"');

      expect(descriptionTag).toBeNull();
      expect(keywordsTag).toBeNull();
    });

    it('should handle image without alternative text', () => {
      const imageWithoutAlt: Image = {
        alternativeText: '',
        documentId: 'doc-456',
        id: 2,
        url: 'https://example.com/image2.jpg',
      };

      const seoWithImageNoAlt = {
        ...mockSeo,
        openGraph: { ...mockSeo.openGraph, ogImage: imageWithoutAlt },
      };
      service.updateSeo(seoWithImageNoAlt);

      const ogImageTag = metaService.getTag('property="og:image"');
      const ogImageAltTag = metaService.getTag('property="og:image:alt"');

      expect(ogImageTag?.content).toBe(imageWithoutAlt.url);
      expect(ogImageAltTag).toBeNull();
    });

    it('should handle missing og:type with default value', () => {
      const ogWithoutType = { ...mockSeo.openGraph, ogType: null as unknown as string };
      const seoWithOgNoType = { ...mockSeo, openGraph: ogWithoutType };
      service.updateSeo(seoWithOgNoType);

      const ogTypeTag = metaService.getTag('property="og:type"');
      expect(ogTypeTag?.content).toBe('website');
    });
  });
});
