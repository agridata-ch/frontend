/// <reference types="jest" />

import { TranslationDto } from '@/entities/openapi';

/**
 * Replaces the internationalization service with a simplified version for testing translations.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
