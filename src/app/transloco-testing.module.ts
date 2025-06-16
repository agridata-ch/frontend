import { TranslocoTestingModule, TranslocoTestingOptions } from '@jsverse/transloco';

import de from '../assets/i18n/de.json';
import fr from '../assets/i18n/fr.json';
import it from '../assets/i18n/it.json';

export function getTranslocoModule(options: TranslocoTestingOptions = {}) {
  return TranslocoTestingModule.forRoot({
    langs: { de, fr, it },
    translocoConfig: {
      availableLangs: ['de', 'fr', 'it'],
      defaultLang: 'de',
    },
    preloadLangs: true,
    ...options,
  });
}
