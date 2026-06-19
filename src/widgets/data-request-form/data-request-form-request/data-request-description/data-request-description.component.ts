import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { I18nDirective } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { FormControlComponent } from '@/shared/ui/form-control';
import { ControlTypes } from '@/shared/ui/form-control/form-control.model';

/**
 * Displays the multilingual title, description and purpose fields of a data request form.
 *
 * CommentLastReviewed: 2026-06-18
 */
@Component({
  selector: 'app-data-request-description',
  imports: [FormControlComponent, I18nDirective, ReactiveFormsModule],
  templateUrl: './data-request-description.component.html',
})
export class DataRequestDescriptionComponent {
  // Constants
  protected readonly ControlTypes = ControlTypes;
  protected readonly getFormControl = getFormControl;

  // Input properties
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);
}
