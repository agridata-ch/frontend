import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';

import { I18nService } from '@/shared/i18n';

// Defines a top-level grouping of DTO fields into a named FormGroup
export interface FieldMap {
  formGroupName: string;
  fields: string[];
}

// Simplified JSON-Schema fragment for validation rules
export interface JsonSchema {
  type: string;
  properties?: Record<string, JsonSchema>;
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

/**
 * Build an array of Angular ValidatorFns based on the JsonSchema rules.
 */
function buildValidatorFunctions(
  schemaNode: JsonSchema,
  parentRequiredList: string[],
  fieldName: string,
) {
  const validators: ValidatorFn[] = [];

  if (parentRequiredList.includes(fieldName)) {
    validators.push(Validators.required);
  }

  if (schemaNode.type === 'string') {
    if (schemaNode.minLength != null) {
      validators.push(Validators.minLength(schemaNode.minLength));
    }
    if (schemaNode.maxLength != null) {
      validators.push(Validators.maxLength(schemaNode.maxLength));
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
 * Safely retrieve a nested value from the DTO by path, defaulting to the empty string.
 */
function getDtoValue(dto: Dto, pathSegments: string[], defaultValue: unknown = '') {
  return pathSegments.reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      return (current as Record<string, unknown>)[key];
    }
    return defaultValue; // Use the provided default value if the path is not found
  }, dto);
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

/**
 * Build a FormGroup tree from schema + DTO + field map, wiring up
 * validators, initial values, and translated error messages.
 *
 * @param jsonSchema  Validation schema
 * @param fieldMaps   Mapping to define top-level FormGroup names and their DTO paths
 * @param i18nService Translation service for error messages
 * @param dto         Initial data (defaults to empty object)
 */
export function buildReactiveForm(
  jsonSchema: JsonSchema,
  fieldMaps: FieldMap[],
  i18nService: I18nService,
  dto: Dto = {},
) {
  const rootGroup = new FormGroup({});

  for (const { formGroupName, fields } of fieldMaps) {
    const topGroup = new FormGroup({});

    for (const fieldPath of fields) {
      const pathSegments = fieldPath.split('.');
      if (pathSegments.length === 0) {
        continue;
      }
      let containerGroup = topGroup;

      // Build nested FormGroups for pathSegments except the last
      for (let depth = 0; depth < pathSegments.length - 1; depth++) {
        const segment = pathSegments[depth];
        if (!containerGroup.get(segment)) {
          containerGroup.addControl(segment, new FormGroup({}));
        }
        containerGroup = containerGroup.get(segment) as FormGroup;
      }

      const lastSegment = pathSegments.at(-1);
      if (!lastSegment) {
        continue; // Skip if no last segment
      }
      const { schemaNode, parentRequiredList } = getSchemaNode(jsonSchema, pathSegments);
      const defaultValue = schemaNode.type === 'array' ? [] : '';
      const initialValue = getDtoValue(dto, pathSegments, defaultValue);
      const validators = buildValidatorFunctions(schemaNode, parentRequiredList, lastSegment);

      // Create FormControl with messages
      const control = new FormControl(initialValue, validators) as FormControlWithMessages;
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

      // Mark as touched if pre-filled to show validation state immediately

      containerGroup.addControl(lastSegment, control);
    }

    rootGroup.addControl(formGroupName, topGroup);
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
export function flattenFormGroup(
  formGroup: FormGroup,
  skipTopLevel = true,
): Record<string, unknown> {
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
    } else if (control instanceof FormControl) {
      result[key] = control.value;
    }
  });

  return result;
}

export function getFormControl(form: FormGroup, key: string) {
  return form.get(key) as FormControl;
}
