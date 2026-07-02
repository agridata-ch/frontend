import { Meta, StoryObj } from '@storybook/angular';

import { ProgressBarComponent } from './progress-bar.component';

const meta: Meta<ProgressBarComponent> = {
  title: 'Shared/UI/ProgressBar',
  component: ProgressBarComponent,
  tags: ['autodocs'],
  args: {
    value: 40,
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<ProgressBarComponent>;

export const Default: Story = {};

export const Empty: Story = {
  args: { value: 0 },
};

export const Complete: Story = {
  args: { value: 100 },
};
