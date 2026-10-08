import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '@/environments/environment';

import { ContactFormData, NewsArticlesResponse, OnboardingFormData } from './cms.model';

/**
 * Service for retrieving CMS-managed content. Provides methods to fetch localized landing pages
 * and other CMS pages, integrating with the i18n service to ensure the correct language is requested.
 *
 * CommentLastReviewed: 2025-10-09
 */
@Service()
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.cmsBaseUrl;
  private readonly cmsContactUrl = environment.cmsContactUrl;
  private readonly cmsOnboardingFormUrl = environment.cmsOnboardingFormUrl;
  private readonly isDevMode = !environment.production;

  readonly fetchLandingPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/landing-page?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchImprintPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/imprint?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchSlaPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/sla?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchPrivacyPolicyPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/privacy-policy?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchAgbPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/agb?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchOnboardingPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/onboarding?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchCmsPages = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/pages?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchCmsPage = (slug: string, locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/pages/${slug}?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );

  readonly fetchNewsArticles = (locale: string, page: number, pageSize: number) => {
    const today = new Date().toISOString().slice(0, 10);
    return firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/news-articles?locale=${locale}` +
          `&sort=publishedAt:desc,id:desc` +
          `&pagination[page]=${page}&pagination[pageSize]=${pageSize}` +
          `&filters[$or][0][endDate][$null]=true&filters[$or][1][endDate][$gte]=${today}` +
          `${this.isDevMode ? '&status=draft' : ''}`,
      ),
    );
  };

  // A slug is unique to one locale's entry and Strapi 5 only matches it under that same locale
  // (locale=all was removed). So we search the given locales in order and return the first hit:
  // the caller passes the active locale first (resolves same-locale links in one request) and the
  // rest as fallback for links shared from another language. The caller then redirects to the
  // active-locale sibling via the returned localizations.
  readonly fetchNewsArticle = async (
    slug: string,
    locales: string[],
  ): Promise<NewsArticlesResponse> => {
    for (const locale of locales) {
      const response = await firstValueFrom(
        this.http.get<NewsArticlesResponse>(
          `${this.apiUrl}/api/news-articles?filters[slug][$eq]=${slug}&locale=${locale}` +
            `&populate=localizations${this.isDevMode ? '&status=draft' : ''}`,
        ),
      );
      if (response.data.length) return response;
    }
    return { data: [], meta: { pagination: { page: 1, pageSize: 0, pageCount: 0, total: 0 } } };
  };

  readonly submitContactForm = (data: ContactFormData) => {
    return firstValueFrom(
      this.http.post(`${this.cmsContactUrl}`, data, {
        withCredentials: true,
      }),
    );
  };

  readonly submitOnboardingForm = (data: OnboardingFormData) => {
    return firstValueFrom(
      this.http.post(`${this.cmsOnboardingFormUrl}`, data, {
        withCredentials: true,
      }),
    );
  };
}
