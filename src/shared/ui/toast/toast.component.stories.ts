import { Component, inject } from '@angular/core';
import { moduleMetadata, Meta, StoryObj, componentWrapperDecorator } from '@storybook/angular';

import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { ToastComponent } from '@/shared/ui/toast/toast.component';

/**
 * Wrapper component used only in Storybook to trigger toasts interactively
 * and demonstrate all toast variants.
 *
 * CommentLastReviewed: 2026-02-23
 */
@Component({
  selector: 'story-toast-wrapper',
  imports: [ToastComponent, ButtonComponent],
  template: `
    <div class="flex flex-wrap gap-2">
      <app-agridata-button
        [variant]="ButtonVariants.Primary"
        ariaLabel="Show info"
        (handleButtonClick)="showInfo()"
        >Info</app-agridata-button
      >
      <app-agridata-button
        [variant]="ButtonVariants.PrimaryAccept"
        ariaLabel="Show success"
        (handleButtonClick)="showSuccess()"
        >Success</app-agridata-button
      >
      <app-agridata-button
        [variant]="ButtonVariants.SecondaryReject"
        ariaLabel="Show error"
        (handleButtonClick)="showError()"
        >Error</app-agridata-button
      >
      <app-agridata-button
        [variant]="ButtonVariants.Secondary"
        ariaLabel="Show warning"
        (handleButtonClick)="showWarning()"
        >Warning</app-agridata-button
      >
      <app-agridata-button
        [variant]="ButtonVariants.Tertiary"
        ariaLabel="Show with undo"
        (handleButtonClick)="showWithUndo()"
        >With Undo</app-agridata-button
      >
    </div>
    <app-toast-container />
  `,
})
class ToastStoryWrapperComponent {
  protected readonly ButtonVariants = ButtonVariants;
  private readonly toastService = inject(ToastService);

  showError(): void {
    this.toastService.show('Error', 'Something went wrong. Please try again.', ToastType.Error);
  }

  showInfo(): void {
    this.toastService.show('Info', 'Your request has been received.', ToastType.Info);
  }

  showSuccess(): void {
    this.toastService.show('Success', 'Your changes have been saved.', ToastType.Success);
  }

  showWarning(): void {
    this.toastService.show('Warning', 'This action cannot be undone.', ToastType.Warning);
  }

  showWithUndo(): void {
    this.toastService.show('Deleted', 'Item has been removed.', ToastType.Info, {
      label: 'common.undo',
      callback: () =>
        this.toastService.show('Restored', 'Item has been restored.', ToastType.Success),
    });
  }
}

const meta: Meta<ToastStoryWrapperComponent> = {
  title: 'Shared/UI/Toast',
  component: ToastStoryWrapperComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ providers: [ToastService] }),
    componentWrapperDecorator(
      (story) => `<div style="min-height: 300px; padding: 1rem;">${story}</div>`,
    ),
  ],
};

export default meta;
type Story = StoryObj<ToastStoryWrapperComponent>;

export const Interactive: Story = {};
