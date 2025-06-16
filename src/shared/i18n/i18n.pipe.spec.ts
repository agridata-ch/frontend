import { ChangeDetectorRef } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

import { I18nPipe } from './i18n.pipe';

describe('I18nPipe', () => {
  let translocoService: TranslocoService;
  let cdr: ChangeDetectorRef;

  beforeEach(() => {
    translocoService = {
      translate: jest.fn((key: string) => `translated:${key}`),
    } as unknown as TranslocoService;
    cdr = { markForCheck: jest.fn() } as unknown as ChangeDetectorRef;
  });

  it('should create an instance', () => {
    const pipe = new I18nPipe(translocoService, undefined, undefined, cdr);
    expect(pipe).toBeTruthy();
  });
});
