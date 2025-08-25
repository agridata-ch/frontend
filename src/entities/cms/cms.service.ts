import { HttpClient } from '@angular/common/http';
import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { environment } from '@/environments/environment';
import { I18nService } from '@/shared/i18n';

/**
 * Service for retrieving CMS-managed content. Provides methods to fetch localized landing pages
 * and other CMS pages, integrating with the i18n service to ensure the correct language is requested.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class CmsService {
  private readonly apiUrl = environment.cmsBaseUrl;
  private readonly http = inject(HttpClient);
  private readonly i18nService = inject(I18nService);

  readonly fetchLandingPage = resource({
    params: () => ({ locale: this.i18nService.lang() }),
    loader: ({ params }) => {
      return firstValueFrom(
        this.http.get(`${this.apiUrl}/api/landing-page?locale=${params.locale}`),
      );
    },
  });

  readonly fetchPage = (page: string) =>
    resource({
      loader: () => {
        const locale = this.i18nService.lang();
        return firstValueFrom(this.http.get(`${this.apiUrl}/api/pages/${page}?locale=${locale}`));
      },
    });
}
