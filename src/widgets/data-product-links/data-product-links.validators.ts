import { AbstractControl, ValidatorFn } from '@angular/forms';

import { LinkDto } from '@/entities/openapi';
import { hasText } from '@/shared/forms/cross-field.validators';

export const MAX_LINKS = 5;

/** URLs must be absolute and start with http:// or https://. */
export const URL_PATTERN = /^https?:\/\/.+/i;

/**
 * Links-specific URL format check.
 *
 * Empty value is valid here.
 * The "fill both fields" rule is handled separately by crossFieldValidation.
 *
 * Uses a dedicated `absoluteUrl` key so the UI can show a links-specific message.
 */
export const absoluteUrlValidator: ValidatorFn = (control: AbstractControl) => {
  const value = typeof control.value === 'string' ? control.value.trim() : '';

  if (!value) return null;

  return URL_PATTERN.test(value) ? null : { absoluteUrl: true };
};

/** A row is empty when both fields are empty or whitespace-only. */
export function isEmptyLink(link: LinkDto): boolean {
  return !hasText(link.displayText) && !hasText(link.url);
}

/** Drop empty rows before save; links are optional and empty rows are not persisted. */
export function filterFilledLinks(links: readonly LinkDto[]): LinkDto[] {
  return links.filter((link) => !isEmptyLink(link));
}
