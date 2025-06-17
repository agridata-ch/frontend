import {
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { I18nPipe } from '@/shared/i18n';

export interface ActionDTO {
  icon?: IconDefinition;
  label: string;
  callback: () => void;
  isMainAction?: boolean;
}

@Component({
  selector: 'app-table-actions',
  imports: [FontAwesomeModule, ClickStopPropagationDirective, I18nPipe],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css',
})
export class TableActionsComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  readonly actions = input<ActionDTO[]>([]);

  readonly mainAction = computed(() => this.actions().find((action) => action.isMainAction));
  readonly isOpen = signal(false);
  readonly iconEllipsis = faEllipsisVertical;

  handleToggle() {
    this.isOpen.update((v) => !v);
  }

  handleClick(action: ActionDTO) {
    action.callback();
    this.isOpen.set(false);
  }

  @HostListener('document:click', ['$event.target'])
  onClickOutside(target: HTMLElement) {
    const host = this.elementRef.nativeElement;
    if (!host.contains(target)) {
      this.isOpen.set(false);
    }
  }
}
