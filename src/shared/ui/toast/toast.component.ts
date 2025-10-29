import { CommonModule } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { faCheck, faClose } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { I18nPipe } from '@/shared/i18n';
import { Toast, ToastService, ToastState, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Provides the presentation and interaction logic for toast notifications. It subscribes to the
 * toast service’s reactive state, automatically dismisses new notifications after a set timeout,
 * and supports manual dismissal by the user.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, FontAwesomeModule, I18nPipe, ButtonComponent],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly closeIcon = faClose;
  readonly successIcon = faCheck;
  readonly errorIcon = faClose;
  readonly toasts = this.toastService.toasts;
  readonly ToastState = ToastState;
  readonly ToastType = ToastType;
  readonly ButtonVariants = ButtonVariants;

  constructor() {
    effect(() => {
      const list = this.toasts();
      if (list.length) {
        const newest = list[0];
        setTimeout(() => this.toastService.dismiss(newest.id), 7000);
      }
    });
  }

  getToastClasses(toast: Toast) {
    switch (toast.type) {
      case ToastType.Success:
        return 'bg-green-100 text-green-800';
      case ToastType.Error:
        return 'bg-red-100 text-red-700';
      case ToastType.Info:
        return 'bg-blue-100 text-blue-800';
      case ToastType.Warning:
        return 'bg-yellow-100 text-yellow-800';
    }
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }

  handleUndoAction(toast: Toast) {
    if (toast.undoAction) {
      toast.undoAction.callback();
    }
    this.toastService.dismiss(toast.id);
  }
}
