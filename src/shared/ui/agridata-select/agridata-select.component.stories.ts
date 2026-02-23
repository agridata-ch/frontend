import { Meta, StoryObj, componentWrapperDecorator } from '@storybook/angular';

import { AgridataSelectComponent } from './agridata-select.component';
import { SelectOption } from './agridata-select.model';

const SAMPLE_OPTIONS: SelectOption[] = [
  { value: 1, label: 'Option One' },
  { value: 2, label: 'Option Two' },
  { value: 3, label: 'Option Three' },
  { value: 4, label: 'Option Four' },
];

const meta: Meta<AgridataSelectComponent> = {
  title: 'Shared/UI/Select',
  component: AgridataSelectComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="min-height: 300px; padding: 1rem;">${story}</div>`,
    ),
  ],
  tags: ['autodocs'],
  args: {
    disabled: false,
    hasError: false,
    options: SAMPLE_OPTIONS,
    placeholder: 'Select an option...',
  },
};

export default meta;
type Story = StoryObj<AgridataSelectComponent>;

export const Default: Story = {};

export const WithSelection: Story = {
  args: { selectedOption: 2 },
};

export const WithPlaceholder: Story = {
  args: { placeholder: 'Please choose...' },
};

export const WithError: Story = {
  args: { hasError: true },
};

export const Disabled: Story = {
  args: { disabled: true, selectedOption: 1 },
};
