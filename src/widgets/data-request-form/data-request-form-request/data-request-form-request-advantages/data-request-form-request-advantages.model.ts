import { AbstractControl, FormGroup, ValidatorFn } from '@angular/forms';

import { DataRequestAdvantageDto } from '@/entities/openapi';

export const MAX_ADVANTAGES = 5;

/**
 * Validates that every advantage in the array has all three language fields (de, fr, it)
 * filled with at least {{ MAX_ADVANTAGES }} characters.
 *
 * Registered at form-creation time (wizard base) rather than component mount so step
 * validity is correct before the user ever navigates to the advantages step.
 *
 * This cannot go through buildReactiveForm for two reasons:
 * 1. The schema used to emit `minLength`/`maxLength` (string keys) instead of
 *    `minItems`/`maxItems` (array keys), so buildValidatorFunctions produced no validators.
 *    The schema has been corrected locally; the BE must be updated to match.
 * 2. Even with correct schema keys, buildReactiveForm creates a single flat
 *    FormControl<DataRequestAdvantageDto[]> — it never recurses into items.properties.
 *    Per-item content validation (each item's de/fr/it >= 5 chars) is domain logic that
 *    the generic schema mapper cannot express.
 */
export const validateAdvantages: ValidatorFn = (control: AbstractControl) => {
  const advantages = control.value as DataRequestAdvantageDto[];
  if (!advantages?.length) return null;
  const isInvalid = advantages.some(
    (a) => !a.de || !a.fr || !a.it || a.de.length < 5 || a.fr.length < 5 || a.it.length < 5,
  );
  return isInvalid ? { advantagesInvalid: true } : null;
};

/** Requires all three language fields when any one of them is filled. */
export const crossLanguageValidator: ValidatorFn = (control: AbstractControl) => {
  const parent = control.parent as FormGroup | null;
  if (!parent) return null;
  const de = parent.get('de')?.value as string;
  const fr = parent.get('fr')?.value as string;
  const it = parent.get('it')?.value as string;
  const anyFilled = de || fr || it;
  if (!anyFilled) return null;
  return control.value ? null : { required: true };
};
