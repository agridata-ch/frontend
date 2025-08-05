import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { I18nDirective } from '@/shared/i18n';
import { getFormControl } from '@/shared/lib/form.helper';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ControlTypes, FormControlComponent } from '@/shared/ui/form-control';

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
