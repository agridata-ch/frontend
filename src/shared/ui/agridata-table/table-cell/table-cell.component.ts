import { NgTemplateOutlet } from '@angular/common';
import { Component, HostBinding, input } from '@angular/core';
import { isValid, parseISO } from 'date-fns';

import { formatDate } from '@/shared/date';
import { TooltipDirective } from '@/shared/tooltip';
import { CellRendererTypes, ColumnDefinition } from '@/shared/ui/agridata-table';

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

/**
 * Renders a row cell of an agridata table
 *
 * CommentLastReviewed: 2026-10-29
 **/
@Component({
  selector: 'app-table-cell',
  imports: [NgTemplateOutlet, TooltipDirective],
  templateUrl: './table-cell.component.html',
})
export class TableCellComponent<T> {
  readonly columnDefinition = input.required<ColumnDefinition<T>>();
  readonly row = input.required<T>();
  protected readonly CellRendererTypes = CellRendererTypes;

  @HostBinding('style.display') display = 'contents';

  protected formatCellValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'number' || typeof value === 'boolean') return value.toString();

    if (value instanceof Date && isValid(value)) {
      return formatDate(value) ?? '';
    }

    // Only ISO dates (YYYY-MM-DD...): parseISO also accepts plain numbers like "10" or "2026"
    if (typeof value === 'string' && ISO_DATE_PREFIX.test(value)) {
      const parsedDate = parseISO(value);
      if (isValid(parsedDate)) {
        return formatDate(parsedDate) ?? '';
      }
    }

    return String(value);
  }
}
