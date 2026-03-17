import { Meta, StoryObj } from '@storybook/angular';

import { AgridataToggleComponent } from './agridata-toggle.component';

const meta: Meta<AgridataToggleComponent> = {
  title: 'Shared/UI/Toggle',
  component: AgridataToggleComponent,
  tags: ['autodocs'],
  args: {
    checked: false,
    disabled: false,
    label: '',
    ariaLabel: 'Toggle',
  },
};

export default meta;
type Story = StoryObj<AgridataToggleComponent>;

export const Default: Story = {};

export const Checked: Story = {
  args: { checked: true },
};

export const WithLabel: Story = {
  args: { label: 'Enable notifications' },
};

export const CheckedWithLabel: Story = {
  args: { checked: true, label: 'Enable notifications' },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const DisabledChecked: Story = {
  args: { checked: true, disabled: true },
};

export const DisabledWithLabel: Story = {
  args: { disabled: true, label: 'Enable notifications' },
};
