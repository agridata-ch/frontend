import { Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Toast, ToastService, ToastState, ToastType } from '@shared/services/toast.service';
import { faClose, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-toast-container',
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css',
})
export class ToastComponent {
  private readonly toastService = inject(ToastService);
  readonly closeIcon = faClose;
  readonly successIcon = faCheck;
  readonly errorIcon = faClose;
  readonly toasts = this.toastService.toasts;
  readonly ToastState = ToastState;
  readonly ToastType = ToastType;

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
}
