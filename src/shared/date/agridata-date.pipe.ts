import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

/**
 * Date formatting pipe for Agridata application.
 * Transforms Date, string, or number inputs into formatted date strings.
 * Supports 'short' (dd.MM.yyyy) and 'long' (dd.MM.yyyy HH:mm:ss.SSS) formats.
 * Returns an empty string for invalid or null inputs.
 *
 * CommentLastReviewed: 2025-10-08
 */
@Pipe({
  name: 'agridataDate',
})
export class AgridataDatePipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    formatType: 'short' | 'long' = 'short',
  ): string {
    if (!value && value !== 0) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    if (formatType === 'long') {
      return format(date, 'dd.MM.yyyy HH:mm:ss.SSS');
    }

    return format(date, 'dd.MM.yyyy');
  }
}
