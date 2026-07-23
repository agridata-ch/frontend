import { FormGroup } from '@angular/forms';

import { FlowCodeEnum, LinkDto, RestClientMethodCodeEnum } from '@/entities/openapi';
import { FORM_COMPLETION_STRATEGIES, FormModel, flattenFormGroup } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';
import { filterFilledLinks } from '@/widgets/data-product-links';

export const DATA_PRODUCT_NEW_ID = 'new';
export const FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM = 'refresh';
// 'draft' creates/updates a not-yet-published product;
// 'edit' PATCHes an already-published (Active) product without changing its status;
// 'publish' finalizes it (sets Active);
export const SAVE_MODE = {
  DRAFT: 'draft',
  EDIT: 'edit',
  PUBLISH: 'publish',
};

export const FORM_TAB_IDS = {
  NAME_AND_DESCRIPTION: 'nameAndDescription',
  TECHNICAL_FIELDS: 'technicalFields',
  LINKS_DOCUMENTS: 'linksAndDocuments',
};

export const FLOW_CODE_OPTIONS: MultiSelectOption[] = Object.values(FlowCodeEnum)
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: value, value }));

export const METHOD_CODE_OPTIONS: MultiSelectOption[] = Object.values(RestClientMethodCodeEnum)
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: value, value }));

export type DisabledRole = 'ADMIN' | 'PROVIDER';

/**
 * Top-level field keys that stay locked (disabled) per role while editing a published data product.
 * Everything not listed is editable by that role. Locked fields are also stripped from the PATCH
 * payload (the backend rejects them).
 */
export const DISABLED_FIELDS_AFTER_PUBLISH: Record<DisabledRole, ReadonlySet<string>> = {
  ADMIN: new Set(['dataSourceSystemId']),
  PROVIDER: new Set(['name', 'description', 'dataSourceSystemId']),
};

export function isFieldDisabledAfterPublish(field: string, isAdmin: boolean): boolean {
  const role: DisabledRole = isAdmin ? 'ADMIN' : 'PROVIDER';
  return DISABLED_FIELDS_AFTER_PUBLISH[role].has(field.split('.')[0]);
}

/**
 * Disables/enables a form group's controls according to the per-role locked set while editing a
 * published product. Uses the default emitEvent so the form-control's control.events subscription
 * fires and the disabled styling updates. Disabling a group control (e.g. `name`) cascades to its
 * language children.
 */
export function applyDisabledAfterPublish(
  group: FormGroup,
  editMode: boolean,
  isAdmin: boolean,
): void {
  for (const field of Object.keys(group.controls)) {
    const control = group.get(field);
    if (!control) continue;
    const disable = editMode && isFieldDisabledAfterPublish(field, isAdmin);
    if (disable && control.enabled) control.disable();
    else if (!disable && control.disabled) control.enable();
  }
}

export function buildDataProductPayload(form: FormGroup): Record<string, unknown> {
  // Skip disabled controls: locked fields (e.g. when editing a published product) must not be sent,
  // the backend rejects them. Create/publish disable nothing, so their payload is unchanged.
  const payload = flattenFormGroup(form, true, true);
  // for restClientMethodCode and flowCode, we want to send null to the backend if the user has not selected a value (instead of an empty string)
  // because these are ENUM values and the backend will reject an empty string, but will accept null
  if (payload['restClientMethodCode'] === '') payload['restClientMethodCode'] = null;
  if (payload['flowCode'] === '') payload['flowCode'] = null;
  // Links are optional and empty rows are UI-only scaffolding; drop them before save.
  if (Array.isArray(payload['links'])) {
    payload['links'] = filterFilledLinks(payload['links'] as LinkDto[]);
  }
  return payload;
}

export const dataProductFormsModel: FormModel[] = [
  {
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    formGroupName: FORM_TAB_IDS.NAME_AND_DESCRIPTION,
    fields: [
      { name: 'name.de' },
      { name: 'name.fr' },
      { name: 'name.it' },
      { name: 'description.de' },
      { name: 'description.fr' },
      { name: 'description.it' },
      { name: 'extendedDescription.de', isRichText: true },
      { name: 'extendedDescription.fr', isRichText: true },
      { name: 'extendedDescription.it', isRichText: true },
    ],
  },
  {
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    formGroupName: FORM_TAB_IDS.TECHNICAL_FIELDS,
    fields: [
      { name: 'dataSourceSystemId' },
      { name: 'restClientId' },
      { name: 'restClientMethodCode' },
      { name: 'flowCode' },
      { name: 'restClientPathTemplate' },
      { name: 'restClientRequestTemplate' },
      { name: 'restClientChangeDetectionPathTemplate' },
    ],
  },
  {
    // Documents are managed outside the reactive form (see DocumentUploadStore); this empty group
    // keeps the tab's required `form` input satisfied and reserves the tab for future link fields.
    completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
    formGroupName: FORM_TAB_IDS.LINKS_DOCUMENTS,
    fields: [{ name: 'links', asFormArray: true }],
  },
];
