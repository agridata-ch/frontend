import { Meta, StoryObj } from '@storybook/angular';

import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from './agridata-badge.component';

const meta: Meta<AgridataBadgeComponent> = {
  title: 'Shared/UI/Badge',
  component: AgridataBadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(BadgeSize),
    },
    variant: {
      control: 'select',
      options: Object.values(BadgeVariant),
    },
  },
  args: {
    size: BadgeSize.MD,
    text: 'Label',
  },
};

export default meta;
type Story = StoryObj<AgridataBadgeComponent>;

export const Default: Story = {
  args: { variant: BadgeVariant.DEFAULT },
};

export const Success: Story = {
  args: { variant: BadgeVariant.SUCCESS },
};

export const Warning: Story = {
  args: { variant: BadgeVariant.WARNING },
};

export const ErrorBadge: Story = {
  args: { variant: BadgeVariant.ERROR },
};

export const Info: Story = {
  args: { variant: BadgeVariant.INFO },
};

export const Light: Story = {
  args: { variant: BadgeVariant.LIGHT },
};

export const Small: Story = {
  args: { variant: BadgeVariant.DEFAULT, size: BadgeSize.SM },
};

export const Large: Story = {
  args: { variant: BadgeVariant.DEFAULT, size: BadgeSize.LG },
};
