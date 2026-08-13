import { Component, computed, effect, input, model } from '@angular/core';

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
  readonly isViewMode = input<boolean>(false);
  readonly name = input<string>('agridata-radio-group');
  readonly options = input<readonly AgridataRadioGroupOption[]>([]);

  // Model properties
  readonly value = model<AgridataRadioGroupValue>();

  // Computed Signals
  protected readonly isDisabled = computed(() => this.disabled() || this.isViewMode());

  // Effects
  // control.value is not a signal, so under zoneless CD an external setValue() (e.g. populateForm)
  // would not re-render the selection. Sync from the control's events stream so a late-arriving
  // value still checks the right radio.
  private readonly controlSyncEffect = effect((onCleanup) => {
    const control = this.control();
    const update = () => {
      const controlValue = control?.value;
      if (this.isRadioGroupValue(controlValue)) {
        this.value.set(controlValue);
      }
    };
    update();
    const subscription = control?.events.subscribe(update);
    onCleanup(() => subscription?.unsubscribe());
  });

  protected selectOption(value: AgridataRadioGroupValue) {
    if (this.isDisabled()) {
      return;
    }

    this.value.set(value);
    this.control()?.setValue(value);
  }

  private isRadioGroupValue(value: unknown): value is AgridataRadioGroupValue {
    return typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean';
  }
}
