import { FORM_COMPLETION_STRATEGIES, FormModel } from '@/shared/lib/form.helper';

export enum FORM_GROUP_NAMES {
  COMPLETION = 'completion',
  CONSUMER = 'consumer',
  CONTRACT = 'contract',
  DATA_PRODUCT = 'dataProduct',
  PREVIEW = 'preview',
  PRODUCER = 'producer',
  REQUEST = 'request',
}

export type DataRequestFormModel = Required<FormModel<FORM_GROUP_NAMES>>;

export const DATA_REQUEST_NEW_ID = 'new';

export const dataRequestFormsModel: DataRequestFormModel[] = [
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
      { name: 'advantages' },
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
  {
    formGroupName: FORM_GROUP_NAMES.COMPLETION,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
  },
];

export const dataRequestProviderFormsModel: DataRequestFormModel[] = [
  {
    formGroupName: FORM_GROUP_NAMES.PREVIEW,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.ALWAYS_COMPLETE,
  },
  {
    formGroupName: FORM_GROUP_NAMES.CONTRACT,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
  },
  {
    formGroupName: FORM_GROUP_NAMES.COMPLETION,
    fields: [],
    completionStrategy: FORM_COMPLETION_STRATEGIES.EXTERNAL_DEPENDENCY,
  },
];
