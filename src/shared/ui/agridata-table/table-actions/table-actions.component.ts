import {
  Component,
  ElementRef,
  HostListener,
  Input,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FontAwesomeModule, IconDefinition } from '@fortawesome/angular-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';

export interface ActionDTO {
  icon?: IconDefinition;
  label: string;
  callback: () => void;
  isMainAction?: boolean;
}

@Component({
  selector: 'app-table-actions',
  imports: [FontAwesomeModule, ClickStopPropagationDirective],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css',
})
export class TableActionsComponent {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _actions = signal<ActionDTO[]>([]);

  @Input()
  set actions(v: ActionDTO[]) {
    this._actions.set(v || []);
  }
  get actions() {
    return this._actions();
  }

  readonly mainAction = computed(() => this._actions().find((action) => action.isMainAction));
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
