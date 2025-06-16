import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

export const availableLangs = ['de', 'fr', 'it'];

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'src/assets/i18n/',
  langs: availableLangs,
  keysManager: {},
};

export default config;
