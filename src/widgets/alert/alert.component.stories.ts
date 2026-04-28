import { Meta, StoryObj } from '@storybook/angular';

import { AlertComponent } from './alert.component';
import { AlertType } from './alert.model';

const meta: Meta<AlertComponent> = {
  title: 'Widgets/Alert',
  component: AlertComponent,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: Object.values(AlertType),
    },
  },
  args: {
    showCloseButton: false,
    type: AlertType.INFO,
  },
};

export default meta;
type Story = StoryObj<AlertComponent>;

const story = (args: Story['args']): Story => ({
  render: (storyArgs) => ({
    props: storyArgs,
    template: `<app-alert [type]="type" [additionalInfo]="additionalInfo" [message]="message" [title]="title" [showCloseButton]="showCloseButton"></app-alert>`,
  }),
  args,
});

export const Info = story({
  type: AlertType.INFO,
  message: 'This is an informational message.',
});

export const Success = story({
  type: AlertType.SUCCESS,
  message: 'Your changes have been saved successfully.',
  additionalInfo: '10.01.2026 14:30',
});

export const Warning = story({
  type: AlertType.WARNING,
  title: 'Missing UID',
  message:
    'Your UID is currently missing. Please contact support to resolve this issue and ensure a smooth experience on agridata.ch.',
});

export const Error = story({
  type: AlertType.ERROR,
  message: 'An error occurred. Please try again.',
});

export const WithTitle = story({
  type: AlertType.INFO,
  title: 'Heads up',
  message: 'This alert includes an optional title for additional context.',
});

export const Neutral = story({
  type: AlertType.NEUTRAL,
  message: 'No action required at this time.',
  showCloseButton: true,
});

export const WithCloseButton = story({
  type: AlertType.INFO,
  message:
    'This alert includes a close button. Click the button to dismiss the alert and trigger any associated close logic.',
  showCloseButton: true,
});
