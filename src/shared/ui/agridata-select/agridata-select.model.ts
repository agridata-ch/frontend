export interface SelectOption {
  value: number | string | null;
  label: string;
}

export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}
