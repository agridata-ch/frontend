import { Meta, StoryObj } from '@storybook/angular';

import { AgridataTextareaComponent } from './agridata-textarea.component';

const meta: Meta<AgridataTextareaComponent> = {
  title: 'Shared/UI/Textarea',
  component: AgridataTextareaComponent,
  tags: ['autodocs'],
  args: {
    disabled: false,
    hasError: false,
    id: 'textarea',
    maxCharacters: null,
    placeholder: 'Enter text...',
  },
};

export default meta;
type Story = StoryObj<AgridataTextareaComponent>;

export const Default: Story = {};

export const WithCharacterLimit: Story = {
  args: { maxCharacters: 200 },
};

export const WithError: Story = {
  args: { hasError: true },
};

export const Disabled: Story = {
  args: { disabled: true },
};
