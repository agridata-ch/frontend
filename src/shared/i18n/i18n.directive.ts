import { Directive } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

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
