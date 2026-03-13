import { Meta, StoryObj } from '@storybook/angular';

import { AgridataAvatarComponent } from './agridata-avatar.component';
import { AvatarSize, AvatarSkin } from './agridata-avatar.model';

const meta: Meta<AgridataAvatarComponent> = {
  title: 'Shared/UI/Avatar',
  component: AgridataAvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: Object.values(AvatarSize),
    },
    skin: {
      control: 'select',
      options: Object.values(AvatarSkin),
    },
  },
  args: {
    name: 'Jane Doe',
    size: AvatarSize.LARGE,
    skin: AvatarSkin.DEFAULT,
  },
};

export default meta;
type Story = StoryObj<AgridataAvatarComponent>;

export const WithInitials: Story = {};

export const WithImage: Story = {
  args: {
    imageUrl: 'https://i.pravatar.cc/150?img=47',
  },
};

export const Small: Story = {
  args: { size: AvatarSize.SMALL },
};

export const Medium: Story = {
  args: { size: AvatarSize.MEDIUM },
};

export const Large: Story = {
  args: { size: AvatarSize.LARGE },
};

export const SkinColor: Story = {
  args: { skin: AvatarSkin.COLOR },
};

export const SkinLight: Story = {
  args: { skin: AvatarSkin.LIGHT },
};

export const SkinDark: Story = {
  args: { skin: AvatarSkin.DARK },
};

export const NoName: Story = {
  args: { name: undefined },
};
