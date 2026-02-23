import { Meta, StoryObj } from '@storybook/angular';

import { PopoverComponent } from './popover.component';

const meta: Meta<PopoverComponent> = {
  title: 'Shared/UI/Popover',
  component: PopoverComponent,
  tags: ['autodocs'],
  args: {
    class: '',
    isOpen: true,
  },
};

export default meta;
type Story = StoryObj<PopoverComponent>;

export const Open: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; height: 120px;">
        <app-popover [isOpen]="isOpen" [class]="class">
          <p class="p-3 text-sm">Popover content goes here.</p>
        </app-popover>
      </div>
    `,
  }),
};

export const Closed: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; height: 120px;">
        <app-popover [isOpen]="isOpen" [class]="class">
          <p class="p-3 text-sm">This content is hidden when closed.</p>
        </app-popover>
      </div>
    `,
  }),
  args: { isOpen: false },
};

export const WithCustomClass: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="position: relative; height: 120px;">
        <app-popover [isOpen]="isOpen" [class]="class">
          <p class="p-3 text-sm">Custom positioned popover.</p>
        </app-popover>
      </div>
    `,
  }),
  args: { class: 'right-0' },
};
