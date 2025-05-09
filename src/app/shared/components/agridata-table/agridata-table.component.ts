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

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective<T> {
  /** Field name this template applies to */
  @Input('stCell') column!: keyof T;
  constructor(public template: TemplateRef<{ $implicit: T }>) {}
}

@Component({
  selector: 'app-agridata-table',
  imports: [CommonModule],
  templateUrl: './agridata-table.component.html',
  styleUrl: './agridata-table.component.css',
})
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class AgridataTableComponent<T extends Record<string, any>> {
  private readonly _data = signal<T[]>([]);
  readonly sortColumn = signal<keyof T | ''>('');
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly currentPage = signal(1);

  @Input() set data(value: T[] | null) {
    this._data.set(value ?? []);
    this.currentPage.set(1); // reset to first page on new data
    this.sortColumn.set(''); // optional: clear sort if you want
  }

  @Input() pageSize = 10;
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

  getTemplate(col: keyof T): TemplateRef<{ $implicit: T }> | null {
    const dir = this.cellTemplates.find((t) => t.column === col);
    return dir ? dir.template : null;
  }

  setSort(col: keyof T) {
    if (this.sortColumn() === col) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
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
