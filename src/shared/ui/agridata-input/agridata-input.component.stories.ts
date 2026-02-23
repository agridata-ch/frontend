import { Meta, StoryObj } from '@storybook/angular';

import { AgridataInputComponent } from './agridata-input.component';

const meta: Meta<AgridataInputComponent> = {
  title: 'Shared/UI/Input',
  component: AgridataInputComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'number'],
    },
  },
  args: {
    disabled: false,
    hasError: false,
    id: 'input',
    maxCharacters: null,
    placeholder: 'Enter value...',
    type: 'text',
  },
};

export default meta;
type Story = StoryObj<AgridataInputComponent>;

export const Default: Story = {};

export const WithValue: Story = {
  args: { value: 'Hello World' },
};

export const WithPrefix: Story = {
  args: { inputPrefix: 'https://' },
};

export const WithCharacterLimit: Story = {
  args: { maxCharacters: 50, value: 'Some text' },
};

export const WithError: Story = {
  args: { hasError: true, value: 'Invalid input' },
};

export const Disabled: Story = {
  args: { disabled: true, value: 'Cannot edit this' },
};

export const NumberType: Story = {
  args: { type: 'number', placeholder: 'Enter a number...' },
};
