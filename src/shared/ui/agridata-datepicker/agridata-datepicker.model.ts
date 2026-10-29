import {
  addDays,
  addMonths,
  addYears,
  endOfWeek,
  format,
  isValid,
  Locale,
  parse,
  startOfWeek,
} from 'date-fns';
import { de, fr, it } from 'date-fns/locale';

export const ISO_FORMAT = 'yyyy-MM-dd';
export const MIN_YEAR = 1900;
export const MAX_YEAR = 2999;
export const MIN_ISO = `${MIN_YEAR}-01-01`;
export const MAX_ISO = `${MAX_YEAR}-12-31`;
export const LOCALES: Record<string, Locale> = { de, fr, it };
export const WEEK_OPTIONS = { weekStartsOn: 1 } as const;
export const DAYS_PER_WEEK = 7;
export const SEGMENT_COUNT = 3;
export const TABBABLE = 'button:not([disabled]):not([tabindex="-1"])';
const TYPED_PATTERN = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
const SEGMENT_MAX = [31, 12];

export interface CalendarDay {
  date: Date;
  disabled: boolean;
  inMonth: boolean;
  iso: string;
  isSelected: boolean;
  isToday: boolean;
  label: string;
  number: string;
}

/** Caret index right after the given number of digits in the masked text, else its end. */
export function caretAfterDigits(masked: string, digits: number): number {
  let seen = 0;
  const caret = masked.split('').findIndex((char) => /\d/.test(char) && ++seen > digits);
  return caret === -1 ? masked.length : caret;
}

/** True when every segment before the last one is complete, so digits can safely flow on. */
export function hasFullLeadingSegments(raw: string): boolean {
  return raw
    .replaceAll(/[^\d.]/g, '')
    .split('.')
    .slice(0, -1)
    .every((part) => part.length === 2);
}

/**
 * Turns typed digits into `dd.MM.yyyy` as the user types. A first day digit above 3 or a first
 * month digit above 1 gets a leading 0, and a digit that would make the day 00 or above 31, the
 * month 00 or above 12, or the year fall outside 1900-2999, is dropped. Dots are only added once a
 * further digit follows.
 */
export function maskDate(raw: string): string {
  let digits = '';
  for (const char of raw.replaceAll(/\D/g, '')) {
    const needsPadding = (digits.length === 0 && char > '3') || (digits.length === 2 && char > '1');
    const next = needsPadding ? `${digits}0${char}` : digits + char;
    if (!isMaskPrefixValid(next)) continue;
    digits = next;
    if (digits.length === 8) break;
  }
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join('.');
}

/**
 * Cleans text that is edited segment by segment, so a change in the day, month or year never moves
 * the other ones (`15.06.2025` minus the 6 is `15.0.2025`). Returns `undefined` when the edit has to
 * be undone: a dot was typed or deleted (`expectedParts` changes) or a segment can no longer become
 * valid. Deleting at the end may drop a trailing dot (`mayLoseDot`).
 */
export function maskSegments(
  raw: string,
  expectedParts: number,
  mayLoseDot: boolean,
): string | undefined {
  const cleaned = raw.replaceAll(/[^\d.]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > SEGMENT_COUNT || (parts.length !== expectedParts && !mayLoseDot)) {
    return undefined;
  }
  return parts.every((segment, index) => isSegmentValid(segment, index)) ? cleaned : undefined;
}

/**
 * Text and caret after an edit. Text that is still being typed flows its digits into `dd.MM.yyyy`.
 * Once it has all three segments, an edit only changes its own segment, so deleting the 6 in
 * 15.06.2025 keeps day and year.
 */
export function nextInputState(
  previous: string,
  raw: string,
  selection: number,
  isDelete: boolean,
): { caret: number; value: string } {
  const atEnd = selection === raw.length;
  const previousParts = previous.split('.').length;

  if (previousParts < SEGMENT_COUNT || (atEnd && hasFullLeadingSegments(raw))) {
    const value = maskDate(raw);
    const digitsBefore = raw.slice(0, selection).replaceAll(/\D/g, '').length;
    // Keep the caret after the same number of digits, so editing in the middle doesn't jump.
    return { caret: atEnd ? value.length : caretAfterDigits(value, digitsBefore), value };
  }

  // ponytail: deleting a selection that spans a dot is undone, select one segment at a time.
  const next = maskSegments(raw, previousParts, isDelete && atEnd);
  if (next === undefined) {
    const shift = isDelete ? 0 : raw.length - previous.length;
    return { caret: Math.max(0, selection - shift), value: previous };
  }
  return { caret: raw.slice(0, selection).replaceAll(/[^\d.]/g, '').length, value: next };
}

