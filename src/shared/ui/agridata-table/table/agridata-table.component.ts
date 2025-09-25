import { CommonModule } from '@angular/common';
import { Component, ResourceRef, computed, effect, input, model, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowDown,
  faArrowUp,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { isValid, parseISO } from 'date-fns';

import { ResourceQueryDto } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { I18nPipe } from '@/shared/i18n';
import { PageResponseDto } from '@/shared/lib/api.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { AgridataSelectComponent } from '@/shared/ui/agridata-select';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { SearchInputComponent } from '@/shared/ui/filter-input/search-input.component';

import {
  CellRendererTypes,
  ColumnDefinition,
  PAGE_SIZES,
  SortDirections,
  TableMetadata,
} from './agridata-table.model';
import { ActionDTO, TableActionsComponent } from '../table-actions/table-actions.component';

/**
 * CommentLastReviewed: 2025-09-26
 *
 * A reusable data table component that provides sorting, pagination, search functionality,
 * and customizable cell rendering. Supports both server-side and client-side operations.
 *
 * Features:
 * - Server-side pagination and sorting
 * - Configurable search functionality
 * - Custom cell renderers (function-based or template-based)
 * - Row highlighting and hover states
 * - Keyboard navigation support
 * - Action buttons per row
 *
 * @template T The type of data objects displayed in the table
 *
 **/
@Component({
  selector: 'app-agridata-table',
  imports: [
    CommonModule,
    TableActionsComponent,
    FontAwesomeModule,
    I18nPipe,
    SearchInputComponent,
    ButtonComponent,
    AgridataSelectComponent,
  ],
  templateUrl: './agridata-table.component.html',
})
export class AgridataTableComponent<T> {
  // Input properties
  readonly tableMetadata = input.required<TableMetadata<T>>();
  readonly dataProvider = input.required<ResourceRef<PageResponseDto<T> | undefined>>();
  readonly enableSearch = input<boolean>(false);

  readonly pageSize = model<number>(10);
  readonly onQueryParamChange = model<ResourceQueryDto>();

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly CellRendererTypes = CellRendererTypes;
  protected readonly faChevronLeft = faChevronLeft;
  protected readonly faChevronRight = faChevronRight;

  readonly SELECTABLE_PAGE_SIZES: MultiSelectOption[] = PAGE_SIZES.map((item) => {
    return { value: item, label: item.toString() };
  });

  protected readonly pageData = signal<PageResponseDto<T>>({
    currentPage: 0,
    pageSize: this.pageSize(),
    totalPages: 1,
    items: [],
    totalItems: 0,
  });
  protected readonly isDataLoading = signal<boolean>(false);
  protected readonly hoveredRowId = signal<string | null>(null);
  protected readonly searchTerm = signal<string>('');
  protected readonly currentPageIndex = signal(0);
  protected readonly columnSortStates = signal<Record<string, SortDirections | undefined>>({});

  protected readonly shouldShowPagination = computed(
    () => this.pageData().totalPages > 1 || this.pageData().totalItems > PAGE_SIZES[0],
  );
  private readonly queryParameters = computed<ResourceQueryDto>(() => ({
    page: this.currentPageIndex(),
    size: this.pageSize(),
    searchTerm: this.searchTerm(),
    sortParams: this.buildSortParameters(),
  }));
  private readonly searchTrigger = computed(() => {
    return {
      providerFn: this.dataProvider(),
      queryParams: this.queryParameters(),
    };
  });

  constructor() {
    effect(() => {
      this.updatePageData(this.dataProvider().value());
    });
    effect(() => {
      this.onQueryParamChange.set(this.queryParameters());
    });

    this.initializeSortStates();
  }

  // Template methods (protected)
  protected toggleColumnSort(column: ColumnDefinition<T>): void {
    if (column.enableSort) {
      const currentDirection = this.columnSortStates()[column.name];
      const newDirection = this.calculateNextSortDirection(currentDirection);
      this.setSingleColumnSort(column, newDirection);
    }
  }

  protected getSortIcon(column: ColumnDefinition<T>) {
    const direction = this.columnSortStates()[column.name];
    if (!direction) return undefined;

    return direction === SortDirections.DESC ? faArrowDown : faArrowUp;
  }

  protected navigateToPreviousPage(): void {
    this.currentPageIndex.update((current) => Math.max(0, current - 1));
  }

  protected navigateToNextPage(): void {
    const maxPage = this.pageData().totalPages - 1;
    this.currentPageIndex.update((current) => Math.min(maxPage, current + 1));
  }

  protected canNavigateToPrevious(): boolean {
    return this.currentPageIndex() > 0;
  }

  protected canNavigateToNext(): boolean {
    return this.currentPageIndex() < this.pageData().totalPages - 1;
  }

  protected handleRowClick(row: T): void {
    const rowAction = this.tableMetadata().rowAction;
    if (rowAction) {
      rowAction(row);
    }
  }

  protected setHoveredRowId(rowId: string | null): void {
    this.hoveredRowId.set(rowId);
  }

  protected getRowId(row: T): string {
    const idColumn = this.tableMetadata().idColumn;
    return String(row[idColumn]);
  }

  protected isRowHighlighted(row: T): boolean {
    const highlightFn = this.tableMetadata().highlightFn;
    return highlightFn ? highlightFn(row) : false;
  }

  protected getRowActions(row: T): ActionDTO[] {
    const actionFunctions = this.tableMetadata().actions;
    if (!actionFunctions) return [];
    return actionFunctions(row);
  }

  protected handleSearchInput(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  protected formatCellValue(value: unknown): string | number | boolean {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number') return value;
    if (typeof value === 'boolean') return value;

    if (value instanceof Date && isValid(value)) {
      return formatDate(value) ?? '';
    }

    if (typeof value === 'string') {
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        return formatDate(parsedDate) ?? '';
      }
    }

    return String(value);
  }

  private initializeSortStates(): void {
    effect(() => {
      const initialSortStates: Record<string, SortDirections | undefined> = {};

      this.tableMetadata().columns.forEach((column) => {
        initialSortStates[column.name] = column.initialSortDirection;
      });

      this.columnSortStates.set(initialSortStates);
    });
  }

  private updatePageData(result: PageResponseDto<T> | undefined): void {
    if (result) {
      this.pageData.set(result);
    }
  }

  private calculateNextSortDirection(currentDirection?: SortDirections): SortDirections {
    return currentDirection === SortDirections.DESC ? SortDirections.ASC : SortDirections.DESC;
  }

  private setSingleColumnSort(column?: ColumnDefinition<T>, direction?: SortDirections): void {
    const newSortStates: Record<string, SortDirections | undefined> = {};

    this.tableMetadata().columns.forEach((col) => {
      newSortStates[col.name] = undefined;
    });

    if (column && direction) {
      newSortStates[column.name] = direction;
    }

    this.columnSortStates.set(newSortStates);
  }

  private buildSortParameters(): string[] {
    const sortStates = this.columnSortStates();

    return this.tableMetadata()
      .columns.filter((column) => sortStates[column.name])
      .map((column) => {
        const isDescending = sortStates[column.name] === SortDirections.DESC;
        const sortPrefix = isDescending ? '-' : '';
        const sortField = (column.sortField as string) ?? column.name;
        return `${sortPrefix}${sortField}`;
      });
  }
}
