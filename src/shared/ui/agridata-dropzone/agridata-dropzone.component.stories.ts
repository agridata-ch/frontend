import { Meta, StoryObj } from '@storybook/angular';

import { AgridataDropzoneComponent } from './agridata-dropzone.component';

const meta: Meta<AgridataDropzoneComponent> = {
  title: 'Shared/UI/AgridataDropzone',
  component: AgridataDropzoneComponent,
  tags: ['autodocs'],
  args: {
    accept: 'application/pdf',
    disabled: false,
    multiple: true,
  },
  render: (args) => ({
    props: args,
    template: `
      <app-agridata-dropzone [accept]="accept" [disabled]="disabled" [multiple]="multiple">
        <span class="font-medium">Drop PDF files here or click to browse</span>
        <span class="text-sm text-agridata-tertiary-text">Up to 5 files, 10MB each</span>
      </app-agridata-dropzone>
    `,
  }),
};

export default meta;
type Story = StoryObj<AgridataDropzoneComponent>;

export const Default: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
