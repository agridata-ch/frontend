import { Injectable, Signal, signal } from '@angular/core';

import { Toast, ToastState, ToastType } from '@/shared/toast';

/**
 * Implements the logic for showing, dismissing, and clearing toast notifications. It assigns
 * unique IDs, tracks state transitions, and supports undo actions for reversible operations.
 * Toasts are managed as reactive signals to ensure responsive updates in the UI.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts: Signal<Toast[]> = this._toasts.asReadonly();

  show(
    title: string,
    message: string,
    type: Toast['type'] = ToastType.Info,
    undoAction?: Toast['undoAction'],
  ) {
    const id = ++this.counter;
    const toast: Toast = { id, title, message, type, state: ToastState.Enter, undoAction };
    this._toasts.update((list) => [toast, ...list]);
    return id;
  }

  dismiss(id: number) {
    this._toasts.update((list) =>
      list.map((toast) => (toast.id === id ? { ...toast, state: ToastState.Exit } : toast)),
    );
    this._toasts.update((list) => list.filter((toast) => toast.id !== id));
  }

  clear() {
    this._toasts.set([]);
  }
}
