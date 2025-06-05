import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ToastType } from '@/shared/toast';

export function getToastTitle(stateCode: string): string {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return 'Einwilligung erteilt';
    case ConsentRequestStateEnum.Declined:
      return 'Einwilligung abgelehnt';
    default:
      return 'Antrag aktualisiert';
  }
}

export function getToastMessage(stateCode: string, requestName?: string): string {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich eingewilligt.`;
    case ConsentRequestStateEnum.Declined:
      return `Du hast den Antrag ${requestName ?? ''} erfolgreich abgelehnt.`;
    default:
      return 'Der Antrag wurde aktualisiert.';
  }
}

export function getToastType(stateCode: string): ToastType {
  switch (stateCode) {
    case ConsentRequestStateEnum.Granted:
      return ToastType.Success;
    case ConsentRequestStateEnum.Declined:
      return ToastType.Error;
    default:
      return ToastType.Info;
  }
}
