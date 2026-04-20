import { ChangeDetectorRef, Inject, Optional, Pipe, PipeTransform } from '@angular/core';
import {
  TRANSLOCO_SCOPE,
  TranslocoPipe,
  TranslocoScope,
  TranslocoService,
} from '@jsverse/transloco';

export type OrArray<T> = T | T[];

/**
 * Defines a custom Angular pipe that extends the Transloco pipe. It enables inline translations
 * in templates, supporting scoped and language-specific contexts while ensuring automatic change
 * detection when language changes.
 *
 * CommentLastReviewed: 2026-02-18
 */
@Pipe({
  name: 'i18n',
  standalone: true,
  pure: false,
})
export class I18nPipe extends TranslocoPipe implements PipeTransform {
  constructor(
    service: TranslocoService,
    @Optional()
    @Inject(TRANSLOCO_SCOPE)
    providerScope: OrArray<TranslocoScope> | undefined,
    cdr: ChangeDetectorRef,
  ) {
    super(service, providerScope, undefined, cdr);
  }
}
