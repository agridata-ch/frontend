import { Component, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages, getErrorMessage } from '@/shared/lib/form.helper';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import { AgridataMultiSelectComponent, MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { AgridataTextareaComponent } from '@/shared/ui/agridata-textarea';

import { ControlTypes } from './form-control.model';

/**
 * Implements the core logic of the form control wrapper. It dynamically renders the appropriate
 * input type based on configuration, handles validation states, retrieves error messages, and
 * displays helper text. It integrates with Angular reactive forms and provides hooks for blur
 * events and accessibility attributes.
 *
 * CommentLastReviewed: 2025-08-25
 */
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
  readonly helperText = input<string>('');

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
    const control = this.control();

    // First check if the maxLength was directly set on the control
    if (control?.maxLength) {
      return control.maxLength;
    }

    // For specific known controls, provide hardcoded values
    // This allows us to display character count without complex validator inspection
    if (this.controlType() === ControlTypes.TEXT_AREA && this.id() === 'contactFormMessage') {
      return 500;
    }

    return null;
  }
}
