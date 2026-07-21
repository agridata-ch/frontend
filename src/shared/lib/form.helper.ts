import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';

import { I18nService } from '@/shared/i18n';

export enum FORM_COMPLETION_STRATEGIES {
  ALWAYS_COMPLETE = 'always-complete',
  EXTERNAL_DEPENDENCY = 'external-dependency',
  FORM_VALIDATION = 'form-validation',
}

export type FormField = {
  readonly name: string;
  readonly i18nDefaultValue?: string;
  // Opt-in: build this array-of-object field as a real FormArray<FormGroup> (schema-driven per-item
  // controls) instead of a single flat control. Only fields that explicitly set this are affected.
  readonly asFormArray?: boolean;
  // Value holds HTML (WYSIWYG). Length validation counts visible text, not markup.
  readonly isRichText?: boolean;
};

export interface FormModel<T extends string = string> {
  readonly completionStrategy: FORM_COMPLETION_STRATEGIES;
  readonly fields: readonly FormField[];
  readonly formGroupName?: T;
}

// Simplified JSON-Schema fragment for validation rules
export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema;
  required?: string[];
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
}

export type Dto = Record<string, unknown>;

// Extension of FormControl to carry translated error message generators
export interface FormControlWithMessages extends FormControl {
  errorMessages?: Record<string, () => string>;
  maxLength?: number;
  minLength?: number;
  minItems?: number;
  maxItems?: number;
  pattern?: string;
}

// Extension of FormArray for array-of-object schema fields. Carries translated error
// message generators plus a factory that builds one empty item group from the schema,
// so consumers can add rows without knowing the item schema themselves.
export interface FormArrayWithMessages extends FormArray<FormGroup> {
  errorMessages?: Record<string, () => string>;
  minItems?: number;
  maxItems?: number;
  buildItem?: () => FormGroup;
}

/**
 * Recursively locate the JsonSchema node and parent-required list for a given field path.
 */
function getSchemaNode(rootSchema: JsonSchema, pathSegments: string[]) {
  let schemaNode = rootSchema;
  let parentRequiredList = rootSchema.required ?? [];

  for (const segment of pathSegments) {
    const next = schemaNode.properties?.[segment];
    if (!next) {
      throw new Error(`Schema missing property "${segment}" in path "${pathSegments.join('.')}'.`);
    }
    parentRequiredList = schemaNode.required ?? [];
    schemaNode = next;
  }

  return { schemaNode, parentRequiredList };
}

/**
 * Custom array-length validators
 */
function minItems(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    const valueArray = Array.isArray(control.value) ? control.value : [];
    return valueArray.length >= min
      ? null
      : { minItems: { required: min, actual: valueArray.length } };
  };
}

function maxItems(max: number): ValidatorFn {
  return (control: AbstractControl) => {
    const valueArray = Array.isArray(control.value) ? control.value : [];
    return valueArray.length <= max
      ? null
      : { maxItems: { required: max, actual: valueArray.length } };
  };
}

// Cache the last parsed (value -> length) so the min and max validators, which run back-to-back on
// the same control value, parse the HTML document only once per keystroke instead of twice.
let lastHtmlValue: string | undefined;
let lastHtmlLength = 0;

/**
 * Length of the visible text inside an HTML string (markup stripped), consistent with the
 * WYSIWYG editor's character counter. Non-string values count as 0.
 */
function htmlTextLength(value: unknown): number {
  if (typeof value !== 'string' || value === '') {
    return 0;
  }
  if (value === lastHtmlValue) {
    return lastHtmlLength;
  }
  lastHtmlLength =
    new DOMParser().parseFromString(value, 'text/html').body.textContent?.length ?? 0;
  lastHtmlValue = value;
  return lastHtmlLength;
}

/**
 * Length validators for rich-text (HTML) fields. They measure visible text instead of raw markup
 * and return Angular's standard error shapes so messages and character-count probes keep working.
 */
function richTextMinLength(min: number): ValidatorFn {
  return (control: AbstractControl) => {
    const length = htmlTextLength(control.value);
    // Mirror Validators.minLength: empty values are left to the required validator.
    return length === 0 || length >= min
      ? null
      : { minlength: { requiredLength: min, actualLength: length } };
  };
}

function richTextMaxLength(max: number): ValidatorFn {
  return (control: AbstractControl) => {
    const length = htmlTextLength(control.value);
    return length <= max ? null : { maxlength: { requiredLength: max, actualLength: length } };
  };
}

