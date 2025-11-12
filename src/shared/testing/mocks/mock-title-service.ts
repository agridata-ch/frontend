import { signal, WritableSignal } from '@angular/core';

import { TitleService } from '@/app/title.service';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockTitleServiceSignals = {
  roTranslatedTitle: WritableSignal<string | undefined>;
  ro18nTitle: WritableSignal<string | undefined>;
  roRoute: WritableSignal<string | undefined>;
};

export type MockTitleService = MockifyWithWritableSignals<TitleService, MockTitleServiceSignals>;

export function createMockTitleService(): MockTitleService {
  const roTranslatedTitle = signal<string | undefined>(undefined);
  const ro18nTitle = signal<string | undefined>(undefined);
  const roRoute = signal<string | undefined>(undefined);

  return {
    setPageTitleByRoute: jest.fn(),
    setI18nTitle: jest.fn(),
    setTranslatedTitle: jest.fn(),
    roTranslatedTitle,
    ro18nTitle,
    roRoute,
    // used to override read only signals in tests
    __testSignals: { roTranslatedTitle, ro18nTitle, roRoute },
  } satisfies MockTitleService;
}
