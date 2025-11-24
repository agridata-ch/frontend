import { TemplateRef } from '@angular/core';

import { ActionDTO } from '@/shared/ui/agridata-table/table-row-menu/table-row-menu.component';

export enum CellRendererTypes {
  FUNCTION = 'function',
  TEMPLATE = 'template',
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface BaseCellRenderer<T> {
  type: CellRendererTypes[keyof CellRendererTypes];
}

export interface FunctionCellRenderer<T> extends BaseCellRenderer<T> {
  type: CellRendererTypes.FUNCTION;
  cellRenderFn: (row: T) => string | number | boolean;
}

export interface TemplateCellRenderer<T> extends BaseCellRenderer<T> {
  type: CellRendererTypes.TEMPLATE;
  template: TemplateRef<{ $implicit: T }> | undefined;
}

export type CellRenderer<T> = FunctionCellRenderer<T> | TemplateCellRenderer<T>;

export interface ColumnDefinition<T> {
  name: string;
  renderer: CellRenderer<T>;
  headerCssClasses?: string;
  cellCssClasses?: string;
  sortField?: keyof T;
  initialSortDirection?: SortDirections;
  sortable?: boolean;
}

export interface TableMetadata<T> {
  rowMenuActions?: (item?: T) => ActionDTO[];
  rowAction?: (item: T) => void;
  idColumn: keyof T;
  columns: ColumnDefinition<T>[];
  showRowActionButton?: boolean;
  highlightFn?: (item: T) => boolean;
}

export enum SortDirections {
  ASC = 'asc',
  DESC = 'desc',
}

export const PAGE_SIZES = [10, 25, 50, 100];
