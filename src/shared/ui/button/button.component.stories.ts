import {
  faBars,
  faArrowRight,
  faDownload,
  faFilePdf,
  faPlus,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent, IconDefinition } from '@fortawesome/angular-fontawesome';
import { moduleMetadata, Meta, StoryObj } from '@storybook/angular';

import { ButtonComponent } from './button.component';
import { ButtonVariants, HrefTarget, IconPosition } from './button.model';

const sharedTemplate = (content: string): string => `
  <app-agridata-button
    [variant]="variant"
    [type]="type"
    [disabled]="disabled"
    [tabindex]="tabindex"
    [ariaLabel]="ariaLabel"
    [selected]="selected"
    [loading]="loading"
    [href]="href"
    [target]="target"
  >${content}</app-agridata-button>
`;

const textStory = (label: string, args: StoryObj<ButtonComponent>['args']): Story => ({
  render: (storyArgs) => ({
    props: storyArgs,
    template: sharedTemplate(label),
  }),
  args,
});

const iconStory = (
  icon: unknown,
  ariaLabel: string,
  args: StoryObj<ButtonComponent>['args'],
): Story => ({
  decorators: [moduleMetadata({ imports: [FaIconComponent] })],
  render: (storyArgs) => ({
    props: { ...storyArgs, _icon: icon },
    template: sharedTemplate('<fa-icon [icon]="_icon"></fa-icon>'),
  }),
  args: { ariaLabel, ...args },
});

const iconLinkStory = (
  icon: IconDefinition,
  label: string,
  args: StoryObj<ButtonComponent>['args'],
): Story => ({
  render: (storyArgs) => ({
    props: storyArgs,
    template: `
      <app-agridata-button
        [variant]="variant"
        [disabled]="disabled"
        [loading]="loading"
        [icon]="icon"
        [iconPosition]="iconPosition"
        [ariaLabel]="ariaLabel"
      >${label}</app-agridata-button>
    `,
  }),
  args: { icon, ariaLabel: label, ...args },
});

const meta: Meta<ButtonComponent> = {
  title: 'Shared/UI/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
    },
    target: {
      control: 'select',
      options: Object.values(HrefTarget),
    },
    type: {
      control: 'select',
      options: ['button', 'submit', 'reset'],
    },
    variant: {
      control: 'select',
      options: Object.values(ButtonVariants),
    },
  },
  args: {
    disabled: false,
    href: '',
    loading: false,
    selected: false,
    tabindex: 0,
    target: HrefTarget.Self,
    type: 'button',
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary = textStory('Save', { variant: ButtonVariants.Primary, ariaLabel: 'Save' });

export const PrimaryAccept = textStory('Accept', {
  variant: ButtonVariants.PrimaryAccept,
  ariaLabel: 'Accept',
});

export const PrimaryCms = textStory('Publish', {
  variant: ButtonVariants.PrimaryCms,
  ariaLabel: 'Publish',
});

export const Secondary = textStory('Cancel', {
  variant: ButtonVariants.Secondary,
  ariaLabel: 'Cancel',
});

export const SecondaryReject = textStory('Reject', {
  variant: ButtonVariants.SecondaryReject,
  ariaLabel: 'Reject',
});

export const SecondaryCms = textStory('Discard', {
  variant: ButtonVariants.SecondaryCms,
  ariaLabel: 'Discard',
});

export const Tertiary = textStory('Learn more', {
  variant: ButtonVariants.Tertiary,
  ariaLabel: 'Learn more',
});

export const Icon = iconStory(faPlus, 'Add item', { variant: ButtonVariants.Icon });

export const IconOutline = iconStory(faArrowRight, 'Go forward', {
  variant: ButtonVariants.IconOutline,
});

export const Link = textStory('Read more', {
  variant: ButtonVariants.Link,
  ariaLabel: 'Read more',
});

export const IconLink = iconLinkStory(faFilePdf, 'Contract.pdf', {
  variant: ButtonVariants.IconLink,
  iconPosition: IconPosition.Left,
});

export const IconLinkRight = iconLinkStory(faDownload, 'Download', {
  variant: ButtonVariants.IconLink,
  iconPosition: IconPosition.Right,
});

export const IconLinkLoading = iconLinkStory(faFilePdf, 'Contract.pdf', {
  variant: ButtonVariants.IconLink,
  iconPosition: IconPosition.Left,
  loading: true,
});

export const Filter = iconStory(faBars, 'Filter', {
  variant: ButtonVariants.Filter,
  selected: false,
});

export const FilterSelected = iconStory(faBars, 'Filter active', {
  variant: ButtonVariants.Filter,
  selected: true,
});

export const Disabled = textStory('Unavailable', {
  variant: ButtonVariants.Primary,
  ariaLabel: 'Unavailable',
  disabled: true,
});

export const Loading = textStory('Saving...', {
  variant: ButtonVariants.Primary,
  ariaLabel: 'Saving',
  loading: true,
});
