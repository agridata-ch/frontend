import { signal } from '@angular/core';
import { moduleMetadata, Meta, StoryObj, componentWrapperDecorator } from '@storybook/angular';

import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

import { ModalComponent } from './modal.component';

type Story = StoryObj<ModalComponent>;

const withTrigger = (bodyTemplate: string, args: Story['args'] = {}): Story => ({
  render: (storyArgs) => {
    const open = signal(false);
    return {
      props: { ...storyArgs, open, ButtonVariants, toggle: () => open.set(true) },
      template: `
        <app-agridata-button [variant]="ButtonVariants.Primary" ariaLabel="Open modal" (handleClick)="toggle()">Open modal</app-agridata-button>
        <app-modal [title]="title" [(open)]="open" [showCloseButton]="showCloseButton">
          ${bodyTemplate}
        </app-modal>
      `,
    };
  },
  args,
});

const meta: Meta<ModalComponent> = {
  title: 'Shared/UI/Modal',
  component: ModalComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [ButtonComponent] }),
    componentWrapperDecorator(
      (story) => `<div style="min-height: 500px; padding: 1rem;">${story}</div>`,
    ),
  ],
  args: {
    showCloseButton: true,
    title: 'Modal Title',
  },
};

export default meta;

export const Default: Story = withTrigger(
  '<p>This is the modal body content. You can place any content here.</p>',
);

export const WithActions: Story = withTrigger(
  `<p>Are you sure you want to continue?</p>
   <div class="flex gap-2 mt-4">
     <app-agridata-button [variant]="ButtonVariants.Primary" ariaLabel="Confirm">Confirm</app-agridata-button>
     <app-agridata-button [variant]="ButtonVariants.Secondary" ariaLabel="Cancel">Cancel</app-agridata-button>
   </div>`,
);

export const WithoutCloseButton: Story = withTrigger(
  '<p>This modal cannot be closed with the X button.</p>',
  { showCloseButton: false },
);
