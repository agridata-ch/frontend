import { Component, computed, ElementRef, HostListener, Input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';

export interface ActionDTO {
  label: string;
  callback: () => void;
  isMainAction?: boolean;
}

@Component({
  selector: 'app-table-actions',
  imports: [FontAwesomeModule],
  templateUrl: './table-actions.component.html',
  styleUrl: './table-actions.component.css',
})
export class TableActionsComponent {
  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @Input()
  set actions(v: ActionDTO[]) {
    this._actions.set(v || []);
  }
  get actions(): ActionDTO[] {
    return this._actions();
  }

  private readonly _actions = signal<ActionDTO[]>([]);
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
