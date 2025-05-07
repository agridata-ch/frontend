import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  Input,
  QueryList,
  TemplateRef,
  computed,
  signal,
} from '@angular/core';
import { TableActionsComponent, ActionDTO } from './table-actions/table-actions.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective<T> {
  @Input('stCell') column!: keyof T;
  constructor(public template: TemplateRef<{ $implicit: T }>) {}
}

@Component({
  selector: 'app-agridata-table',
  imports: [CommonModule, TableActionsComponent, FontAwesomeModule],
  templateUrl: './agridata-table.component.html',
  styleUrl: './agridata-table.component.css',
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AgridataTableComponent<T extends Record<string, any>> {
  private readonly _data = signal<T[]>([]);
  readonly sortColumn = signal<keyof T | ''>('');
  readonly sortDirection = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal(1);
  readonly iconSortUp = faArrowUp;
  readonly iconSortDown = faArrowDown;

  @Input() defaultSortColumn: keyof T | '' = '';
  @Input() defaultSortDirection: 'asc' | 'desc' = 'desc';
  @Input() set data(value: T[] | null) {
    this._data.set(value ?? []);
    this.currentPage.set(1);
    this.sortColumn.set(this.defaultSortColumn);
    this.sortDirection.set(this.defaultSortDirection);
  }
  @Input() pageSize = 10;
  @Input() actions: ActionDTO[] = [];
  @ContentChildren(CellTemplateDirective) cellTemplates!: QueryList<CellTemplateDirective<T>>;

  readonly columns = computed<(keyof T)[]>(() => {
    const arr = this._data();
    return arr.length ? (Object.keys(arr[0]) as (keyof T)[]) : [];
  });

  readonly sorted = computed(() => {
    const arr = [...this._data()];
    const col = this.sortColumn();
    if (!col) return arr;
    const dir = this.sortDirection();
    return arr.sort((a, b) => {
      const aV = String(a[col] ?? '');
      const bV = String(b[col] ?? '');
      return dir === 'asc' ? aV.localeCompare(bV) : bV.localeCompare(aV);
    });
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this._data().length / this.pageSize)));
  readonly showPagination = computed(() => this.totalPages() > 1);

  getTemplate(col: keyof T): TemplateRef<{ $implicit: T }> | null {
    const dir = this.cellTemplates.find((t) => t.column === col);
    return dir ? dir.template : null;
  }

  setSort(col: keyof T) {
    if (this.sortColumn() === col) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('desc');
    }
    this.currentPage.set(1);
  }

  prevPage() {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }

  nextPage() {
    this.currentPage.update((p) => Math.min(this.totalPages(), p + 1));
  }
}
