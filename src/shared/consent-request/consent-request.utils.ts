import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastType } from '@/shared/toast';

export function getToastTitle(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'consent-request-toast.title.GRANTED';
    case ConsentRequestStateEnum.Declined:
      return 'consent-request-toast.title.DECLINED';
    default:
      return 'consent-request-toast.title.DEFAULT';
  }
}

export function getToastMessage(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'consent-request-toast.message.GRANTED';
    case ConsentRequestStateEnum.Declined:
      return 'consent-request-toast.message.DECLINED';
    default:
      return 'consent-request-toast.message.DEFAULT';
  }
}

export function getToastType(stateCode: string) {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return ToastType.Success;
    case ConsentRequestStateEnum.Declined:
      return ToastType.Error;
    default:
      return ToastType.Info;
  }
}

export function getUndoAction(undoAction: () => void) {
  return {
    label: 'consent-request-toast.undo',
    callback: undoAction,
  };
}
