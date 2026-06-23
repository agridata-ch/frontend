import { NotificationService } from '@/entities/api/notification.service';
import { InboxEntryDto, MarkAsReadRequestDto, TargetTypeCodeEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { ToastService, ToastType } from '@/shared/toast';

export function getNotificationRoute(
  notification: InboxEntryDto,
  authService: Pick<AuthService, 'isConsumer' | 'isDataProvider' | 'isAdmin'>,
): string | null {
  const route = getRouteForTarget(notification.targetType, notification.targetId, authService);
  if (!route && notification.targetType) {
    console.warn(
      'No route found for notification target:',
      notification.targetType,
      notification.targetId,
    );
  }
  return route;
}

export function getRouteForTarget(
  targetType: TargetTypeCodeEnum | undefined,
  targetId: string | undefined,
  authService: Pick<AuthService, 'isConsumer' | 'isDataProvider' | 'isAdmin'>,
): string | null {
  if (!targetId) return null;

  if (targetType === TargetTypeCodeEnum.DataRequest) {
    if (authService.isConsumer()) {
      return `/${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/${targetId}`;
    }
    if (authService.isDataProvider()) {
      return `/${ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH}/${targetId}`;
    }
    if (authService.isAdmin()) {
      return `/${ROUTE_PATHS.ADMIN_PATH}/${targetId}`;
    }
  }

  return null;
}

export function toggleReadStatus(
  notification: InboxEntryDto,
  notificationService: Pick<NotificationService, 'toggleReadStatus' | 'notifyMutation'>,
  toastService: Pick<ToastService, 'show'>,
  i18nService: Pick<I18nService, 'translate'>,
): Promise<void> {
  const errorKey = notification.isRead ? 'markAsUnread' : 'markAsRead';
  return notificationService
    .toggleReadStatus(notification)
    .then(() => notificationService.notifyMutation())
    .catch(() => {
      toastService.show(
        i18nService.translate(`notifications.${errorKey}.error.title`),
        i18nService.translate(`notifications.${errorKey}.error.message`),
        ToastType.Error,
      );
    });
}

export function markAllAsRead(
  notifications: InboxEntryDto[],
  notificationService: Pick<NotificationService, 'markAllAsRead' | 'notifyMutation'>,
  toastService: Pick<ToastService, 'show'>,
  i18nService: Pick<I18nService, 'translate'>,
): Promise<void> {
  const inbox: MarkAsReadRequestDto = {
    inboxIds: notifications.filter((n) => !n.isRead && n.id).map((n) => n.id!) || [],
  };
  return notificationService
    .markAllAsRead(inbox)
    .then(() => {
      notificationService.notifyMutation();
      toastService.show(
        i18nService.translate('notifications.markAllAsRead.success.title'),
        i18nService.translate('notifications.markAllAsRead.success.message'),
        ToastType.Success,
      );
    })
    .catch((error: Error) => {
      toastService.show(
        i18nService.translate('notifications.markAllAsRead.error.title'),
        i18nService.translate('notifications.markAllAsRead.error.message', {
          error: error.message,
        }),
        ToastType.Error,
      );
    });
}
