export type AgridataRadioGroupValue = number | string | boolean;

export type AgridataRadioGroupOption = {
  readonly subtitle?: string;
  readonly title: string;
  readonly value: AgridataRadioGroupValue;
};
