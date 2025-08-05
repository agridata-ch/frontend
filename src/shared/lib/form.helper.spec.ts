import { AbstractControl, FormGroup } from '@angular/forms';

import type { I18nService } from '@/shared/i18n';

import { FieldMap, JsonSchema, buildReactiveForm, getErrorMessage } from './form.helper';

describe('Form Helper', () => {
  // Create mock I18nService directly
  const i18n: I18nService = {
    translate: jest.fn((key: string) => `Translated: ${key}`),
    translateSignal: jest.fn((key: string) => jest.fn(() => `Translated: ${key}`)),
    useObjectTranslation: jest.fn((obj) => obj?.de ?? ''),
    lang: jest.fn(() => 'de'),
  } as unknown as I18nService;

  beforeEach(() => {
    jest.spyOn(i18n, 'translate');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('buildReactiveForm', () => {
    it('builds string controls with validators and error messages', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 3, maxLength: 5 },
        },
        required: ['title'],
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'group', fields: ['title'] }];
      const dto = { title: '' };

      // Act
      const form: FormGroup = buildReactiveForm(schema, fieldMaps, i18n, dto);
      const group = form.get('group') as FormGroup;
      const control = group.get('title') as AbstractControl;

      // Assert
      expect(group).toBeInstanceOf(FormGroup);
      expect(control.valid).toBeFalsy();
      expect(control.errors).toHaveProperty('required');

      // Verify translate called for required error
      getErrorMessage(control, 'required');
      expect(i18n.translate).toHaveBeenCalledWith('forms.error.required');

      // When value meets minLength requirement
      control.setValue('hey');
      expect(control.errors).toBeNull();

      // When value exceeds maxLength
      control.setValue('toolong');
      expect(control.errors).toHaveProperty('maxlength');
    });

    it('applies minItems/maxItems validators and messages for array fields', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          tags: { type: 'array', minItems: 2, maxItems: 3 },
        },
        required: ['tags'],
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'grp', fields: ['tags'] }];
      const dto = { tags: ['one'] };

      // Act
      const form = buildReactiveForm(schema, fieldMaps, i18n, dto);
      const control = form.get('grp.tags') as AbstractControl;

      // Assert: minItems violation
      expect(control.errors).toHaveProperty('minItems');

      // Exceed maxItems
      control.setValue(['a', 'b', 'c', 'd']);
      expect(control.errors).toHaveProperty('maxItems');

      // Satisfy both constraints
      control.setValue(['a', 'b']);
      expect(control.errors).toBeNull();
    });
  });
});
