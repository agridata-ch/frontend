import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  computed,
  signal,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { compareAsc, compareDesc, isValid, parseISO } from 'date-fns';

import { formatDate } from '@/shared/date';

import { AgridataFlipRowDirective, CellTemplateDirective } from './agridata-table.directive';
import { AgridataTableData } from './agridata-table.model';
import { TableActionsComponent } from './table-actions/table-actions.component';

@Component({
  selector: 'app-agridata-table',
  imports: [CommonModule, TableActionsComponent, FontAwesomeModule, AgridataFlipRowDirective],
  templateUrl: './agridata-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgridataTableComponent {
  private readonly _data = signal<AgridataTableData[]>([]);

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

  readonly sortColumnIndex = signal<number | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('desc');
  readonly currentPage = signal(1);
  readonly iconSortUp = faArrowUp;
  readonly iconSortDown = faArrowDown;

  readonly sortIcon = computed(() => {
    const dir = this.sortDirection();
    return dir === 'asc' ? this.iconSortUp : this.iconSortDown;
  });

  readonly headers = computed<string[]>(() => {
    const rows = this._data();
    return rows.length ? rows[0].data.map((cell) => cell.header) : [];
  });

  readonly sortedRows = computed(() => {
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
    return this.sortedRows().slice(start, start + this.pageSize);
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

  getTemplate(header: string) {
    const tpl = this.cellTemplates.find((t) => t.header === header);
    return tpl ? tpl.template : null;
  }

  formatValue(value: unknown) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    // check if value is a real Date object (return false for iso date strings)
    if (value instanceof Date && isValid(value)) {
      return formatDate(value);
    }

    // check if value is a string that can be parsed as a date (for example if it's in ISO format)
    const parsedDate = parseISO(value as string);
    if (isValid(parsedDate)) {
      return formatDate(parsedDate);
    }
    return value;
  }

  onRowClick(row: AgridataTableData) {
    if (row.rowAction) {
      row.rowAction();
    }
  }
}