/**
 * Required validator for rich-text (HTML) fields. Validators.required treats markup-only values
 * like '<p></p>' as non-empty; measure visible text instead so a field with no visible content
 * fails required regardless of surrounding markup.
 */
function richTextRequired(control: AbstractControl): ValidationErrors | null {
  return htmlTextLength(control.value) === 0 ? { required: true } : null;
}

/**
 * Build an array of Angular ValidatorFns based on the JsonSchema rules.
 */
function buildValidatorFunctions(
  schemaNode: JsonSchema,
  parentRequiredList: string[],
  fieldName: string,
  isRichText: boolean,
) {
  const validators: ValidatorFn[] = [];

  if (parentRequiredList.includes(fieldName)) {
    validators.push(isRichText ? richTextRequired : Validators.required);
  }

  if (schemaNode.type === 'string') {
    if (schemaNode.minLength != null) {
      validators.push(
        isRichText
          ? richTextMinLength(schemaNode.minLength)
          : Validators.minLength(schemaNode.minLength),
      );
    }
    if (schemaNode.maxLength != null) {
      validators.push(
        isRichText
          ? richTextMaxLength(schemaNode.maxLength)
          : Validators.maxLength(schemaNode.maxLength),
      );
    }
  }

  if (schemaNode.pattern != null) {
    validators.push(Validators.pattern(schemaNode.pattern));
  }

  if (schemaNode.minItems != null) {
    validators.push(minItems(schemaNode.minItems));
  }
  if (schemaNode.maxItems != null) {
    validators.push(maxItems(schemaNode.maxItems));
  }

  return validators;
}

/**
 * Generate translated error message factories for each validator key.
 */
function buildErrorMessages(
  schemaNode: JsonSchema,
  parentRequiredList: string[],
  fieldName: string,
  i18n: I18nService,
) {
  const messages: Record<string, () => string> = {};

  if (parentRequiredList.includes(fieldName)) {
    messages['required'] = () => i18n.translate('forms.error.required');
  }
  if (schemaNode.type === 'string') {
    if (schemaNode.minLength != null) {
      messages['minlength'] = () =>
        i18n.translate('forms.error.minlength', {
          min: schemaNode.minLength,
        });
    }
    if (schemaNode.maxLength != null) {
      messages['maxlength'] = () =>
        i18n.translate('forms.error.maxlength', {
          max: schemaNode.maxLength,
        });
    }
  }
  if (schemaNode.minItems != null) {
    messages['minItems'] = () =>
      i18n.translate('forms.error.minItems', {
        min: schemaNode.minItems,
      });
  }
  if (schemaNode.maxItems != null) {
    messages['maxItems'] = () =>
      i18n.translate('forms.error.maxItems', {
        max: schemaNode.maxItems,
      });
  }
  if (schemaNode.pattern != null) {
    messages['pattern'] = () =>
      i18n.translate('forms.error.pattern', {
        pattern: schemaNode.pattern,
      });
  }

  return messages;
}

function addFieldToGroup(
  fieldPath: FormField,
  topGroup: FormGroup,
  jsonSchema: JsonSchema,
  i18nService: I18nService,
) {
  const pathSegments = fieldPath.name.split('.');
  if (pathSegments.length === 0) {
    return;
  }
  let containerGroup = topGroup;

  containerGroup = ensureNestedGroups(pathSegments, containerGroup);

  const lastSegment = pathSegments.at(-1);
  if (!lastSegment) {
    return; // Skip if no last segment
  }
  const { schemaNode, parentRequiredList } = getSchemaNode(jsonSchema, pathSegments);
  const control = createControl(
    schemaNode,
    parentRequiredList,
    lastSegment,
    i18nService,
    fieldPath.isRichText ?? false,
    fieldPath.asFormArray ?? false,
  );

  // Mark as touched if pre-filled to show validation state immediately

  containerGroup.addControl(lastSegment, control);
}

function ensureNestedGroups(pathSegments: string[], containerGroup: FormGroup) {
  // Build nested FormGroups for pathSegments except the last
  for (let depth = 0; depth < pathSegments.length - 1; depth++) {
    const segment = pathSegments[depth];
    if (!containerGroup.get(segment)) {
      containerGroup.addControl(segment, new FormGroup({}));
    }
    containerGroup = containerGroup.get(segment) as FormGroup;
  }
  return containerGroup;
}

