import { Meta, StoryObj } from '@storybook/angular';

import { AgridataTabsComponent } from './agridata-tabs.component';

const meta: Meta<AgridataTabsComponent> = {
  title: 'Shared/UI/Tabs',
  component: AgridataTabsComponent,
  tags: ['autodocs'],
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
      { id: 'history', label: 'History' },
    ],
    activeTabId: 'overview',
  },
};

export default meta;
type Story = StoryObj<AgridataTabsComponent>;

export const Default: Story = {};

export const SecondTabActive: Story = {
  args: { activeTabId: 'details' },
};

export const WithDisabledTab: Story = {
  args: {
    tabs: [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
      { id: 'locked', label: 'Locked', disabled: true },
    ],
    activeTabId: 'overview',
  },
};

export const ManyTabs: Story = {
  args: {
    tabs: [
      { id: 'a', label: 'General' },
      { id: 'b', label: 'Permissions' },
      { id: 'c', label: 'Notifications' },
      { id: 'd', label: 'Billing' },
      { id: 'e', label: 'Advanced' },
    ],
    activeTabId: 'a',
  },
};
