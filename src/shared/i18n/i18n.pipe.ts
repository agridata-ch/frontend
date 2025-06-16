import { ChangeDetectorRef, Inject, Optional, Pipe } from '@angular/core';
import {
  OrArray,
  TRANSLOCO_LANG,
  TRANSLOCO_SCOPE,
  TranslocoPipe,
  TranslocoScope,
  TranslocoService,
} from '@jsverse/transloco';

@Pipe({
  name: 'i18n',
  standalone: true,
  pure: false,
})
export class I18nPipe extends TranslocoPipe {
  constructor(
    service: TranslocoService,
    @Optional()
    @Inject(TRANSLOCO_SCOPE)
    providerScope: OrArray<TranslocoScope> | undefined,
    @Optional()
    @Inject(TRANSLOCO_LANG)
    providerLang: string | undefined,
    cdr: ChangeDetectorRef,
  ) {
    super(service, providerScope, providerLang, cdr);
  }
}
