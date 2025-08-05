/// <reference types="jest" />

import { TranslationDto } from '@/entities/openapi';

export class MockI18nService {
  translateSignal(key: string) {
    return () => `${key}`;
  }
  translate(key: string) {
    return `${key}`;
  }
  useObjectTranslation(obj: TranslationDto) {
    return obj?.de ?? '';
  }
  lang() {
    return 'de';
  }

  setActiveLang() {
    return jest.fn();
  }
}
