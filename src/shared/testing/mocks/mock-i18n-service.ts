/// <reference types="jest" />

import { signal } from '@angular/core';

import { TranslationDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { Mockify } from '@/shared/testing/mocks/test-model';

export type MockI18nService = Mockify<I18nService>;

/**
 * Replaces the internationalization service with a simplified version for testing translations.
 *
 * CommentLastReviewed: 2025-11-05
 */
export function createMockI18nService(): MockI18nService {
  return {
    translateSignal: jest.fn().mockImplementation((key: string) => signal(key)),
    translate: jest.fn().mockImplementation((key: string) => key),
    useObjectTranslation: jest.fn().mockImplementation((obj?: TranslationDto) => obj?.de ?? ''),
    lang: signal<string>('de'),
    setActiveLang: jest.fn(),
    selectTranslate: jest.fn(),
  } satisfies MockI18nService;
}
