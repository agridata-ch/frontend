import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages, getErrorMessage } from '@/shared/lib/form.helper';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import { AgridataMultiSelectComponent, MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { AgridataTextareaComponent } from '@/shared/ui/agridata-textarea';

import { ControlTypes } from './form-control.model';

@Component({
  selector: 'app-form-control',
  imports: [
    ReactiveFormsModule,
    AgridataMultiSelectComponent,
    AgridataTextareaComponent,
    AgridataSelectComponent,
    AgridataInputComponent,
  ],
  templateUrl: './form-control.component.html',
})
export class FormControlComponent {
  readonly control = input<FormControlWithMessages>();
  readonly label = input<string>();
  readonly id = input<string>();
  readonly type = input<'text' | 'number'>('text');
  readonly placeholder = input<string>('');
  readonly options = input<MultiSelectOption[]>([]);
  readonly controlType = input<ControlTypes>(ControlTypes.INPUT);
  readonly inputPrefix = input<string>('');
  readonly pattern = input<string | RegExp>('');
  readonly disabled = input<boolean>(false);

  readonly onBlur = output<void>();

  readonly ControlTypes = ControlTypes;

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
