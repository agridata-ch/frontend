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
import { compareAsc, compareDesc, format, isValid, parseISO } from 'date-fns';

export interface AgridataTableCell {
  header: string;
  value: string;
}

export interface AgridataTableData {
  data: AgridataTableCell[];
  highlighted?: boolean;
  actions: ActionDTO[];
}

@Directive({ selector: '[stCell]' })
export class CellTemplateDirective {
  @Input('stCell') header!: string;
  constructor(public template: TemplateRef<{ $implicit: AgridataTableData }>) {}
}

@Component({
  selector: 'app-agridata-table',
  imports: [CommonModule, TableActionsComponent, FontAwesomeModule],
  templateUrl: './agridata-table.component.html',
  styleUrl: './agridata-table.component.css',
})
export class AgridataTableComponent {
  private readonly _data = signal<AgridataTableData[]>([]);
  readonly sortColumnIndex = signal<number | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal(1);
  readonly iconSortUp = faArrowUp;
  readonly iconSortDown = faArrowDown;

  @Input() defaultSortColumn: string = '';
  @Input() defaultSortDirection: 'asc' | 'desc' = 'desc';
  @Input() set data(value: AgridataTableData[] | null) {
    const rows = value ?? [];
    this._data.set(rows);
    this.currentPage.set(1);
    const headers = rows.length ? rows[0].data.map((c) => c.header) : [];
    const idx = this.defaultSortColumn ? headers.indexOf(this.defaultSortColumn) : -1;
    this.sortColumnIndex.set(idx >= 0 ? idx : null);
    this.sortDirection.set(this.defaultSortDirection);
  }
  @Input() pageSize = 10;
  @ContentChildren(CellTemplateDirective) cellTemplates!: QueryList<CellTemplateDirective>;

  readonly headers = computed<string[]>(() => {
    const rows = this._data();
    return rows.length ? rows[0].data.map((cell) => cell.header) : [];
  });

  readonly sorted = computed(() => {
    const rows = [...this._data()];
    const idx = this.sortColumnIndex();
    if (idx === null) return rows;
    const dir = this.sortDirection();

    return rows.sort((a, b) => {
      const aVal = a.data[idx]?.value;
      const bVal = b.data[idx]?.value;

      // Try parsing both as ISO dates
      const dateA = parseISO(aVal);
      const dateB = parseISO(bVal);
      const bothDates = isValid(dateA) && isValid(dateB);

      if (bothDates) {
        // compareAsc/compareDesc return negative/positive/zero
        return dir === 'asc' ? compareAsc(dateA, dateB) : compareDesc(dateA, dateB);
      }

      // Fallback to string comparison
      return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.sorted().slice(start, start + this.pageSize);
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this._data().length / this.pageSize)));
  readonly showPagination = computed(() => this.totalPages() > 1);

  setSort(colIndex: number) {
    if (this.sortColumnIndex() === colIndex) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumnIndex.set(colIndex);
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

  getTemplate(header: string): TemplateRef<{ $implicit: AgridataTableData }> | null {
    const tpl = this.cellTemplates.find((t) => t.header === header);
    return tpl ? tpl.template : null;
  }

  formatValue(value: unknown) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    // check if value is a real Date object (return false for iso date strings)
    if (value instanceof Date && isValid(value)) {
      return format(value, 'dd.MM.yyyy');
    }

    // check if value is a string that can be parsed as a date (for example if it's in ISO format)
    const parsedDate = parseISO(value as string);
    if (isValid(parsedDate)) {
      return format(parsedDate, 'dd.MM.yyyy');
    }
    return value;
  }
}
