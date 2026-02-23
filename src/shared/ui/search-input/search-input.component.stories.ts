import { Meta, StoryObj } from '@storybook/angular';

import { SearchInputComponent } from './search-input.component';

const meta: Meta<SearchInputComponent> = {
  title: 'Shared/UI/SearchInput',
  component: SearchInputComponent,
  tags: ['autodocs'],
  args: {
    debounceTime: 300,
    isLoading: false,
    minSearchLength: 3,
  },
};

export default meta;
type Story = StoryObj<SearchInputComponent>;

export const Default: Story = {};

export const Loading: Story = {
  args: { isLoading: true },
};

export const LowMinLength: Story = {
  args: { minSearchLength: 1 },
};
