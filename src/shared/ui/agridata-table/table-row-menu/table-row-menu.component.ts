import { Component, computed, input, signal, WritableSignal } from '@angular/core';
import { faEllipsisVertical } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

export interface ActionDTO {
  icon?: IconDefinition;
  label: string;
  callback: () => Promise<void>;
  isDisabled?: boolean;
}

interface ActionWithLoadingSignal extends ActionDTO {
  loading: WritableSignal<boolean>;
}
/**
 * Encapsulates row-level actions such as buttons, context menus, and main action triggers. It
 * dynamically renders primary and secondary actions with icons and integrates with click-outside
 * handling to manage dropdowns.
 *
 * CommentLastReviewed: 2025-12-02
 */
@Component({
  selector: 'app-table-row-menu',
  imports: [
    ClickOutsideDirective,
    ClickStopPropagationDirective,
    ButtonComponent,
    FontAwesomeModule,
    I18nPipe,
  ],
  templateUrl: './table-row-menu.component.html',
})
export class TableRowMenuComponent {
  // Inputs
  public readonly actions = input<ActionDTO[]>([]);

  // Signals
  protected readonly isOpen = signal(false);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly iconEllipsis = faEllipsisVertical;
  protected faSpinnerThird = faSpinnerThird;

  // Computed
  protected readonly actionWithLoadingSignal = computed(() =>
    this.actions().map(
      (action) => ({ ...action, loading: signal(false) }) as ActionWithLoadingSignal,
    ),
  );

  protected async handleActionClick(action: ActionWithLoadingSignal) {
    action.loading.set(true);

    await action.callback();

    action.loading.set(false);
    this.isOpen.set(false);
  }

  protected handleClickOutside() {
    this.isOpen.set(false);
  }

  protected handleToggle() {
    this.isOpen.update((v) => !v);
  }
}
