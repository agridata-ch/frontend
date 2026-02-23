import { FormControl } from '@angular/forms';
import { moduleMetadata, Meta, StoryObj } from '@storybook/angular';

import { FormControlComponent } from './form-control.component';
import { ControlTypes } from './form-control.model';

const meta: Meta<FormControlComponent> = {
  title: 'Shared/UI/FormControl',
  component: FormControlComponent,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [] })],
  argTypes: {
    controlType: {
      control: 'select',
      options: Object.values(ControlTypes),
    },
    type: {
      control: 'select',
      options: ['text', 'number'],
    },
  },
  args: {
    disabled: false,
    helperText: '',
    id: 'field',
    label: 'Label',
    placeholder: 'Enter value...',
  },
};

export default meta;
type Story = StoryObj<FormControlComponent>;

export const TextInput: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl('') },
    template: `
      <app-form-control
        [control]="control"
        [controlType]="controlType"
        [label]="label"
        [id]="id"
        [placeholder]="placeholder"
        [disabled]="disabled"
        [helperText]="helperText"
      />
    `,
  }),
  args: {
    controlType: ControlTypes.INPUT,
    label: 'Full name',
    placeholder: 'Enter your name...',
  },
};

export const TextInputWithHelperText: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl('') },
    template: `
      <app-form-control
        [control]="control"
        [controlType]="controlType"
        [label]="label"
        [id]="id"
        [placeholder]="placeholder"
        [helperText]="helperText"
      />
    `,
  }),
  args: {
    controlType: ControlTypes.INPUT,
    label: 'Email',
    placeholder: 'your@email.com',
    helperText: 'We will never share your email.',
  },
};

export const SelectInput: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(null),
      options: [
        { value: 1, label: 'Option A' },
        { value: 2, label: 'Option B' },
        { value: 3, label: 'Option C' },
      ],
    },
    template: `
      <div style="min-height: 250px">
        <app-form-control
          [control]="control"
          [controlType]="controlType"
          [label]="label"
          [id]="id"
          [options]="options"
          [placeholder]="placeholder"
        />
      </div>
    `,
  }),
  args: {
    controlType: ControlTypes.SELECT,
    label: 'Category',
    placeholder: 'Select a category...',
  },
};

export const MultiSelectInput: Story = {
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl([]),
      categories: [
        {
          categoryLabel: 'Fruits',
          options: [
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
          ],
        },
        {
          categoryLabel: 'Vegetables',
          options: [
            { value: 'carrot', label: 'Carrot' },
            { value: 'broccoli', label: 'Broccoli' },
          ],
        },
      ],
    },
    template: `
      <div style="min-height: 350px">
        <app-form-control
          [control]="control"
          [controlType]="controlType"
          [label]="label"
          [id]="id"
          [categories]="categories"
          [placeholder]="placeholder"
        />
      </div>
    `,
  }),
  args: {
    controlType: ControlTypes.MULTI_SELECT,
    label: 'Interests',
    placeholder: 'Select interests...',
  },
};

export const TextareaInput: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl('') },
    template: `
      <app-form-control
        [control]="control"
        [controlType]="controlType"
        [label]="label"
        [id]="id"
        [placeholder]="placeholder"
      />
    `,
  }),
  args: {
    controlType: ControlTypes.TEXT_AREA,
    label: 'Message',
    placeholder: 'Write your message...',
  },
};

export const Disabled: Story = {
  render: (args) => ({
    props: { ...args, control: new FormControl('Some value') },
    template: `
      <app-form-control
        [control]="control"
        [controlType]="controlType"
        [label]="label"
        [id]="id"
        [disabled]="disabled"
      />
    `,
  }),
  args: {
    controlType: ControlTypes.INPUT,
    label: 'Read only field',
    disabled: true,
  },
};
