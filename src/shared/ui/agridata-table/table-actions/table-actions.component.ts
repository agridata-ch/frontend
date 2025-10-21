import { Component, computed, input, output, signal } from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faEllipsisVertical, faChevronRight } from '@fortawesome/pro-regular-svg-icons';

import { ClickOutsideDirective } from '@/shared/click-outside/click-outside.directive';
import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

export interface ActionDTO {
  icon?: IconDefinition;
  label: string;
  callback: () => void;
  isMainAction?: boolean;
  isDisabled?: boolean;
}

/**
 * Encapsulates row-level actions such as buttons, context menus, and main action triggers. It
 * dynamically renders primary and secondary actions with icons and integrates with click-outside
 * handling to manage dropdowns.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-table-actions',
  imports: [
    FontAwesomeModule,
    ClickStopPropagationDirective,
    I18nPipe,
    ButtonComponent,
    ClickOutsideDirective,
  ],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css',
})
export class TableActionsComponent {
  readonly actions = input<ActionDTO[]>([]);
  readonly isRowHovered = input<boolean>(false);
  readonly rowAction = output<void>();
  readonly isOpen = signal(false);

  readonly iconRowAction = faChevronRight;
  readonly ButtonVariants = ButtonVariants;
  readonly iconEllipsis = faEllipsisVertical;

  protected readonly showContextMenu = computed(() => {
    // Show context menu only if there are actions and at least one is not a main action
    return this.actions().length > 0 && this.actions().some((action) => !action.isMainAction);
  });

  protected readonly mainAction = computed(() => {
    return this.actions().find((action) => action.isMainAction);
  });

  readonly sortedActions = computed(() => {
    return this.actions().sort((a, b) => {
      if (a.isMainAction && !b.isMainAction) return 1;
      if (!a.isMainAction && b.isMainAction) return -1;
      return a.label.localeCompare(b.label);
    });
  });

  handleActionClick(action: ActionDTO) {
    action.callback();
    this.isOpen.set(false);
  }

  handleRowAction() {
    this.rowAction.emit();
  }

  handleToggle() {
    this.isOpen.update((v) => !v);
  }

  handleClickOutside() {
    this.isOpen.set(false);
  }
}
