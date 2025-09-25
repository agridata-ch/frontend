import { Component, input, resource, signal } from '@angular/core';
import { isNumber } from '@jsverse/transloco';
import { compareAsc, compareDesc, isValid, parseISO } from 'date-fns';

import { ResourceQueryDto } from '@/entities/openapi';
import { PageResponseDto } from '@/shared/lib/api.helper';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
} from '@/shared/ui/agridata-table';
import { ClientTableMetadata } from '@/shared/ui/agridata-table/client-table/client-table-model';

/**
 * Reactive table that will handle sorting & filtering clientside
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
  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  readonly fetchProducers = resource({
    params: () => {
      return {
        params: this.resourceQueryDto(),
        rawData: this.rawData(),
      };
    },
    loader: (params) =>
      Promise.resolve(this.computeData(params.params.rawData, params.params.params)),
  });

  private computeData(data: Array<T> | undefined, query: ResourceQueryDto | undefined) {
    const rows = this.rawData() ?? [];
    const searchedRows = this.searchRows(rows, query?.searchTerm);
    const totalPages = this.getNumberOfPages(searchedRows);
    const currentPage = !query?.page || query?.page >= totalPages ? 0 : query?.page;
    const sortedRows = this.sortRows(searchedRows, query?.sortParams);
    return {
      totalPages: totalPages,
      currentPage: currentPage,
      totalItems: rows.length ?? 0,
      items: this.getPage(sortedRows, currentPage),
      pageSize: this.pageSize(),
    } as PageResponseDto<T>;
  }

  private getNumberOfPages(data: Array<T>) {
    return Math.ceil(data.length / this.pageSize());
  }

  private getPage(data: Array<T>, page: number) {
    const start = page * this.pageSize();
    return data.slice(start, start + this.pageSize());
  }

  private searchRows(data: Array<T>, searchTerm: string | undefined) {
    const searchFn = this.tableMetadata().searchFn;
    if (!searchFn || !searchTerm) {
      return data;
    }
    return searchFn(data, searchTerm);
  }

  private sortRows(data: Array<T>, sortParams: Array<string> | undefined): T[] {
    if (!sortParams || sortParams?.length == 0) {
      return data;
    }
    const paramWithDirection = sortParams[0];
    const direction = paramWithDirection.startsWith('-') ? SortDirections.DESC : SortDirections.ASC;
    const param =
      direction === SortDirections.ASC ? paramWithDirection : paramWithDirection.substring(1);
    const columnDefinition = this.tableMetadata().columns.find((col) => col.name === param);
    if (!columnDefinition) {
      console.error('no column definition found for paramWithDirection: ' + paramWithDirection);
      return data;
    }
    if (
      !columnDefinition.sortFn &&
      !columnDefinition.sortValueFn &&
      columnDefinition.renderer.type !== CellRendererTypes.FUNCTION
    ) {
      console.error(
        'trying to sort by column' +
          columnDefinition.name +
          ' but no sortFn sortValueFn defined and render type is not function',
      );
      return data;
    }

    return data.sort((a, b) => {
      if (columnDefinition.sortFn) {
        return direction === SortDirections.ASC
          ? columnDefinition.sortFn(a, b)
          : columnDefinition.sortFn(b, a);
      }

      const valueFn =
        columnDefinition.sortValueFn ??
        (columnDefinition.renderer.type === CellRendererTypes.FUNCTION
          ? columnDefinition.renderer.cellRenderFn
          : () => '');

      const aVal: string | number | boolean = valueFn(a);
      const bVal: string | number | boolean = valueFn(b);

      // Try parsing both as ISO dates
      const dateA = parseISO(String(aVal));
      const dateB = parseISO(String(bVal));
      const bothDates = isValid(dateA) && isValid(dateB);

      if (bothDates) {
        // compareAsc/compareDesc return negative/positive/zero
        return direction === SortDirections.ASC
          ? compareAsc(dateA, dateB)
          : compareDesc(dateA, dateB);
      }
      if (isNumber(aVal) || isNumber(bVal)) {
        return direction === SortDirections.ASC
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      // Fallback to string comparison
      return direction === SortDirections.ASC
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }
}
