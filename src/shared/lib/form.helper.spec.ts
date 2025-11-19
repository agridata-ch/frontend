import { AbstractControl, FormGroup } from '@angular/forms';

import type { I18nService } from '@/shared/i18n';

import {
  FieldMap,
  JsonSchema,
  buildReactiveForm,
  getErrorMessage,
  populateFormFromDto,
} from './form.helper';

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

  describe('populateFormFromDto', () => {
    it('should populate simple fields from DTO', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'userInfo', fields: ['name', 'email'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'John Doe', email: 'john@example.com' };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('userInfo.name')?.value).toBe('John Doe');
      expect(form.get('userInfo.email')?.value).toBe('john@example.com');
    });

    it('should populate nested fields (one level deep)', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          title: {
            type: 'object',
            properties: {
              de: { type: 'string' },
              en: { type: 'string' },
            },
          },
        },
      };
      const fieldMaps: FieldMap[] = [
        { formGroupName: 'content', fields: ['title.de', 'title.en'] },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { title: { de: 'Deutscher Titel', en: 'English Title' } };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('content.title.de')?.value).toBe('Deutscher Titel');
      expect(form.get('content.title.en')?.value).toBe('English Title');
    });

    it('should handle undefined DTO gracefully', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'group', fields: ['name'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n, { name: 'Initial' });

      // Act
      populateFormFromDto(form, undefined, fieldMaps);

      // Assert - should remain unchanged
      expect(form.get('group.name')?.value).toBe('Initial');
    });

    it('should handle non-existent form group gracefully', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'group', fields: ['name'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'Test' };
      const invalidFieldMaps: FieldMap[] = [
        { formGroupName: 'nonExistentGroup', fields: ['name'] },
      ];

      // Act
      populateFormFromDto(form, dto, invalidFieldMaps);

      // Assert - should not throw error
      expect(form.get('group.name')?.value).toBe('');
    });

    it('should handle missing nested values gracefully', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          title: {
            type: 'object',
            properties: {
              de: { type: 'string' },
            },
          },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'content', fields: ['title.de'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n, { title: { de: 'Initial' } });
      const dto = { title: undefined };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert - should remain unchanged when nested value is undefined
      expect(form.get('content.title.de')?.value).toBe('Initial');
    });

    it('should handle emitEvent parameter', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'group', fields: ['name'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('group.name') as AbstractControl;
      const dto = { name: 'New Value' };

      let eventEmitted = false;
      control.valueChanges.subscribe(() => {
        eventEmitted = true;
      });

      // Act with emitEvent = false
      populateFormFromDto(form, dto, fieldMaps, false);

      // Assert - no event should be emitted
      expect(control.value).toBe('New Value');
      expect(eventEmitted).toBe(false);

      // Act with emitEvent = true
      populateFormFromDto(form, { name: 'Another Value' }, fieldMaps, true);

      // Assert - event should be emitted
      expect(control.value).toBe('Another Value');
      expect(eventEmitted).toBe(true);
    });

    it('should populate multiple field groups', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string' },
          address: { type: 'string' },
        },
      };
      const fieldMaps: FieldMap[] = [
        { formGroupName: 'personal', fields: ['name', 'email'] },
        { formGroupName: 'location', fields: ['address'] },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'Jane', email: 'jane@example.com', address: '123 Main St' };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('personal.name')?.value).toBe('Jane');
      expect(form.get('personal.email')?.value).toBe('jane@example.com');
      expect(form.get('location.address')?.value).toBe('123 Main St');
    });

    it('should handle array values', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          tags: { type: 'array' },
        },
      };
      const fieldMaps: FieldMap[] = [{ formGroupName: 'metadata', fields: ['tags'] }];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { tags: ['tag1', 'tag2', 'tag3'] };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('metadata.tags')?.value).toEqual(['tag1', 'tag2', 'tag3']);
    });
  });
});
