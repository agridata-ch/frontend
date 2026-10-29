import { FormControl } from '@angular/forms';
import { componentWrapperDecorator, Meta, StoryObj } from '@storybook/angular';
import { format } from 'date-fns';
import { expect, userEvent, within } from 'storybook/test';

import { AgridataDatepickerComponent } from './agridata-datepicker.component';

interface DatepickerArgs {
  disabled: boolean;
  hasError: boolean;
  id: string;
  isViewMode: boolean;
  min: string | null;
  placeholder: string;
  /** Initial control value as yyyy-MM-dd. */
  initialValue: string;
}

const today = format(new Date(), 'yyyy-MM-dd');

const meta: Meta<DatepickerArgs> = {
  title: 'Shared/UI/Datepicker',
  component: AgridataDatepickerComponent,
  decorators: [
    componentWrapperDecorator((story) => `<div class="w-1/4 min-w-72 p-1">${story}</div>`),
  ],
  // The docs canvas clips overflow, so reserve room for the calendar popup there.
  parameters: { docs: { story: { height: '26rem' } } },
  tags: ['autodocs'],
  argTypes: {
    min: { control: 'text', description: 'Earliest selectable day as yyyy-MM-dd' },
    initialValue: { control: 'text', description: 'Initial value as yyyy-MM-dd' },
  },
  args: {
    disabled: false,
    hasError: false,
    id: 'datepicker',
    isViewMode: false,
    min: null,
    placeholder: 'TT.MM.JJJJ',
    initialValue: '',
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl({ value: args.initialValue, disabled: args.disabled }),
    },
    template: `
      <app-agridata-datepicker
        [control]="control"
        [disabled]="disabled"
        [hasError]="hasError"
        [id]="id"
        [isViewMode]="isViewMode"
        [min]="min"
        [placeholder]="placeholder"
      />
    `,
  }),
};

export default meta;
type Story = StoryObj<DatepickerArgs>;

export const Default: Story = {};

export const Open: Story = {
  // Reserve room for the absolutely positioned calendar popup.
  decorators: [
    componentWrapperDecorator((story) => `<div style="min-height: 26rem">${story}</div>`),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Only open when closed, so replaying the story does not close the popup again.
    const closedToggle = canvas.queryByRole('button', { expanded: false });
    if (closedToggle) {
      await userEvent.click(closedToggle);
    }
    await expect(canvas.getByRole('button', { expanded: true })).toBeInTheDocument();
  },
};

export const WithValue: Story = {
  args: { initialValue: today },
};

export const WithMinDate: Story = {
  args: { min: today },
};

export const WithError: Story = {
  args: { hasError: true },
};

export const Disabled: Story = {
  args: { disabled: true, initialValue: today },
};

export const ViewMode: Story = {
  // The border comes from the surrounding box in the app (see admin-agb-form), not from the field.
  decorators: [
    componentWrapperDecorator(
      (story) => `<div class="rounded-md border border-agridata-stroke px-4 py-3">${story}</div>`,
    ),
  ],
  args: { isViewMode: true, initialValue: today },
};
