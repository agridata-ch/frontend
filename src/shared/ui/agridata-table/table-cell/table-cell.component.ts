import { NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';
import { isValid, parseISO } from 'date-fns';

import { formatDate } from '@/shared/date';
import { TooltipDirective } from '@/shared/tooltip';
import { CellRendererTypes, ColumnDefinition } from '@/shared/ui/agridata-table';

const ISO_DATE_PREFIX = /^\d{4}-\d{2}-\d{2}/;

/**
 * Renders a row cell of an agridata table. Attribute selector so the host is the td itself.
 *
 * CommentLastReviewed: 2026-11-05
 **/
@Component({
  selector: 'td[app-table-cell]',
  imports: [NgTemplateOutlet, TooltipDirective],
  templateUrl: './table-cell.component.html',
  host: {
    class: 'align-middle py-2 px-2 first:pl-4 last:pr-4 border-t border-gray-200',
    '[class]': 'columnDefinition().cellCssClasses',
  },
})
export class TableCellComponent<T> {
  // Constants
  protected readonly CellRendererTypes = CellRendererTypes;

  // Input properties
  readonly columnDefinition = input.required<ColumnDefinition<T>>();
  readonly row = input.required<T>();

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
