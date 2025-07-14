import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages, getErrorMessage } from '@/shared/lib/form.helper';
import { AgridataMultiSelectComponent, MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { AgridataTextareaComponent } from '@/shared/ui/agridata-textarea';

import { ControlTypes } from './form-control.model';
import { AgridataSelectComponent } from '../agridata-select';

@Component({
  selector: 'app-form-control',
  imports: [
    ReactiveFormsModule,
    AgridataMultiSelectComponent,
    AgridataTextareaComponent,
    AgridataSelectComponent,
  ],
  templateUrl: './form-control.component.html',
})
export class FormControlComponent {
  readonly control = input<FormControlWithMessages>();
  readonly label = input<string>();
  readonly id = input<string>();
  readonly type = input<'text' | 'number' | 'email' | 'password'>('text');
  readonly placeholder = input<string>('');
  readonly options = input<MultiSelectOption[]>([]);
  readonly controlType = input<ControlTypes>(ControlTypes.INPUT);
  readonly onBlur = output<void>();
  readonly ControlTypes = ControlTypes;
  readonly pattern = input<string | RegExp>('');

  hasError() {
    return (this.control()?.touched && this.control()?.invalid) ?? false;
  }

  errorMessage() {
    const control = this.control();
    if (control?.touched && control?.invalid) {
      const errors = control.errors;
      if (errors) {
        const errorKey = Object.keys(errors)[0];
        return getErrorMessage(control, errorKey);
      }
    }
    return null;
  }

  getMaxCharacters() {
    return this.control()?.maxLength ?? null;
  }
}
