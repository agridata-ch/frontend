import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

import { version as frontendVersion } from '../../package.json';

/**
 * Implements a loader for fetching translation JSON files from the assets folder. It integrates with the Transloco
 * i18n library.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly http = inject(HttpClient);

  getTranslation(lang: string) {
    return this.http.get<Translation>(
      `/assets/i18n/${lang.toLowerCase()}.json?v=${frontendVersion}`,
      /* A version query parameter is appended to the request URL to prevent browser caching issues
         when a new frontend version is deployed. This ensures updated translation files are always fetched. */
    );
  }
}
