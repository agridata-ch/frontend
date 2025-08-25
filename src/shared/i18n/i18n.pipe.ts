import { ChangeDetectorRef, Inject, Optional, Pipe } from '@angular/core';
import {
  OrArray,
  TRANSLOCO_LANG,
  TRANSLOCO_SCOPE,
  TranslocoPipe,
  TranslocoScope,
  TranslocoService,
} from '@jsverse/transloco';

/**
 * Defines a custom Angular pipe that extends the Transloco pipe. It enables inline translations
 * in templates, supporting scoped and language-specific contexts while ensuring automatic change
 * detection when language changes.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
