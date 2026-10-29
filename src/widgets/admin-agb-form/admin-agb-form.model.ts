import { Validators } from '@angular/forms';
import { format } from 'date-fns';

import { AgbRevisionCreateDto as AgbRevisionCreateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import {
  AgbRevisionCreateDto,
  AgbRevisionDto,
  AgbTextDto,
  ExceptionEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  buildReactiveForm,
  FORM_COMPLETION_STRATEGIES,
  FormModel,
  getFormControlWithMessages,
} from '@/shared/lib/form.helper';

import { availableLangs } from '../../../transloco.config';

/** Route param value of the AGB form that means "create a new revision" instead of "view one". */
export const AGB_NEW_ID = 'new';

/** Navigation state key telling the AGB list to reload after the sidepanel closes. */
export const FORCE_RELOAD_AGB_REVISIONS_STATE_PARAM = 'refresh';

/** Backend errors shown on the version field, mapped to the validation error key they set. */
export const AGB_VERSION_ERRORS: Partial<Record<ExceptionEnum, string>> = {
  [ExceptionEnum.AgbVersionAlreadyExists]: 'versionAlreadyExists',
  [ExceptionEnum.AgbVersionNotNewer]: 'versionNotNewer',
};

export interface AgbFormValue {
  version: string;
  enforceConsentFrom: string;
  agbText: AgbTextDto;
}

export const agbFormsModel: FormModel[] = [
  {
    completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
    fields: [
      { name: 'version' },
      { name: 'enforceConsentFrom' },
      ...availableLangs.map((lang) => ({ name: `agbText.${lang}` })),
    ],
  },
];

export const EMPTY_AGB_FORM_VALUE = {
  version: '',
  enforceConsentFrom: '',
  agbText: Object.fromEntries(availableLangs.map((lang) => [lang, ''])),
};

/** Builds the create form from the backend schema, plus version errors and the consent date rule. */
export function buildAgbForm(i18nService: I18nService) {
  const form = buildReactiveForm(AgbRevisionCreateDtoSchema, agbFormsModel, i18nService);

  const version = getFormControlWithMessages(form, 'version');
  version.errorMessages = {
    ...version.errorMessages,
    versionAlreadyExists: () =>
      i18nService.translate('admin-agbs.create.error.versionAlreadyExists'),
    versionNotNewer: () => i18nService.translate('admin-agbs.create.error.versionNotNewer'),
  };

  // Only required while the toggle is on (the control is disabled otherwise), so not a schema rule.
  const consentDate = getFormControlWithMessages(form, 'enforceConsentFrom');
  consentDate.addValidators(Validators.required);
  consentDate.errorMessages = {
    ...consentDate.errorMessages,
    required: () => i18nService.translate('forms.error.required'),
  };
  return form;
}

/** Create payload; the consent date is only sent while its toggle is on. */
export function toAgbCreateDto(
  { version, enforceConsentFrom, agbText }: AgbFormValue,
  hasConsentDate: boolean,
): AgbRevisionCreateDto {
  return {
    version,
    agbText,
    ...(hasConsentDate && { enforceConsentFrom: `${enforceConsentFrom}T00:00:00` }),
  };
}

/** Form value of an existing revision. The datepicker keeps yyyy-MM-dd and formats it itself. */
export function toAgbFormValue(revision: AgbRevisionDto) {
  return {
    ...revision,
    version: revision.version ?? '',
    enforceConsentFrom: revision.enforceConsentFrom
      ? format(new Date(revision.enforceConsentFrom), 'yyyy-MM-dd')
      : '',
  };
}
