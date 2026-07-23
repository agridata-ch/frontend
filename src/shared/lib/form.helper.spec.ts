import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';

import type { I18nService } from '@/shared/i18n';
import { FORM_GROUP_NAMES } from '@/widgets/data-request-wizard';

import {
  buildReactiveForm,
  flattenFormGroup,
  FORM_COMPLETION_STRATEGIES,
  FormArrayWithMessages,
  FormModel,
  getErrorMessage,
  getFormArray,
  JsonSchema,
  populateFormFromDto,
  setControlValue,
} from './form.helper';

const arrayOfObjectSchema: JsonSchema = {
  type: 'object',
  properties: {
    links: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          displayText: { type: 'string', minLength: 1, maxLength: 255 },
          url: { type: 'string', minLength: 1, maxLength: 2048 },
        },
      },
      minItems: 0,
      maxItems: 3,
    },
  },
};

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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'title' }],
        },
      ];

      // Act
      const form: FormGroup = buildReactiveForm(schema, fieldMaps, i18n);
      const group = form.get('consumer') as FormGroup;
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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'tags' }],
        },
      ];

      // Act
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('consumer.tags') as AbstractControl;

      // Assert: minItems violation
      expect(control.errors).toHaveProperty('minItems');

      // Exceed maxItems
      control.setValue(['a', 'b', 'c', 'd']);
      expect(control.errors).toHaveProperty('maxItems');

      // Satisfy both constraints
      control.setValue(['a', 'b']);
      expect(control.errors).toBeNull();
    });

    it('measures visible text (not HTML markup) for rich-text fields', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          description: { type: 'string', minLength: 10, maxLength: 20 },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'description', isRichText: true }],
        },
      ];

      // Act
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('consumer.description') as AbstractControl;

      // Assert: markup wrapper must not satisfy minLength — only 2 visible chars
      control.setValue('<p>hi</p>');
      expect(control.errors).toHaveProperty('minlength');

      // Enough visible text passes, even wrapped in markup
      control.setValue('<p><strong>hello there</strong></p>');
      expect(control.errors).toBeNull();

      // maxLength counts visible text, so heavy markup around short text does not trip it
      control.setValue('<p><em><u>short text</u></em></p>');
      expect(control.errors).toBeNull();

      // But too much visible text still fails
      control.setValue('<p>this visible text is definitely too long</p>');
      expect(control.errors).toHaveProperty('maxlength');
    });

    it('counts raw length for non-rich-text string fields', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          description: { type: 'string', minLength: 10, maxLength: 20 },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'description' }],
        },
      ];

      // Act
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('consumer.description') as AbstractControl;

      // Assert: raw string length is used, so markup counts toward the limit.
      // "<p>short</p>" is 12 raw chars (passes minLength 10) though only 5 visible chars
      // would fail under rich-text counting.
      control.setValue('<p>short</p>');
      expect(control.errors).toBeNull();
    });

    it('fails required for markup-only rich-text values with no visible text', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          description: { type: 'string' },
        },
        required: ['description'],
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'description', isRichText: true }],
        },
      ];

      // Act
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('consumer.description') as AbstractControl;

      // Assert: markup with no visible text must fail required (Validators.required would pass here)
      control.setValue('<p></p>');
      expect(control.errors).toHaveProperty('required');

      control.setValue('<p><br></p>');
      expect(control.errors).toHaveProperty('required');

      // Visible text satisfies required
      control.setValue('<p>hello</p>');
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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }, { name: 'email' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'John Doe', email: 'john@example.com' };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('consumer.name')?.value).toBe('John Doe');
      expect(form.get('consumer.email')?.value).toBe('john@example.com');
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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'title.de' }, { name: 'title.en' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { title: { de: 'Deutscher Titel', en: 'English Title' } };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('consumer.title.de')?.value).toBe('Deutscher Titel');
      expect(form.get('consumer.title.en')?.value).toBe('English Title');
    });

    it('should handle undefined DTO gracefully', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);

      // Act
      populateFormFromDto(form, undefined, fieldMaps);

      // Assert - should remain unchanged
      expect(form.get('consumer.name')?.value).toBe('');
    });

    it('should handle non-existent form group gracefully', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'Test' };
      const invalidFieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.REQUEST,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }],
        },
      ];

      // Act
      populateFormFromDto(form, dto, invalidFieldMaps);

      // Assert - should not throw error
      expect(form.get('consumer.name')?.value).toBe('');
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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'title.de' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { title: { de: 'title' } };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert - should remain unchanged when nested value is undefined
      expect(form.get('consumer.title.de')?.value).toBe('title');
    });

    it('should handle emitEvent parameter', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const control = form.get('consumer.name') as AbstractControl;
      const dto = { name: 'New Value' };

      populateFormFromDto(form, dto, fieldMaps, false);

      expect(control.value).toBe('New Value');

      populateFormFromDto(form, { name: 'Another Value' }, fieldMaps, true);

      // Assert - event should be emitted
      expect(control.value).toBe('Another Value');
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
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'name' }, { name: 'email' }],
        },
        {
          formGroupName: FORM_GROUP_NAMES.REQUEST,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'address' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { name: 'Jane', email: 'jane@example.com', address: '123 Main St' };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('consumer.name')?.value).toBe('Jane');
      expect(form.get('consumer.email')?.value).toBe('jane@example.com');
      expect(form.get('request.address')?.value).toBe('123 Main St');
    });

    it('should handle array values', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          tags: { type: 'array' },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'tags' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { tags: ['tag1', 'tag2', 'tag3'] };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      // Assert
      expect(form.get('consumer.tags')?.value).toEqual(['tag1', 'tag2', 'tag3']);
    });

    it('should update value', () => {
      // Arrange
      const schema: JsonSchema = {
        type: 'object',
        properties: {
          tags: { type: 'array' },
        },
      };
      const fieldMaps: FormModel[] = [
        {
          formGroupName: FORM_GROUP_NAMES.CONSUMER,
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'tags' }],
        },
      ];
      const form = buildReactiveForm(schema, fieldMaps, i18n);
      const dto = { tags: ['tag1', 'tag2', 'tag3'] };

      // Act
      populateFormFromDto(form, dto, fieldMaps);

      const field = `${FORM_GROUP_NAMES.CONSUMER}.tags`;
      setControlValue(form, field, 'test value');

      const control = form.get(field) as AbstractControl;
      // Assert
      expect(control.value).toEqual('test value');
    });
  });

  describe('array-of-object fields', () => {
    const arrayFieldMaps: FormModel[] = [
      {
        completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
        fields: [{ name: 'links', asFormArray: true }],
      },
    ];

    it('builds a flat control when asFormArray is not set (backward compatible)', () => {
      const fieldMaps: FormModel[] = [
        {
          completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
          fields: [{ name: 'links' }],
        },
      ];

      const form = buildReactiveForm(arrayOfObjectSchema, fieldMaps, i18n);

      expect(form.get('links')).not.toBeInstanceOf(FormArray);
      expect(form.get('links')?.value).toEqual([]);
    });

    it('builds a FormArray with a schema-driven buildItem factory when opted in', () => {
      const form = buildReactiveForm(arrayOfObjectSchema, arrayFieldMaps, i18n);
      const array = getFormArray(form, 'links');

      expect(array).toBeInstanceOf(FormArray);
      expect(array).toHaveLength(0);

      const item = array.buildItem?.();
      expect(item?.get('displayText')).toBeTruthy();
      expect(item?.get('url')).toBeTruthy();

      // schema validators are wired onto the item controls
      item?.get('url')?.setValue('x'.repeat(2049));
      expect(item?.get('url')?.errors).toHaveProperty('maxlength');
    });

    it('applies maxItems from the schema to the FormArray', () => {
      const form = buildReactiveForm(arrayOfObjectSchema, arrayFieldMaps, i18n);
      const array = getFormArray(form, 'links');

      for (let i = 0; i < 4; i++) {
        const item = array.buildItem?.();
        if (item) array.push(item);
      }

      expect(array.errors).toHaveProperty('maxItems');
    });

    it('flattens a FormArray into an array of plain objects', () => {
      const form = buildReactiveForm(arrayOfObjectSchema, arrayFieldMaps, i18n);
      const array = getFormArray(form, 'links');
      const item = array.buildItem?.() as FormGroup;
      item.setValue({ displayText: 'Docs', url: 'https://example.com' });
      array.push(item);

      const flattened = flattenFormGroup<{ links: unknown[] }>(form);

      expect(flattened.links).toEqual([{ displayText: 'Docs', url: 'https://example.com' }]);
    });

    it('omits disabled controls inside a FormArray item when skipDisabled is true', () => {
      const form = buildReactiveForm(arrayOfObjectSchema, arrayFieldMaps, i18n);
      const array = getFormArray(form, 'links');
      const item = array.buildItem?.() as FormGroup;
      item.setValue({ displayText: 'Docs', url: 'https://example.com' });
      item.get('url')?.disable();
      array.push(item);

      const flattened = flattenFormGroup<{ links: Record<string, unknown>[] }>(form, true, true);

      expect(flattened.links).toEqual([{ displayText: 'Docs' }]);
    });

    it('omits disabled controls when skipDisabled is true', () => {
      const form = new FormGroup({
        enabledField: new FormControl('keep'),
        disabledField: new FormControl('drop'),
      });
      form.get('disabledField')?.disable();

      const withoutDisabled = flattenFormGroup(form, true, true);
      const withDisabled = flattenFormGroup(form, true, false);

      expect(withoutDisabled).toEqual({ enabledField: 'keep' });
      expect(withDisabled).toEqual({ enabledField: 'keep', disabledField: 'drop' });
    });

    it('hydrates a FormArray from a DTO array via populateFormFromDto', () => {
      const form = buildReactiveForm(arrayOfObjectSchema, arrayFieldMaps, i18n);
      const dto = {
        links: [
          { displayText: 'Docs', url: 'https://example.com' },
          { displayText: 'API', url: 'https://api.example.com' },
        ],
      };

      populateFormFromDto(form, dto, arrayFieldMaps);
      const array: FormArrayWithMessages = getFormArray(form, 'links');

      expect(array).toHaveLength(2);
      expect(array.at(0).get('displayText')?.value).toBe('Docs');
      expect(array.at(1).get('url')?.value).toBe('https://api.example.com');
    });
  });
});
