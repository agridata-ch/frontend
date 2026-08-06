import { Component, input } from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestDto } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { DataRequestContentComponent } from '@/widgets/data-request-content';

import { availableLangs } from '../../../transloco.config';

/**
 * Implements the preview logic. It renders the data request content once per supported language so
 * users can validate all details across languages.
 *
 * CommentLastReviewed: 2026-08-04
 */
@Component({
  selector: 'app-data-request-preview',
  imports: [DataRequestContentComponent, FontAwesomeModule, I18nDirective],
  templateUrl: './data-request-preview.component.html',
})
export class DataRequestPreviewComponent {
  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();

  // Constants
  protected readonly availableLangs = availableLangs;
  protected readonly faSpinnerThird = faSpinnerThird;
}
