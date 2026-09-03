import { Component, effect, input, output, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

/**
 * Implements the multi-select-option logic. It represents an individual option within the multi-select component.
 *
 * CommentLastReviewed: 2026-08-25
 */
@Component({
  selector: 'app-agridata-multi-select-option',
  imports: [ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './agridata-multi-select-option.component.html',
})
export class AgridataMultiSelectOptionComponent {
  // Input properties
  readonly control = input.required<FormControlWithMessages>();
  readonly option = input.required<MultiSelectOption>();
  readonly disabled = input<boolean>(false);

  // Output properties
  readonly selectOption = output<{ value: string | number; event: Event }>();

  // Signals
  // control.value is a plain property, so [checked] would not refresh when the value changes
  // without a click on this option (e.g. select-all). Bump a version signal on control.events so
  // the template re-evaluates isSelected under zoneless change detection.
  private readonly controlVersion = signal(0);

  // Effects
  private readonly watchControlEffect = effect((onCleanup) => {
    const subscription = this.control().events.subscribe(() =>
      this.controlVersion.update((version) => version + 1),
    );
    onCleanup(() => subscription.unsubscribe());
  });

  isSelected(id: string | number) {
    this.controlVersion();
    return this.control()?.value.includes(id);
  }
}
