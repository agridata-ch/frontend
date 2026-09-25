import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export interface NavigationItem {
  label: string;
  icon: IconDefinition;
  route: string;
}
