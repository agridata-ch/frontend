import { isDevMode } from '@angular/core';

import { availableLangs } from '../../transloco.config';

function getBrowserLang(availableLangs: string[], fallback: string): string {
  const browserLang = navigator.language.split('-')[0];
  return availableLangs.includes(browserLang) ? browserLang : fallback;
}

const LANG_STORAGE_KEY = 'lang';
const fallbackLang = 'de';
const savedLang = localStorage.getItem(LANG_STORAGE_KEY);
export const defaultLang = savedLang ?? getBrowserLang(availableLangs, fallbackLang);

export const i18nConfig = {
  availableLangs,
  defaultLang,
  fallbackLang,
  // Remove this option if your application doesn't support changing language in runtime.
  reRenderOnLangChange: true,
  prodMode: !isDevMode(),
  keysManager: {
    input: ['src/**/*.ts', 'src/**/*.html'],
  },
};
