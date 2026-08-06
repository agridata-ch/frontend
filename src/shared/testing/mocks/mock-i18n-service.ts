/// <reference types="jest" />

import { signal } from '@angular/core';

import { TranslationDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { Mockify } from '@/shared/testing/mocks';

export type MockI18nService = Mockify<I18nService>;

/**
 * Replaces the internationalization service with a simplified version for testing translations.
 *
 * CommentLastReviewed: 2025-11-05
 */
export function createMockI18nService(): MockI18nService {
  const lang = signal<string>('de');

  return {
    translateSignal: jest.fn().mockImplementation((key: string) => signal(key)),
    translate: jest.fn().mockImplementation((key: string) => key),
    // Mirrors the real service: an explicit lang wins over the active one.
    useObjectTranslation: jest
      .fn()
      .mockImplementation(
        (obj?: TranslationDto, overrideLang?: string) =>
          obj?.[(overrideLang ?? lang()) as keyof TranslationDto] ?? '',
      ),
    lang,
    // Mirrors the real service: setting the active lang updates the lang signal.
    setActiveLang: jest.fn().mockImplementation((newLang: string) => lang.set(newLang)),
    selectTranslate: jest.fn(),
  } satisfies MockI18nService;
}
