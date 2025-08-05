import { CommonModule } from '@angular/common';
import { Component, computed, contentChildren, effect, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { compareAsc, compareDesc, isValid, parseISO } from 'date-fns';

import { formatDate } from '@/shared/date';
import { I18nPipe } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

import { AgridataFlipRowDirective, CellTemplateDirective } from './agridata-table.directive';
import { AgridataTableData, SortDirections } from './agridata-table.model';
import { TableActionsComponent } from './table-actions/table-actions.component';

@Component({
  selector: 'app-agridata-table',
  imports: [
    CommonModule,
    TableActionsComponent,
    FontAwesomeModule,
    AgridataFlipRowDirective,
    I18nPipe,
    ButtonComponent,
  ],
  templateUrl: './agridata-table.component.html',
})
export class AgridataTableComponent {
  readonly rawData = input<AgridataTableData[] | null>(null);
  readonly defaultSortColumn = input<string>('');
  readonly defaultSortDirection = input<SortDirections.ASC | SortDirections.DESC>(
    SortDirections.DESC,
  );
  readonly pageSize = input<number>(10);

  readonly ButtonVariants = ButtonVariants;

  readonly cellTemplates = contentChildren(CellTemplateDirective);

  readonly _data = signal<AgridataTableData[]>([]);
  readonly sortColumnIndex = signal<number | null>(null);
  readonly sortDirection = signal<SortDirections.ASC | SortDirections.DESC>(SortDirections.DESC);
  readonly currentPage = signal(1);
  readonly hoveredRowId = signal<string | null>(null);

  readonly sortIcon = computed(() => {
    const dir = this.sortDirection();
    return dir === SortDirections.ASC ? faArrowUp : faArrowDown;
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
        return dir === SortDirections.ASC ? compareAsc(dateA, dateB) : compareDesc(dateA, dateB);
      }

      // Fallback to string comparison
      return dir === SortDirections.ASC ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });
  });

  readonly paginated = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    return this.sortedRows().slice(start, start + this.pageSize());
  });

  readonly totalPages = computed(() => {
    if (!this.rawData() || !this.pageSize()) return 1;
    const total = Math.ceil((this.rawData() ?? []).length / this.pageSize());
    return total > 0 ? total : 1;
  });
  readonly showPagination = computed(() => this.totalPages() > 1);

  constructor() {
    effect(() => {
      const rows = this.rawData() ?? [];
      this._data.set(rows);
      this.currentPage.set(1);

      const headers = rows.length ? rows[0].data.map((cell) => cell.header) : [];

      const idx = this.defaultSortColumn ? headers.indexOf(this.defaultSortColumn()) : -1;
      this.sortColumnIndex.set(idx >= 0 ? idx : null);
      this.sortDirection.set(this.defaultSortDirection());
    });
  }

  setSort(colIndex: number) {
    if (this.sortColumnIndex() === colIndex) {
      this.sortDirection.update((d) =>
        d === SortDirections.ASC ? SortDirections.DESC : SortDirections.ASC,
      );
    } else {
      this.sortColumnIndex.set(colIndex);
      this.sortDirection.set(SortDirections.DESC);
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
    const templates = this.cellTemplates();
    const tpl = templates.find(
      (t) => (typeof t.header === 'function' ? t.header() : t.header) === header,
    );
    return tpl?.template ?? null;
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

  getRowActionCallback(row: AgridataTableData): () => void {
    return () => this.onRowClick(row);
  }

  setHoveredRow(rowId: string | null) {
    this.hoveredRowId.set(rowId);
  }
}
