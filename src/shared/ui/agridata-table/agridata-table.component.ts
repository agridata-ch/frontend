import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  ResourceRef,
  signal,
  WritableSignal,
} from '@angular/core';
import { faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ResourceQueryDto } from '@/entities/openapi';
import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import { I18nDirective, I18nPipe } from '@/shared/i18n';
import { PageResponseDto } from '@/shared/lib/api.helper';
import { TableCellComponent } from '@/shared/ui/agridata-table/table-cell/table-cell.component';
import { TableHeaderCellComponent } from '@/shared/ui/agridata-table/table-header-cell/table-header-cell.component';
import { TablePaginationComponent } from '@/shared/ui/agridata-table/table-pagination/table-pagination.component';
import {
  ActionDTO,
  TableRowMenuComponent,
} from '@/shared/ui/agridata-table/table-row-menu/table-row-menu.component';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { SearchInputComponent } from '@/shared/ui/filter-input/search-input.component';

import {
  ColumnDefinition,
  PAGE_SIZES,
  SortDirections,
  TableMetadata,
} from './agridata-table.model';

/**
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
 * CommentLastReviewed: 2025-11-25
 **/
@Component({
  selector: 'app-agridata-table',
  imports: [
    CommonModule,
    TableRowMenuComponent,
    FontAwesomeModule,
    SearchInputComponent,
    TableHeaderCellComponent,
    TableCellComponent,
    TablePaginationComponent,
    I18nDirective,
    EmptyStateComponent,
    ButtonComponent,
    ClickStopPropagationDirective,
    I18nPipe,
  ],
  templateUrl: './agridata-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgridataTableComponent<T> {
  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly iconRowAction = faChevronRight;
  protected readonly faSpinnerThird = faSpinnerThird;

  // Input properties
  readonly tableMetadata = input.required<TableMetadata<T>>();
  readonly dataProvider = input.required<ResourceRef<PageResponseDto<T> | undefined>>();
  readonly enableSearch = input<boolean>(false);

  // Model properties
  readonly queryParameters = model<ResourceQueryDto>();

  // Signals
  protected readonly searchTerm = signal<string>('');
  protected readonly nextPageIndex = signal<number>(0);
  protected readonly nextPageSize = signal<number>(PAGE_SIZES[0]);

  // Computed signals
  protected readonly pageData = signal<PageResponseDto<T>>({
    currentPage: 0,
    pageSize: PAGE_SIZES[0],
    totalPages: 1,
    items: [],
    totalItems: 0,
  });
  protected readonly shouldShowPagination = computed(
    () => this.pageData().totalPages > 1 || this.pageData().totalItems > PAGE_SIZES[0],
  );
  protected readonly headerColumnSortModel = computed(() => {
    const sortStates: Record<string, WritableSignal<SortDirections | undefined>> = {};
    this.tableMetadata().columns.forEach((column) => {
      sortStates[column.name] = signal(column.initialSortDirection);
    });
    return sortStates;
  });

  constructor() {
    effect(() => {
      const queryParameters = {
        page: this.nextPageIndex(),
        size: this.nextPageSize(),
        searchTerm: this.searchTerm(),
        sortParams: this.buildSortParameters(),
      };
      this.queryParameters.set(queryParameters);
    });

    effect(() => {
      if (!this.dataProvider().error()) {
        const currentPageData = this.dataProvider().value();
        if (currentPageData?.items) {
          this.pageData.set({
            currentPage: currentPageData?.currentPage ?? 0,
            pageSize: currentPageData?.pageSize ?? PAGE_SIZES[0],
            totalPages: currentPageData?.totalPages ?? 1,
            items: currentPageData?.items ?? [],
            totalItems: currentPageData?.totalItems ?? 0,
          });
        }
      }
    });
  }

  // Template methods (protected)
  protected handleRowClick(row: T): void {
    const rowAction = this.tableMetadata().rowAction;
    if (rowAction) {
      rowAction(row);
    }
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
    const actionFunctions = this.tableMetadata().rowMenuActions;
    if (!actionFunctions) return [];
    return actionFunctions(row);
  }

  protected handleSearchInput(searchTerm: string): void {
    this.searchTerm.set(searchTerm);
  }

  /**
   * Resets all column sort states except the provided
   */
  protected setSingleColumnSort(
    changedColumn: ColumnDefinition<T>,
    direction: SortDirections | undefined,
  ): void {
    const changedColumnSortSignal = this.headerColumnSortModel()[changedColumn.name];
    if (direction) {
      this.tableMetadata().columns.forEach((col) => {
        if (this.headerColumnSortModel()[col.name]() !== undefined) {
          this.headerColumnSortModel()[col.name].set(undefined);
        }
      });
    }
    changedColumnSortSignal.set(direction);
  }

  private buildSortParameters(): string[] {
    const sortStates = this.headerColumnSortModel();

    return this.tableMetadata()
      .columns.filter((column) => sortStates[column.name]())
      .map((column) => {
        const isDescending = sortStates[column.name]() === SortDirections.DESC;
        const sortPrefix = isDescending ? '-' : '';
        const sortField = (column.sortField as string) ?? column.name;
        return `${sortPrefix}${sortField}`;
      });
  }
}
