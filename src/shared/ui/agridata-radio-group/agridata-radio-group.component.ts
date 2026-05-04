import { Component, effect, input, model } from '@angular/core';

import { FormControlWithMessages } from '@/shared/lib/form.helper';

import { AgridataRadioGroupOption, AgridataRadioGroupValue } from './agridata-radio-group.model';

/**
 * Renders a group of radio options with a title and subtitle per option.
 *
 * CommentLastReviewed: 2026-04-30
 */
@Component({
  selector: 'app-agridata-radio-group',
  imports: [],
  templateUrl: './agridata-radio-group.component.html',
})
export class AgridataRadioGroupComponent {
  // Input properties
  readonly ariaLabel = input<string>('');
  readonly control = input<FormControlWithMessages>();
  readonly disabled = input<boolean>(false);
  readonly name = input<string>('agridata-radio-group');
  readonly options = input<readonly AgridataRadioGroupOption[]>([]);

  // Model properties
  readonly value = model<AgridataRadioGroupValue>();

  // Effects
  private readonly controlSyncEffect = effect(() => {
    const controlValue = this.control()?.value;
    if (this.isRadioGroupValue(controlValue)) {
      this.value.set(controlValue);
    }
  });

  protected selectOption(value: AgridataRadioGroupValue) {
    if (this.disabled()) {
      return;
    }

    this.value.set(value);
    this.control()?.setValue(value);
  }

  private isRadioGroupValue(value: unknown): value is AgridataRadioGroupValue {
    return typeof value === 'number' || typeof value === 'string';
  }
}