/**
 * The segment Tab/Shift+Tab or Left/Right (from a segment's edge) moves the selection to, or
 * `undefined` when the key keeps its normal job (first/last segment, other keys, incomplete text).
 */
export function segmentStepTarget(
  text: string,
  from: number,
  to: number,
  key: string,
  shiftKey: boolean,
): [number, number] | undefined {
  const ranges = segmentRanges(text);
  if (!ranges) return undefined;
  const index = ranges.findIndex(([start, end]) => from >= start && to <= end);
  const current = ranges[index];
  let step = 0;
  if (key === 'Tab') step = shiftKey ? -1 : 1;
  else if (key === 'ArrowRight' && to === current?.[1]) step = 1;
  else if (key === 'ArrowLeft' && from === current?.[0]) step = -1;
  return step === 0 ? undefined : ranges[index + step];
}

/** The day a navigation key moves to, `undefined` for any other key. */
export function moveTarget(event: KeyboardEvent, from: Date): Date | undefined {
  switch (event.key) {
    case 'ArrowDown':
      return addDays(from, 7);
    case 'ArrowLeft':
      return addDays(from, -1);
    case 'ArrowRight':
      return addDays(from, 1);
    case 'ArrowUp':
      return addDays(from, -7);
    case 'End':
      return endOfWeek(from, WEEK_OPTIONS);
    case 'Home':
      return startOfWeek(from, WEEK_OPTIONS);
    case 'PageDown':
      return event.shiftKey ? addYears(from, 1) : addMonths(from, 1);
    case 'PageUp':
      return event.shiftKey ? addYears(from, -1) : addMonths(from, -1);
    default:
      return undefined;
  }
}

/** Start and end index of the day, month and year in a text with exactly two dots, else `undefined`. */
export function segmentRanges(text: string): [number, number][] | undefined {
  const parts = text.split('.');
  if (parts.length !== SEGMENT_COUNT) return undefined;
  let start = 0;
  return parts.map((part): [number, number] => {
    const range: [number, number] = [start, start + part.length];
    start += part.length + 1;
    return range;
  });
}

/** `yyyy-MM-dd` for a typed `d.M.yyyy` date that exists and lies in the supported years, else `''`. */
export function toIso(raw: string): string {
  if (!TYPED_PATTERN.test(raw)) return '';
  const parsed = parse(raw, 'd.M.yyyy', new Date());
  if (!isValid(parsed)) return '';
  const iso = format(parsed, ISO_FORMAT);
  return iso < MIN_ISO || iso > MAX_ISO ? '' : iso;
}

/** True when the typed digits so far still have a valid day, month and year prefix. */
function isMaskPrefixValid(digits: string): boolean {
  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  if (digits.length >= 2 && (day < 1 || day > 31)) return false;
  if (digits.length >= 4 && (month < 1 || month > 12)) return false;
  return digits.length <= 4 || isYearPrefixPossible(digits.slice(4));
}

/** True when the segment (0 = day, 1 = month, 2 = year) can still become a valid one. */
function isSegmentValid(segment: string, index: number): boolean {
  if (index === 2) return segment === '' || (segment.length <= 4 && isYearPrefixPossible(segment));
  const value = Number(segment);
  return segment.length <= 2 && (segment.length < 2 || (value >= 1 && value <= SEGMENT_MAX[index]));
}

/** True when some year between `MIN_YEAR` and `MAX_YEAR` starts with the given year digits. */
function isYearPrefixPossible(prefix: string): boolean {
  const size = 10 ** (4 - prefix.length);
  const first = Number(prefix) * size;
  return first + size - 1 >= MIN_YEAR && first <= MAX_YEAR;
}
