import { DOCUMENT } from '@angular/common';
import { inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { Meta } from '@angular/platform-browser';
import { Router } from '@angular/router';

import { SEO, SeoOpenGraph, Image } from '@/entities/cms';
import { environment } from '@/environments/environment';

interface DefaultMetaTags {
  canonicalURL: string;
  description: string;
  keywords: string;
  'og:description': string;
  'og:image': string;
  'og:title': string;
  'og:type': string;
  'og:url': string;
  'twitter:card': string;
  'twitter:description': string;
  'twitter:image': string;
  'twitter:title': string;
}

/**
 *
 * Service to manage SEO meta tags, Open Graph, Twitter cards, canonical URLs, and structured data (JSON-LD)
 *
 * CommentLastReviewed: 2025-11-20
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly doc = inject(DOCUMENT);
  private readonly meta = inject(Meta);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
  private readonly router = inject(Router);

  // Default meta tags to reset to which are the same as in index.html so we have this minimal duplication which is fine
  // just remember to update both when needed
  private readonly defaultTags: DefaultMetaTags = {
    canonicalURL: 'https://agridata.ch/',
    description:
      "Der Datenraum für den Schweizer Agrar- und Ernährungssektor L'espace de données pour le secteur agricole et alimentaire suisse Lo spazio di dati della filiera agroalimentare svizzera",
    keywords:
      'agridata, agridata.ch, Landwirtschaft, Agrar, Ernährung, Datenraum, Schweiz, Agriculture, agroalimentaire, alimentation, salle des données, Suisse, Agricoltura, agroalimentare, alimentazione, data room, Svizzera',
    'og:description':
      "Der Datenraum für den Schweizer Agrar- und Ernährungssektor L'espace de données pour le secteur agricole et alimentaire suisse Lo spazio di dati della filiera agroalimentare svizzera",
    'og:image': 'assets/favicon/favicon.svg',
    'og:title': 'agridata.ch',
    'og:type': 'website',
    'og:url': 'https://agridata.ch/',
    'twitter:card': 'summary_large_image',
    'twitter:description':
      "Der Datenraum für den Schweizer Agrar- und Ernährungssektor L'espace de données pour le secteur agricole et alimentaire suisse Lo spazio di dati della filiera agroalimentare svizzera",
    'twitter:image': 'assets/favicon/favicon.svg',
    'twitter:title': 'agridata.ch',
  };

  /**
   * Main entry: call this in your page component when you have the SEO object from Strapi.
   */
  updateSeo(seo: SEO): void {
    if (!seo) {
      this.resetSeo();
      return;
    }

    const { metaTitle, metaDescription, metaImage, openGraph, keywords, structuredData } = seo;

    const fullTitle = this.buildTitle(metaTitle);
    const canonicalURL = this.getCanonicalUrl();

    // ---------- Basic meta ----------
    this.setMetaTag('description', metaDescription);
    this.setMetaTag('keywords', keywords);

    // ---------- Canonical ----------
    this.setCanonicalUrl(canonicalURL);

    // ---------- Open Graph ----------
    const og: SeoOpenGraph = openGraph || {
      ogTitle: metaTitle,
      ogDescription: metaDescription,
      ogImage: metaImage,
      ogUrl: canonicalURL,
      ogType: 'website',
    };

    this.setOgTag('og:title', og.ogTitle || fullTitle);
    this.setOgTag('og:description', og.ogDescription || metaDescription);
    this.setOgTag('og:type', og.ogType || 'website');
    this.setOgTag('og:url', og.ogUrl || canonicalURL);

    const ogImage: Image | undefined = og.ogImage || metaImage;
    if (ogImage?.url) {
      this.setOgTag('og:image', ogImage.url);
      if (ogImage.alternativeText) {
        this.setOgTag('og:image:alt', ogImage.alternativeText);
      }
    }

    // ---------- Twitter ----------
    this.setMetaTag('twitter:card', ogImage?.url ? 'summary_large_image' : 'summary');
    this.setMetaTag('twitter:title', og.ogTitle || fullTitle);
    this.setMetaTag('twitter:description', og.ogDescription || metaDescription);

    if (ogImage?.url) {
      this.setMetaTag('twitter:image', ogImage.url);
    }

    // ---------- Structured data (JSON-LD from Strapi) ----------
    const jsonLdId = 'page';
    const jsonLdData = this.normalizeJsonLd(structuredData);
    this.setJsonLdScript(jsonLdId, jsonLdData);
  }

  // =======================================================================
  // Helpers
  // =======================================================================

  private setMetaTag(
    nameOrProperty: string,
    content?: string | null,
    attribute: 'name' | 'property' = 'name',
  ): void {
    const selector = `${attribute}="${nameOrProperty}"`;

    if (!content) {
      this.meta.removeTag(selector);
      return;
    }

    const definition: { [key: string]: string } = {
      [attribute]: nameOrProperty,
      content,
    };

    this.meta.updateTag(definition, selector);
  }

  private setOgTag(property: string, content?: string | null): void {
    this.setMetaTag(property, content, 'property');
  }

  /** Ensure a single <link rel="canonical"> with the Strapi URL */
  private setCanonicalUrl(url?: string | null): void {
    if (!url) {
      return;
    }

    let linkEl = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!linkEl) {
      linkEl = this.renderer.createElement('link');
      this.renderer.setAttribute(linkEl, 'rel', 'canonical');
      this.renderer.appendChild(this.doc.head, linkEl);
    }
    this.renderer.setAttribute(linkEl, 'href', url);
  }

  // =======================================================================
  // JSON-LD helpers
  // =======================================================================

  /**
   * Accepts JSON from Strapi:
   * - if it's already an object, returns it
   * - if it's a string, tries to JSON.parse it
   * - otherwise returns null (removes script)
   */
  private normalizeJsonLd(input: unknown): unknown | null {
    if (!input) return null;

    if (typeof input === 'object') {
      return input;
    }

    if (typeof input === 'string') {
      try {
        return JSON.parse(input);
      } catch {
        console.warn('[SeoService] Failed to parse structuredData string.');
        return null;
      }
    }

    return null;
  }

  /**
   * Injects (or replaces) a JSON-LD script in <head>.
   */
  private setJsonLdScript(id: string, data: unknown | null): void {
    const selector = `script[type="application/ld+json"][data-structured-data="${id}"]`;
    const existing = this.doc.head.querySelector<HTMLScriptElement>(selector);

    // Remove previous one for this id
    if (existing) {
      this.renderer.removeChild(this.doc.head, existing);
    }

    if (!data) {
      return;
    }

    const script = this.renderer.createElement('script') as HTMLScriptElement;
    this.renderer.setAttribute(script, 'type', 'application/ld+json');
    this.renderer.setAttribute(script, 'data-structured-data', id);

    // Important: stringify compactly; search engines don't care about formatting.
    script.text = JSON.stringify(data);

    this.renderer.appendChild(this.doc.head, script);
  }

  private buildTitle(title?: string): string {
    if (!title) return '';
    return title;
  }

  private getCanonicalUrl(): string {
    return `${environment.appBaseUrl}${this.router.url}`;
  }

  private resetSeo(): void {
    // Reset to default meta tags instead of removing them
    this.setMetaTag('description', this.defaultTags.description);
    this.setMetaTag('keywords', this.defaultTags.keywords);
    this.setMetaTag('twitter:card', this.defaultTags['twitter:card']);
    this.setMetaTag('twitter:title', this.defaultTags['twitter:title']);
    this.setMetaTag('twitter:description', this.defaultTags['twitter:description']);
    this.setMetaTag('twitter:image', this.defaultTags['twitter:image']);

    this.setOgTag('og:title', this.defaultTags['og:title']);
    this.setOgTag('og:description', this.defaultTags['og:description']);
    this.setOgTag('og:type', this.defaultTags['og:type']);
    this.setOgTag('og:url', this.defaultTags['og:url']);
    this.setOgTag('og:image', this.defaultTags['og:image']);

    // Remove og:image:alt as it's not in defaults
    this.setOgTag('og:image:alt', null);

    // Reset canonical URL
    this.setCanonicalUrl(this.getCanonicalUrl());

    // Remove all JSON-LD scripts managed by this service
    const jsonLdScripts = this.doc.head.querySelectorAll<HTMLScriptElement>(
      'script[type="application/ld+json"][data-structured-data]',
    );

    for (const script of jsonLdScripts) {
      this.renderer.removeChild(this.doc.head, script);
    }
  }
}
