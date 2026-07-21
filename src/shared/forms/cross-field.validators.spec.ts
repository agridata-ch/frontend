import { FormControl, FormGroup } from '@angular/forms';

import { crossFieldValidation, hasText, revalidateCrossFieldGroup } from './cross-field.validators';

const createGroup = (values: Record<string, string>): FormGroup => {
  const group = new FormGroup(
    Object.fromEntries(
      Object.entries(values).map(([key, value]) => [
        key,
        new FormControl(value, crossFieldValidation),
      ]),
    ),
  );

  // Children validate once at construction before they have a parent.
  Object.values(group.controls).forEach((control) => {
    control.updateValueAndValidity();
  });

  return group;
};

describe('crossFieldValidation', () => {
  it('returns null when the control has no parent', () => {
    expect(crossFieldValidation(new FormControl(''))).toBeNull();
  });

  it('keeps all controls valid when the group is empty', () => {
    const group = createGroup({ displayText: '', url: '' });

    expect(group.get('displayText')?.errors).toBeNull();
    expect(group.get('url')?.errors).toBeNull();
  });

  it('requires empty siblings once one control has text', () => {
    const group = createGroup({ de: 'Vorteil', fr: '', it: '' });

    expect(group.get('de')?.errors).toBeNull();
    expect(group.get('fr')?.errors).toEqual({ required: true });
    expect(group.get('it')?.errors).toEqual({ required: true });
  });

  it('keeps all controls valid when every control has text', () => {
    const group = createGroup({
      de: 'Vorteil',
      fr: 'Avantage',
      it: 'Vantaggio',
    });

    expect(group.valid).toBe(true);
  });

  it('treats whitespace-only strings as empty', () => {
    const group = createGroup({ displayText: '   ', url: '' });

    expect(group.get('displayText')?.errors).toBeNull();
    expect(group.get('url')?.errors).toBeNull();
    expect(group.valid).toBe(true);
  });
});

describe('revalidateCrossFieldGroup', () => {
  it('refreshes sibling validation errors', () => {
    const group = createGroup({ displayText: '', url: '' });

    group.get('displayText')?.setValue('Docs');
    revalidateCrossFieldGroup(group);

    expect(group.get('displayText')?.errors).toBeNull();
    expect(group.get('url')?.errors).toEqual({ required: true });
  });

  it('marks all controls as touched once any control has text', () => {
    const group = createGroup({ displayText: 'Docs', url: '' });

    revalidateCrossFieldGroup(group);

    expect(group.get('displayText')?.touched).toBe(true);
    expect(group.get('url')?.touched).toBe(true);
  });

  it('does not mark controls as touched while the group is empty', () => {
    const group = createGroup({ displayText: '', url: '' });

    revalidateCrossFieldGroup(group);

    expect(group.get('displayText')?.touched).toBe(false);
    expect(group.get('url')?.touched).toBe(false);
    expect(group.valid).toBe(true);
  });

  it('clears sibling errors once all controls are filled', () => {
    const group = createGroup({ displayText: 'Docs', url: '' });

    revalidateCrossFieldGroup(group);
    group.get('url')?.setValue('https://example.com');
    revalidateCrossFieldGroup(group);

    expect(group.get('displayText')?.errors).toBeNull();
    expect(group.get('url')?.errors).toBeNull();
  });
});

describe('hasText', () => {
  it('returns true only for meaningful values', () => {
    expect(hasText('x')).toBe(true);
    expect(hasText(' x ')).toBe(true);
    expect(hasText('')).toBe(false);
    expect(hasText('   ')).toBe(false);
    expect(hasText(null)).toBe(false);
    expect(hasText(undefined)).toBe(false);
  });
});
