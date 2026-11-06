import { FORM_COMPLETION_STRATEGIES, FormModel } from '@/shared/lib/form.helper';

import { availableLangs } from '../../../transloco.config';

/** Route param value of the AGB form that means "create a new revision" instead of "view one". */
export const AGB_NEW_ID = 'new';

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
