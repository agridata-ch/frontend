import { booleanAttribute, Component, effect, input, output, signal } from '@angular/core';
import { AbstractControl, ReactiveFormsModule } from '@angular/forms';

import { FormControlWithMessages, getErrorMessage } from '@/shared/lib/form.helper';
import { AgridataDigitInputComponent } from '@/shared/ui/agridata-digit-input';
import { AgridataInputComponent } from '@/shared/ui/agridata-input';
import {
  AgridataMultiSelectComponent,
  MultiSelectCategory,
  MultiSelectOption,
} from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { AgridataTextareaComponent } from '@/shared/ui/agridata-textarea';
import { AgridataWysiwygComponent } from '@/shared/ui/agridata-wysiwyg';

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
  host: { '[class.has-error]': 'hasError()' },
  imports: [
    ReactiveFormsModule,
    AgridataMultiSelectComponent,
    AgridataTextareaComponent,
    AgridataSelectComponent,
    AgridataInputComponent,
    AgridataDigitInputComponent,
    AgridataWysiwygComponent,
  ],
  templateUrl: './form-control.component.html',
})
export class FormControlComponent {
  readonly categories = input<MultiSelectCategory[]>([]);
  readonly control = input<FormControlWithMessages>();
  readonly controlType = input<ControlTypes>(ControlTypes.INPUT);
  readonly disabled = input<boolean>(false);
  readonly helperText = input<string>('');
  readonly id = input<string>();
  readonly inputPrefix = input<string>('');
  readonly label = input<string>();
  readonly options = input<MultiSelectOption[]>([]);
  readonly pattern = input<string | RegExp>('');
  readonly placeholder = input<string>('');
  readonly length = input<number>(1);
  readonly singleCategorySelection = input<boolean>(false);
  readonly type = input<'text' | 'number'>('text');
  readonly isViewMode = input<boolean>(false);
  readonly isWysiwyg = input(false, { transform: booleanAttribute });

  readonly handleBlur = output<void>();

  readonly ControlTypes = ControlTypes;

  // Signals
  protected readonly hasError = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  // Effects
  // The control's touched/status state is not a signal, so in zoneless change detection a
  // markAllAsTouched() or blur would not re-render the error state. Feed the state signals from the
  // control's events stream so hasError()/errorMessage() stay reactive.
  private readonly syncErrorStateEffect = effect((onCleanup) => {
    const control = this.control();
    const update = () => {
      const invalid = (control?.touched && control?.invalid) ?? false;
      this.hasError.set(invalid);
      this.errorMessage.set(
        invalid && control?.errors
          ? getErrorMessage(control, Object.keys(control.errors)[0])
          : null,
      );
    };
    update();
    const subscription = control?.events.subscribe(update);
    onCleanup(() => subscription?.unsubscribe());
  });

  getMaxCharacters() {
    const control = this.control();

    // First check if the maxLength was directly set on the control
    if (control?.maxLength) {
      return control.maxLength;
    }

    if (control?.validator) {
      const result = control.validator({ value: 'x'.repeat(100_000) } as AbstractControl);
      const requiredLength = result?.['maxlength']?.requiredLength;
      if (requiredLength != null) {
        return requiredLength as number;
      }
    }

    // For specific known controls, provide hardcoded values
    // This allows us to display character count without complex validator inspection
    if (this.controlType() === ControlTypes.TEXT_AREA && this.id() === 'contactFormMessage') {
      return 500;
    }

    return null;
  }
}
