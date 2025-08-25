import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Translation, TranslocoLoader } from '@jsverse/transloco';

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
    return this.http.get<Translation>(`/assets/i18n/${lang.toLowerCase()}.json`);
  }
}
