import { Meta, StoryObj } from '@storybook/angular';

import { EmptyStateComponent } from './empty-state.component';

const meta: Meta<EmptyStateComponent> = {
  title: 'Shared/UI/EmptyState',
  component: EmptyStateComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<EmptyStateComponent>;

export const Default: Story = {
  args: {
    title: 'No results found',
    message: 'There are no items matching your criteria.',
  },
};

export const WithAdditionalInfo: Story = {
  args: {
    title: 'No data available',
    message: 'This section has no entries yet.',
    additionalInfo: 'Contact your administrator to add data.',
  },
};

export const TitleOnly: Story = {
  args: {
    title: 'Nothing here',
  },
};
