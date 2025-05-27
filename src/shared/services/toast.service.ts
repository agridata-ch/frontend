import { Injectable, signal, Signal } from '@angular/core';

export enum ToastType {
  Info = 'info',
  Success = 'success',
  Error = 'error',
  Warning = 'warning',
}

export enum ToastState {
  Enter = 'enter',
  Visible = 'visible',
  Exit = 'exit',
}

export interface Toast {
  id: number;
  title: string;
  message: string;
  type: ToastType;
  state: ToastState;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private counter = 0;

  private readonly _toasts = signal<Toast[]>([]);

  readonly toasts: Signal<Toast[]> = this._toasts.asReadonly();

  show(title: string, message: string, type: Toast['type'] = ToastType.Info): number {
    const id = ++this.counter;
    const toast: Toast = { id, title, message, type, state: ToastState.Enter };
    this._toasts.update((list) => [toast, ...list]);
    return id;
  }

  dismiss(id: number): void {
    this._toasts.update((list) =>
      list.map((t) => (t.id === id ? { ...t, state: ToastState.Exit } : t)),
    );
    setTimeout(() => this._toasts.update((list) => list.filter((t) => t.id !== id)), 200);
  }

  clear(): void {
    this._toasts.set([]);
  }
}
