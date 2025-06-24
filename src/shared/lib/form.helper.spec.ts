import { AbstractControl, FormGroup } from '@angular/forms';

import type { I18nService } from '@/shared/i18n';

import {
  FieldMap,
  FormControlWithMessages,
  JsonSchema,
  buildReactiveForm,
  getErrorMessage,
} from './form.helper';

describe('buildReactiveForm & getErrorMessage with mocked I18nService', () => {
  // Minimal stub matching I18nService interface
  const i18n: I18nService = {
    translate: jest.fn(),
    // Other methods/properties are not used by buildReactiveForm
    translateSignal: jest.fn(),
    useObjectTranslation: jest.fn(),
    setActiveLang: jest.fn(),
    lang: undefined,
  } as unknown as I18nService;

  it('builds string controls with validators and error messages', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        title: { type: 'string', minLength: 3, maxLength: 5 },
      },
      required: ['title'],
    };
    const fieldMaps: FieldMap[] = [{ formGroupName: 'group', fields: ['title'] }];

    const dto = { title: '' };
    const form: FormGroup = buildReactiveForm(schema, fieldMaps, i18n, dto);
    const group = form.get('group') as FormGroup;
    expect(group).toBeInstanceOf(FormGroup);

    const control = group.get('title') as FormControlWithMessages;
    // Should have required error initially
    expect(control.valid).toBeFalsy();
    expect(control.errors).toHaveProperty('required');

    // Verify translate called for required
    getErrorMessage(control, 'required');
    expect(i18n.translate).toHaveBeenCalledWith('forms.error.required');

    // Valid minlength
    control.setValue('hey');
    expect(control.errors).toBeNull();

    // Exceed maxlength
    control.setValue('toolong');
    expect(control.errors).toHaveProperty('maxlength');
  });

  it('applies minItems/maxItems and messages for array fields', () => {
    const schema: JsonSchema = {
      type: 'object',
      properties: {
        tags: { type: 'array', minItems: 2, maxItems: 3 },
      },
      required: ['tags'],
    };
    const fieldMaps: FieldMap[] = [{ formGroupName: 'grp', fields: ['tags'] }];
    const dto = { tags: ['one'] };

    const form = buildReactiveForm(schema, fieldMaps, i18n, dto);
    const control = form.get('grp.tags') as AbstractControl;

    // minItems violation
    expect(control.errors).toHaveProperty('minItems');

    // Exceed maxItems
    control.setValue(['a', 'b', 'c', 'd']);
    expect(control.errors).toHaveProperty('maxItems');

    // Satisfy both
    control.setValue(['a', 'b']);
    expect(control.errors).toBeNull();
  });
});
