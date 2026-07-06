import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

/**
 * True when a value is a non-empty string after trimming, or any other non-null/non-empty value.
 */
export function hasText(value: unknown): boolean {
  return typeof value === 'string' ? value.trim().length > 0 : value != null && value !== '';
}

/**
 * Cross-field required rule for a single form group: once ANY control in the control's parent group
 * has text, EVERY control in that group must be filled.
 *
 * Important:
 * - Attach this to the child controls, not the parent group/array — so the error lands on the field
 *   and `app-form-control` can show the red state (it renders on `touched && invalid`).
 * - Revalidate sibling controls manually when one sibling changes (Angular does not cascade).
 * - Uses `{ required: true }` so the existing generic required message is reused.
 */
export function crossFieldValidation(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;

  if (!(parent instanceof FormGroup)) return null;

  const anyFilled = Object.values(parent.controls).some((sibling) => hasText(sibling.value));

  if (!anyFilled) return null;

  return hasText(control.value) ? null : { required: true };
}

/**
 * Recompute a cross-field group's validity and surface errors immediately.
 *
 * Angular does not cascade a control's revalidation to its siblings, so this refreshes every child,
 * then — once any field has text — marks the whole group touched so `app-form-control` shows the
 * red state on the empty siblings without waiting for each to be blurred.
 *
 * Call this from a template/host `(input)` binding (see CrossFieldGroupDirective) so the owning
 * view is marked dirty and the sibling fields re-render in the zoneless change detection model.
 */
export function revalidateCrossFieldGroup(group: FormGroup): void {
  const controls = Object.values(group.controls);

  for (const control of controls) {
    control.updateValueAndValidity();
  }

  if (controls.some((control) => hasText(control.value))) {
    group.markAllAsTouched();
  }

  // Propagates up to the parent FormArray so its aggregate validity updates too.
  group.updateValueAndValidity({ emitEvent: false });
}
