export interface MultiSelectOption {
  readonly label: string;
  readonly value: number | string;
}

export interface MultiSelectCategory {
  readonly categoryLabel: string;
  readonly disabled?: boolean;
  readonly options: MultiSelectOption[];
}

export const ALL_OPTIONS_PREFIX = 'all-';
