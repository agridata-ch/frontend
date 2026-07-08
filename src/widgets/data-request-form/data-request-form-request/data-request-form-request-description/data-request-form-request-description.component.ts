import { Component, computed, inject, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { environment } from '@/environments/environment';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';
import { LinkedTextParts, parseLinkedText } from '@/shared/utils';

import { PURPOSE_PDF_FILENAMES } from './data-request-form-request-description.model';

/**
 * Displays the multilingual title, description and purpose fields of a data request form.
 *
 * CommentLastReviewed: 2026-06-22
 */
@Component({
  selector: 'app-data-request-form-request-description',
  imports: [FormControlComponent, I18nDirective, ReactiveFormsModule],
  templateUrl: './data-request-form-request-description.component.html',
})
export class DataRequestFormRequestDescriptionComponent {
  // Injects
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly ControlTypes = ControlTypes;
  protected readonly getFormControl = getFormControl;

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  // Computed signals
  protected readonly pdfUrl = computed(
    () =>
      `${environment.cmsMediaUrl}${PURPOSE_PDF_FILENAMES[this.i18nService.lang()] ?? PURPOSE_PDF_FILENAMES['de']}`,
  );
  protected readonly purposeSublabelParts = computed<LinkedTextParts>(() =>
    parseLinkedText(this.i18nService.translate('data-request.form.request.purpose.sublabel')),
  );
}
