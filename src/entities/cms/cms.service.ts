import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '@/environments/environment';

import { ContactFormData } from './cms.model';

/**
 * Service for retrieving CMS-managed content. Provides methods to fetch localized landing pages
 * and other CMS pages, integrating with the i18n service to ensure the correct language is requested.
 *
 * CommentLastReviewed: 2025-10-09
 */
@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.cmsBaseUrl;
  private readonly cmsContactUrl = environment.cmsContactUrl;
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

  readonly fetchPrivacyPolicyPage = (locale: string) =>
    firstValueFrom(
      this.http.get(
        `${this.apiUrl}/api/privacy-policy?locale=${locale}${this.isDevMode ? '&status=draft' : ''}`,
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

  readonly submitContactForm = (data: ContactFormData) => {
    return firstValueFrom(
      this.http.post(`${this.cmsContactUrl}`, data, {
        withCredentials: true,
      }),
    );
  };
}
