import { Directive } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

/**
 * Provides a directive wrapper around Transloco, simplifying the application of translations to
 * DOM elements. It allows setting translation keys, parameters, and prefixes directly via attributes.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Directive({
  standalone: true,
  selector: '[i18n]',
  hostDirectives: [
    {
      directive: TranslocoDirective,
      inputs: ['transloco: i18n', 'translocoParams: i18nParams', 'translocoPrefix: i18nPrefix'],
    },
  ],
})
export class I18nDirective {}
