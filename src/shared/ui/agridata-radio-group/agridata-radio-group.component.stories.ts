import { Meta, StoryObj, componentWrapperDecorator } from '@storybook/angular';

import { AgridataRadioGroupComponent } from './agridata-radio-group.component';
import { AgridataRadioGroupOption } from './agridata-radio-group.model';

const SAMPLE_OPTIONS: AgridataRadioGroupOption[] = [
  { title: 'Standard', subtitle: 'Basic plan with core features', value: 'standard' },
  { title: 'Professional', subtitle: 'Advanced features for power users', value: 'professional' },
  { title: 'Enterprise', subtitle: 'Full access with dedicated support', value: 'enterprise' },
];

const meta: Meta<AgridataRadioGroupComponent> = {
  title: 'Shared/UI/RadioGroup',
  component: AgridataRadioGroupComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="max-width: 480px; padding: 1rem;">${story}</div>`,
    ),
  ],
  tags: ['autodocs'],
  args: {
    options: SAMPLE_OPTIONS,
    disabled: false,
    name: 'agridata-radio-group',
    ariaLabel: '',
  },
};

export default meta;
type Story = StoryObj<AgridataRadioGroupComponent>;

export const Default: Story = {};

export const WithPreselectedValue: Story = {
  args: { value: 'professional' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'standard' },
};

export const TwoOptions: Story = {
  args: {
    options: [
      { title: 'Yes', subtitle: 'Enable this feature', value: 'yes' },
      { title: 'No', subtitle: 'Keep feature disabled', value: 'no' },
    ],
  },
};

export const TwoOptionsDisabled: Story = {
  args: {
    options: [
      { title: 'Yes', subtitle: 'Enable this feature', value: 'yes' },
      { title: 'No', subtitle: 'Keep feature disabled', value: 'no' },
    ],
    value: 'no',
    disabled: true,
  },
};
