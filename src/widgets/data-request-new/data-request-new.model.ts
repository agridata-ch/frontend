export enum FORM_GROUP_NAMES {
  CONSUMER = 'consumer',
  REQUEST = 'request',
  PREVIEW = 'preview',
  PRODUCER = 'producer',
  CONTRACT = 'contract',
  COMPLETION = 'completion',
}

export enum FORM_COMPLETION_STRATEGIES {
  ALWAYS_COMPLETE = 'always-complete',
  FORM_VALIDATION = 'form-validation',
  EXTERNAL_DEPENDENCY = 'external-dependency',
}

export type FormField = {
  readonly name: string;
  readonly i18nDefaultValue?: string;
};

export interface FormModel {
  readonly formGroupName: FORM_GROUP_NAMES;
  readonly fields: readonly FormField[];
  readonly completionStrategy: FORM_COMPLETION_STRATEGIES;
}

export const dataRequestFormsModel: FormModel[] = [
  {
    formGroupName: FORM_GROUP_NAMES.CONSUMER,
    fields: [
      { name: 'dataConsumerDisplayName' },
      { name: 'dataConsumerCity' },
      { name: 'dataConsumerZip' },
      { name: 'dataConsumerStreet' },
      { name: 'dataConsumerCountry' },
      { name: 'contactPhoneNumber' },
      { name: 'contactEmailAddress' },
    ],
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
  },
  {
    formGroupName: FORM_GROUP_NAMES.REQUEST,
    fields: [
      { name: 'products' },
      { name: 'title.de', i18nDefaultValue: 'data-request.form.request.title.de.placeholder' },
      { name: 'title.fr', i18nDefaultValue: 'data-request.form.request.title.fr.placeholder' },
      { name: 'title.it', i18nDefaultValue: 'data-request.form.request.title.it.placeholder' },
      {
        name: 'description.de',
        i18nDefaultValue: 'data-request.form.request.description.de.placeholder',
      },
      {
        name: 'description.fr',
        i18nDefaultValue: 'data-request.form.request.description.fr.placeholder',
      },
      {
        name: 'description.it',
        i18nDefaultValue: 'data-request.form.request.description.it.placeholder',
      },
      {
        name: 'purpose.de',
        i18nDefaultValue: 'data-request.form.request.purpose.de.placeholder',
      },
      {
        name: 'purpose.fr',
        i18nDefaultValue: 'data-request.form.request.purpose.fr.placeholder',
      },
      {
        name: 'purpose.it',
        i18nDefaultValue: 'data-request.form.request.purpose.it.placeholder',
      },
    ],
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
  },
  {
    formGroupName: FORM_GROUP_NAMES.PREVIEW,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
  },
  {
    formGroupName: FORM_GROUP_NAMES.PRODUCER,
    fields: [{ name: 'targetGroup' }],
    completionStrategy: FORM_COMPLETION_STRATEGIES.FORM_VALIDATION,
  },
  {
    formGroupName: FORM_GROUP_NAMES.CONTRACT,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
  },
  // TODO: Re-enable these steps when their implementation is ready DIGIB2-542
  // {
  //   formGroupName: FORM_GROUP_NAMES.COMPLETION,
  //   fields: [],
  //   completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
  // },
];
