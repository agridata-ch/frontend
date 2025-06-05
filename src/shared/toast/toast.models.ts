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

export type Toast = {
  id: number;
  title: string;
  message: string;
  type: ToastType;
  state: ToastState;
};
