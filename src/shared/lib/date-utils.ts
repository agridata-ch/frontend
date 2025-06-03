import { format } from 'date-fns';

export function formatDate(value: string | number | Date | undefined): string | undefined {
  if (!value && value !== 0) return undefined;
  const dateObj = value instanceof Date ? value : new Date(value);
  if (isNaN(dateObj.getTime())) return undefined;
  return format(dateObj, 'dd.MM.yyyy');
}
