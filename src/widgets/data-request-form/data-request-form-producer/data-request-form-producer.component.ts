import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { I18nDirective } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';
import { AlertComponent, AlertType } from '@/widgets/alert';

/**
 * Implements the logic for managing producer inputs, including target groups and related attributes.
 * It integrates helper components for alerts and validation feedback.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-form-producer',
  imports: [I18nDirective, FormControlComponent, AlertComponent],
  templateUrl: './data-request-form-producer.component.html',
})
export class DataRequestFormProducerComponent {
  readonly form = input<FormGroup>();
  readonly formDisabled = input<boolean>(false);

  readonly AlertType = AlertType;
  readonly ControlTypes = ControlTypes;
  readonly getFormControl = getFormControl;
}
