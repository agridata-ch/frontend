import { Component, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { getErrorMessage } from '@/shared/lib/form.helper';
import { AgridataMultiSelectComponent, MultiSelectOption } from '@/shared/ui/agridata-multi-select';

import { ControlTypes } from './form-control.model';

@Component({
  selector: 'app-form-control',
  imports: [ReactiveFormsModule, AgridataMultiSelectComponent],
  templateUrl: './form-control.component.html',
})
export class FormControlComponent {
  readonly control = input<FormControl>();
  readonly label = input<string>();
  readonly id = input<string>();
  readonly type = input<'text' | 'number' | 'email' | 'password'>('text');
  readonly placeholder = input<string>('');
  readonly options = input<MultiSelectOption[]>([]);
  readonly controlType = input<ControlTypes>(ControlTypes.INPUT);
  readonly onBlur = output<void>();
  readonly ControlTypes = ControlTypes;

  hasError() {
    return this.control()?.touched && this.control()?.invalid;
  }

  errorMessage() {
    const control = this.control();
    if (control?.touched && control?.invalid) {
      const errors = control.errors;
      if (errors) {
        const errorKey = Object.keys(errors)[0];
        // Use the helper to get the error message from the control
        return getErrorMessage(control, errorKey);
      }
    }
    return null;
  }
}
