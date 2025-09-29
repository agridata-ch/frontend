import { NgTemplateOutlet } from '@angular/common';
import { Component, HostBinding, input } from '@angular/core';
import { isValid, parseISO } from 'date-fns';

import { formatDate } from '@/shared/date';
import { CellRendererTypes, ColumnDefinition } from '@/shared/ui/agridata-table';

/**
 * Renders a row cell of an agridata table
 *
 * CommentLastReviewed: 2025-09-29
 **/
@Component({
  selector: 'app-table-cell',
  imports: [NgTemplateOutlet],
  templateUrl: './table-cell.component.html',
})
export class TableCellComponent<T> {
  readonly columnDefinition = input.required<ColumnDefinition<T>>();
  readonly row = input.required<T>();
  protected readonly CellRendererTypes = CellRendererTypes;

  @HostBinding('style.display') display = 'contents';

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
}