function createControl(
  schemaNode: JsonSchema,
  parentRequiredList: string[],
  lastSegment: string,
  i18nService: I18nService,
  isRichText: boolean,
  asFormArray = false,
): AbstractControl {
  // Opt-in array of objects → real FormArray of item groups, so each row's fields become
  // schema-driven controls (with their own validators) instead of a single opaque control.
  if (asFormArray && schemaNode.type === 'array' && schemaNode.items?.type === 'object') {
    return createArrayControl(schemaNode, parentRequiredList, lastSegment, i18nService, isRichText);
  }

  const defaultValue = schemaNode.type === 'array' ? [] : '';
  const validators = buildValidatorFunctions(
    schemaNode,
    parentRequiredList,
    lastSegment,
    isRichText,
  );

  // Create FormControl with messages
  const control = new FormControl(defaultValue, validators) as FormControlWithMessages;
  control.errorMessages = buildErrorMessages(
    schemaNode,
    parentRequiredList,
    lastSegment,
    i18nService,
  );

  control.maxLength = schemaNode.maxLength;
  control.minLength = schemaNode.minLength;
  control.minItems = schemaNode.minItems;
  control.maxItems = schemaNode.maxItems;
  control.pattern = schemaNode.pattern;

  return control;
}

function createArrayControl(
  schemaNode: JsonSchema,
  parentRequiredList: string[],
  lastSegment: string,
  i18nService: I18nService,
  isRichText: boolean,
): FormArrayWithMessages {
  const itemSchema = schemaNode.items;
  const validators = buildValidatorFunctions(
    schemaNode,
    parentRequiredList,
    lastSegment,
    isRichText,
  );

  const array = new FormArray<FormGroup>([], validators) as FormArrayWithMessages;
  array.errorMessages = buildErrorMessages(
    schemaNode,
    parentRequiredList,
    lastSegment,
    i18nService,
  );
  array.minItems = schemaNode.minItems;
  array.maxItems = schemaNode.maxItems;
  array.buildItem = () =>
    itemSchema ? buildItemGroup(itemSchema, i18nService, isRichText) : new FormGroup({});

  return array;
}

/**
 * Build a single FormGroup for one item of an array-of-object schema field, wiring up
 * schema-derived validators and translated error messages per property.
 */
export function buildItemGroup(
  itemSchema: JsonSchema,
  i18nService: I18nService,
  isRichText: boolean,
): FormGroup {
  const group = new FormGroup({});
  const properties = itemSchema.properties ?? {};
  const requiredList = itemSchema.required ?? [];

  for (const propertyName of Object.keys(properties)) {
    const control = createControl(
      properties[propertyName],
      requiredList,
      propertyName,
      i18nService,
      isRichText,
    );
    group.addControl(propertyName, control);
  }

  return group;
}
/**
 * Build a FormGroup tree from schema + DTO + field map, wiring up
 * validators, initial values, and translated error messages.
 *
 * @param jsonSchema  Validation schema
 * @param fieldMaps   Mapping to define top-level FormGroup names and their DTO paths
 * @param i18nService Translation service for error messages
 */
export function buildReactiveForm(
  jsonSchema: JsonSchema,
  fieldMaps: FormModel[],
  i18nService: I18nService,
) {
  const rootGroup = new FormGroup({});

  for (const { formGroupName, fields } of fieldMaps) {
    if (formGroupName) {
      const topGroup = new FormGroup({});
      for (const fieldPath of fields) {
        addFieldToGroup(fieldPath, topGroup, jsonSchema, i18nService);
      }
      rootGroup.addControl(formGroupName, topGroup);
    } else {
      for (const fieldPath of fields) {
        addFieldToGroup(fieldPath, rootGroup, jsonSchema, i18nService);
      }
    }
  }

  return rootGroup;
}

/**
 * Retrieve a translated error message for a given control and error key.
 */
export function getErrorMessage(control: AbstractControl, errorKey: string) {
  const formControl = control as FormControlWithMessages;
  return formControl.errorMessages?.[errorKey]?.() ?? null;
}

/**
 * Flattens a FormGroup by removing the top-level groups and returning a nested object.
 * @param formGroup The FormGroup to flatten.
 * @param skipTopLevel Whether to skip the top-level group.
 * @returns A nested object representing the form's values.
 */
