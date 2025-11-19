import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';

import { LANG_STORAGE_KEY } from '@/app/i18n.config';
import { TranslationDto } from '@/entities/openapi';

/**
 * Implements a service for managing application language state. It persists the active language in
 * local storage, synchronizes with Transloco’s active language, and exposes helper methods for
 * translation and reactive signals. It also provides a utility for extracting localized text from
 * translation objects.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translocoService = inject(TranslocoService);

  readonly lang = signal<string>(this.translocoService.getActiveLang());

  constructor() {
    this.translocoService.langChanges$.subscribe((lang) => {
      this.lang.set(lang);
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    });
  }

  setActiveLang(lang: string) {
    this.translocoService.setActiveLang(lang);
  }

  translate(key: string, params?: Record<string, unknown>) {
    return this.translocoService.translate(key, params);
  }

  translateSignal(key: string, params?: Record<string, unknown>) {
    return toSignal(this.translocoService.selectTranslate(key, params));
  }
  selectTranslate(key: string, params?: Record<string, unknown>) {
    return this.translocoService.selectTranslate(key, params);
  }

  useObjectTranslation(obj: TranslationDto | undefined | null) {
    if (!obj) return '';
    return obj[this.lang() as keyof TranslationDto] ?? '';
  }
}
