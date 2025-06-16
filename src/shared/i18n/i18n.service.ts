import { Injectable, inject, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { TranslationDto } from '@/entities/openapi';

const LANG_STORAGE_KEY = 'lang';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly translocoService = inject(TranslocoService);

  readonly lang = signal<string>(
    localStorage.getItem(LANG_STORAGE_KEY) ?? this.translocoService.getActiveLang(),
  );

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
    return this.translocoService.translate(key, params, this.lang());
  }

  useObjectTranslation(obj: TranslationDto | undefined | null) {
    if (!obj) return '';
    return obj[this.lang() as keyof TranslationDto] ?? '';
  }
}
