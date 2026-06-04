import { FormGroup } from '@angular/forms';

import { FlowCodeEnum, RestClientMethodCodeEnum } from '@/entities/openapi';
import { FORM_COMPLETION_STRATEGIES, FormModel, flattenFormGroup } from '@/shared/lib/form.helper';
import { MultiSelectOption } from '@/shared/ui/agridata-multi-select';

export const DATA_PRODUCT_NEW_ID = 'new';
export const FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM = 'refresh';

export const FORM_TAB_IDS = {
  NAME_AND_DESCRIPTION: 'nameAndDescription',
  TECHNICAL_FIELDS: 'technicalFields',
} as const;

export const FLOW_CODE_OPTIONS: MultiSelectOption[] = Object.values(FlowCodeEnum)
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: value, value }));

export const METHOD_CODE_OPTIONS: MultiSelectOption[] = Object.values(RestClientMethodCodeEnum)
  .sort((a, b) => a.localeCompare(b))
  .map((value) => ({ label: value, value }));

export function buildDataProductPayload(form: FormGroup): Record<string, unknown> {
  const payload = flattenFormGroup(form);
  // for restClientMethodCode and flowCode, we want to send null to the backend if the user has not selected a value (instead of an empty string)
  // because these are ENUM values and the backend will reject an empty string, but will accept null
  if (payload['restClientMethodCode'] === '') payload['restClientMethodCode'] = null;
  if (payload['flowCode'] === '') payload['flowCode'] = null;
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
      { name: 'dataSourceSystemId' },
      { name: 'restClientId' },
      { name: 'restClientMethodCode' },
    ],
  },
  {
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
    formGroupName: FORM_TAB_IDS.TECHNICAL_FIELDS,
    fields: [
      { name: 'flowCode' },
      { name: 'restClientPathTemplate' },
      { name: 'restClientRequestTemplate' },
      { name: 'restClientChangeDetectionPathTemplate' },
    ],
  },
];
