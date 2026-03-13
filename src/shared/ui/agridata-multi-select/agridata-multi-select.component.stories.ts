import { Meta, StoryObj, componentWrapperDecorator } from '@storybook/angular';

import { AgridataMultiSelectComponent } from './agridata-multi-select.component';
import { MultiSelectCategory } from './agridata-multi-select.model';

const SAMPLE_CATEGORIES: MultiSelectCategory[] = [
  {
    categoryLabel: 'Fruits',
    options: [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana' },
      { value: 'cherry', label: 'Cherry' },
    ],
  },
  {
    categoryLabel: 'Vegetables',
    options: [
      { value: 'carrot', label: 'Carrot' },
      { value: 'broccoli', label: 'Broccoli' },
      { value: 'spinach', label: 'Spinach' },
    ],
  },
];

const meta: Meta<AgridataMultiSelectComponent> = {
  title: 'Shared/UI/MultiSelect',
  component: AgridataMultiSelectComponent,
  decorators: [
    componentWrapperDecorator(
      (story) => `<div style="min-height: 300px; padding: 1rem;">${story}</div>`,
    ),
  ],
  tags: ['autodocs'],
  args: {
    categories: SAMPLE_CATEGORIES,
    disabled: false,
    placeholder: 'Select items...',
  },
};

export default meta;
type Story = StoryObj<AgridataMultiSelectComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};

export const SingleCategory: Story = {
  args: {
    categories: [SAMPLE_CATEGORIES[0]],
  },
};
