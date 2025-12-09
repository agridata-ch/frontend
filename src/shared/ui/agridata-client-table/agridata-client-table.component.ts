import { Component, input, resource, signal } from '@angular/core';
import { compareAsc, compareDesc, isValid, parseISO } from 'date-fns';

import { ResourceQueryDto } from '@/entities/openapi';
import { PageResponseDto } from '@/shared/lib/api.helper';
import {
  ClientColumnDefinition,
  ClientTableMetadata,
} from '@/shared/ui/agridata-client-table/client-table-model';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
} from '@/shared/ui/agridata-table';

/**
 * Reactive table component that handles client-side sorting and filtering.
 * This component processes data locally, eliminating the need for server-side
 * operations for pagination, sorting, and filtering. It works with a provided
 * dataset and exposes a standardized API for table operations.
 *
 * Features:
 * - Client-side pagination
 * - Dynamic sorting by column
 * - Text-based filtering
 * - Support for custom cell renderers and sort functions
 *
 * CommentLastReviewed: 2025-09-26
 **/
@Component({
  selector: 'app-agridata-client-table',
  imports: [AgridataTableComponent],
  templateUrl: './agridata-client-table.component.html',
})
export class AgridataClientTableComponent<T> {
  readonly rawData = input<Array<T> | undefined>([]);
  readonly tableMetadata = input.required<ClientTableMetadata<T>>();
  readonly pageSize = input<number>(10);
  readonly enableSearch = input<boolean>(false);
  readonly loading = input<boolean | undefined>(false);
  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  readonly fetchData = resource({
    params: () => ({
      queryDto: this.resourceQueryDto(),
      rawData: this.rawData(),
      loading: this.loading(),
    }),
    loader: ({ params }) => {
      if (params.loading) {
        // Because the component that renders this table uses this ressource's loading status we need to return a promise that never resolves as long as the isLoading signal is true.
        return new Promise<PageResponseDto<T>>(() => {});
      }

      return Promise.resolve(this.computeData(params.rawData, params.queryDto));
    },
  });

  private computeData(
    data: Array<T> | undefined,
    query: ResourceQueryDto | undefined,
  ): PageResponseDto<T> {
    const rows = data ?? [];
    const searchedRows = this.applySearch(rows, query?.searchTerm);
    const totalPages = this.calculateTotalPages(searchedRows);
    const currentPage = this.normalizePageIndex(query?.page, totalPages);
    const sortedRows = this.applySorting(searchedRows, query?.sortParams);

    return {
      totalPages,
      currentPage,
      totalItems: rows.length,
      items: this.extractPageItems(sortedRows, currentPage),
      pageSize: this.pageSize(),
    };
  }

  private calculateTotalPages(data: Array<T>): number {
    return Math.ceil(data.length / this.pageSize());
  }

  private normalizePageIndex(page: number | undefined, totalPages: number): number {
    return !page || page >= totalPages ? 0 : page;
  }

  private extractPageItems(data: Array<T>, page: number): Array<T> {
    const startIndex = page * this.pageSize();
    return data.slice(startIndex, startIndex + this.pageSize());
  }

  private applySearch(data: Array<T>, searchTerm: string | undefined): Array<T> {
    const searchFn = this.tableMetadata().searchFn;
    if (!searchFn || !searchTerm) {
      return data;
    }
    return searchFn(data, searchTerm);
  }

  private applySorting(data: Array<T>, sortParams: Array<string> | undefined): T[] {
    if (!sortParams?.length) {
      return data;
    }

    const sortParam = sortParams[0];
    const direction = sortParam.startsWith('-') ? SortDirections.DESC : SortDirections.ASC;
    const columnName = direction === SortDirections.ASC ? sortParam : sortParam.substring(1);
    const column = this.findColumnDefinition(columnName);

    if (!column) {
      return data;
    }

    if (!this.canSortByColumn(column)) {
      console.error(
        `Column ${column.name} cannot be sorted: No sortFn, sortValueFn or renderer.type is not FUNCTION`,
      );
      return data;
    }

    return this.sortByColumn(data, column, direction);
  }

  private findColumnDefinition(columnName: string): ClientColumnDefinition<T> | undefined {
    const column = this.tableMetadata().columns.find((col) => col.name === columnName);

    if (!column) {
      console.error(`No column definition found for: ${columnName}`);
    }

    return column;
  }

  private canSortByColumn(column: ClientColumnDefinition<T>): boolean {
    return !!(
      column?.sortFn ||
      column?.sortValueFn ||
      column.renderer.type === CellRendererTypes.FUNCTION
    );
  }

  private sortByColumn(
    data: T[],
    column: ClientColumnDefinition<T>,
    direction: SortDirections,
  ): T[] {
    return data.sort((a, b) => {
      if (column.sortFn) {
        return direction === SortDirections.ASC ? column.sortFn(a, b) : column.sortFn(b, a);
      }

      const valueFn =
        column.sortValueFn ??
        (column.renderer.type === CellRendererTypes.FUNCTION
          ? column.renderer.cellRenderFn
          : () => '');

      return this.compareValues(valueFn(a), valueFn(b), direction);
    });
  }

  private compareValues(
    aVal: string | number | boolean,
    bVal: string | number | boolean,
    direction: SortDirections,
  ): number {
    const dateA = parseISO(String(aVal));
    const dateB = parseISO(String(bVal));

    if (isValid(dateA) && isValid(dateB)) {
      return direction === SortDirections.ASC
        ? compareAsc(dateA, dateB)
        : compareDesc(dateA, dateB);
    }

    if (this.isNumber(aVal) || this.isNumber(bVal)) {
      return direction === SortDirections.ASC
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    }

    return direction === SortDirections.ASC
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  }

  isNumber(value: unknown): value is number {
    return typeof value === 'number' && !Number.isNaN(value);
  }
}
