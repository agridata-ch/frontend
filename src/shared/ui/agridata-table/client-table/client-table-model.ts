import { ColumnDefinition, TableMetadata } from '@/shared/ui/agridata-table';

export interface ClientColumnDefinition<T> extends ColumnDefinition<T> {
  sortValueFn?: (item: T) => string | number | boolean;
  sortFn?: (a: T, b: T) => number;
}

export interface ClientTableMetadata<T> extends TableMetadata<T> {
  columns: ClientColumnDefinition<T>[];
  searchFn?: (data: T[], searchTerm: string) => T[];
}
