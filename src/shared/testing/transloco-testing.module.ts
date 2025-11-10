import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import { LANG_STORAGE_KEY } from '@/app/i18n.config';

export function createTranslocoTestingModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { de: {} },
    translocoConfig: {
      availableLangs: ['de', 'fr'],
      defaultLang: localStorage.getItem(LANG_STORAGE_KEY) ?? 'de',
    },
    preloadLangs: true,
    ...options,
  });
}
