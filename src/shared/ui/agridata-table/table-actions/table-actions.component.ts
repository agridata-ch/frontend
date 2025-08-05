import { Component, computed, input, output } from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

export interface ActionDTO {
  icon?: IconDefinition;
  label: string;
  callback: () => void;
  isMainAction?: boolean;
}

@Component({
  selector: 'app-table-actions',
  imports: [FontAwesomeModule, ClickStopPropagationDirective, I18nPipe, ButtonComponent],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css',
})
export class TableActionsComponent {
  readonly actions = input<ActionDTO[]>([]);
  readonly isRowHovered = input<boolean>(false);
  readonly rowAction = output<void>();

  readonly iconRowAction = faChevronRight;
  readonly ButtonVariants = ButtonVariants;

  readonly sortedActions = computed(() => {
    return this.actions().sort((a, b) => {
      if (a.isMainAction && !b.isMainAction) return 1;
      if (!a.isMainAction && b.isMainAction) return -1;
      return a.label.localeCompare(b.label);
    });
  });

  handleActionClick(action: ActionDTO) {
    action.callback();
  }

  handleRowAction() {
    this.rowAction.emit();
  }
}
