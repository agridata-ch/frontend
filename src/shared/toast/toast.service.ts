import { Injectable, Signal, signal } from '@angular/core';

import { Toast, ToastState, ToastType } from '@/shared/toast';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts: Signal<Toast[]> = this._toasts.asReadonly();

  show(title: string, message: string, type: Toast['type'] = ToastType.Info) {
    const id = ++this.counter;
    const toast: Toast = { id, title, message, type, state: ToastState.Enter };
    this._toasts.update((list) => [toast, ...list]);
    return id;
  }

  dismiss(id: number) {
    this._toasts.update((list) =>
      list.map((toast) => (toast.id === id ? { ...toast, state: ToastState.Exit } : toast)),
    );
    setTimeout(() => this._toasts.update((list) => list.filter((toast) => toast.id !== id)), 200);
  }

  clear() {
    this._toasts.set([]);
  }
}