export function flattenFormGroup<T = Record<string, unknown>>(
  formGroup: FormGroup,
  skipTopLevel = true,
): T {
  const result: Record<string, unknown> = {};

  Object.keys(formGroup.controls).forEach((key) => {
    const control = formGroup.get(key);

    if (control instanceof FormGroup) {
      // Recursively process nested FormGroups
      const nestedResult = flattenFormGroup(control, false);
      if (skipTopLevel) {
        // Merge nested results directly into the parent if skipping top-level (neccessary for our custom formGroup creation in the form builder)
        Object.assign(result, nestedResult);
      } else {
        result[key] = nestedResult;
      }
    } else if (control instanceof FormArray) {
      // Array-of-object fields: flatten each item group into an array of plain objects
      result[key] = control.controls.map((item) =>
        item instanceof FormGroup ? flattenFormGroup(item, false) : item.value,
      );
    } else if (control instanceof FormControl) {
      result[key] = control.value;
    }
  });

  return result as unknown as T;
}

export function getFormControl(form: FormGroup, key: string) {
  return form.get(key) as FormControl;
}

export function getFormArray(form: FormGroup, key: string) {
  return form.get(key) as FormArrayWithMessages;
}

export function getFormControlWithMessages(form: FormGroup, key: string): FormControlWithMessages {
  return form.get(key) as FormControlWithMessages;
}

export function setControlValue(
  form: FormGroup,
  key: string,
  value: unknown,
  onlyIfUndefined = false,
  emitEvent = true,
) {
  const control = form.get(key) as FormControl | null;
  if (control) {
    if (onlyIfUndefined && control.value) {
      return;
    }
    control.setValue(value, { emitEvent });
  }
}

/**
 * Populates a FormGroup with values from a DTO based on the provided field mappings.
 * Supports nested fields up to one level deep (e.g., 'title.de').
 *
 * @param form The FormGroup to populate
 * @param dto The data transfer object containing the values
 * @param fieldMaps Array of field mappings defining which fields belong to which form groups
 * @param emitEvent Whether to emit events when setting values (default: false)
 */
export function populateFormFromDto<T extends Dto>(
  form: FormGroup,
  dto: T | undefined,
  fieldMaps: FormModel[],
  emitEvent = true,
) {
  if (!dto) {
    return;
  }

  fieldMaps.forEach((item) => {
    const fg = (item.formGroupName ? form.get(item.formGroupName) : form) as FormGroup | null;
    if (!fg) {
      return;
    }

    item.fields.forEach((field) => {
      const parts = field.name.split('.');
      if (parts.length > 2) {
        console.error(
          `Field ${field.name} has more than one dot, nested fields deeper than one level are not supported yet.`,
        );
        return;
      }

      let value = (dto as unknown as Dto)[parts[0]];
      let controlField = fg.get(parts[0]);

      if (parts.length > 1 && controlField) {
        if (!value) {
          return;
        }
        value = (value as unknown as Dto)[parts[1]];
        controlField = controlField.get(parts[1]);
      }

      if (controlField instanceof FormArray) {
        hydrateFormArray(controlField, value, emitEvent);
        return;
      }

      if (controlField) {
        controlField.setValue(value, { emitEvent });
      }
    });
  });
}

/**
 * Rebuild a schema-generated FormArray from a DTO array: clear it and push one freshly
 * built item group per element, patching in the element's values.
 */
function hydrateFormArray(array: FormArray, value: unknown, emitEvent: boolean) {
  const items = Array.isArray(value) ? (value as Dto[]) : [];
  const buildItem = (array as FormArrayWithMessages).buildItem;

  if (items.length > 0 && !buildItem) {
    console.error('hydrateFormArray: FormArray has no buildItem factory; DTO values were dropped.');
  }

  array.clear({ emitEvent });
  for (const item of items) {
    const group = buildItem?.();
    if (!group) {
      continue;
    }
    group.patchValue(item, { emitEvent });
    array.push(group, { emitEvent });
  }
}

export function createFormControl(
  initialValue: string,
  validators: Array<Validators | ValidatorFn> = [],
  errorMessages: Record<string, () => string> = {},
): FormControlWithMessages {
  const control = new FormControl(
    initialValue,
    validators as ValidatorFn[],
  ) as FormControlWithMessages;
  control.errorMessages = errorMessages;

  return control;
}
