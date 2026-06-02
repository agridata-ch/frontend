import { TargetTypeCodeEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import {
  createMockAuthService,
  createMockI18nService,
  createMockNotificationService,
  createMockToastService,
} from '@/shared/testing/mocks';
import { ToastType } from '@/shared/toast';

import {
  getNotificationRoute,
  getRouteForTarget,
  markAllAsRead,
  toggleReadStatus,
} from './notification.util';

describe('notification.util', () => {
  describe('getRouteForTarget', () => {
    let authService: ReturnType<typeof createMockAuthService>;

    beforeEach(() => {
      authService = createMockAuthService();
    });

    it('should return null when targetId is undefined', () => {
      const result = getRouteForTarget(TargetTypeCodeEnum.DataRequest, undefined, authService);
      expect(result).toBeNull();
    });

    it('should return consumer route for DataRequest when user is consumer', () => {
      authService.__testSignals.isConsumer.set(true);
      const result = getRouteForTarget(TargetTypeCodeEnum.DataRequest, 'abc', authService);
      expect(result).toBe(`/${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/abc`);
    });

    it('should return provider route for DataRequest when user is data provider', () => {
      authService.__testSignals.isDataProvider.set(true);
      const result = getRouteForTarget(TargetTypeCodeEnum.DataRequest, 'abc', authService);
      expect(result).toBe(`/${ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH}/abc`);
    });

    it('should return admin route for DataRequest when user is admin', () => {
      authService.__testSignals.isAdmin.set(true);
      const result = getRouteForTarget(TargetTypeCodeEnum.DataRequest, 'abc', authService);
      expect(result).toBe(`/${ROUTE_PATHS.ADMIN_PATH}/abc`);
    });

    it('should return null for DataRequest when user has no matching role', () => {
      const result = getRouteForTarget(TargetTypeCodeEnum.DataRequest, 'abc', authService);
      expect(result).toBeNull();
    });

    it('should return null for unknown targetType', () => {
      const result = getRouteForTarget(undefined, 'abc', authService);
      expect(result).toBeNull();
    });
  });

  describe('getNotificationRoute', () => {
    let authService: ReturnType<typeof createMockAuthService>;

    beforeEach(() => {
      authService = createMockAuthService();
    });

    it('should return null when notification has no targetId', () => {
      const result = getNotificationRoute({ id: '1', isRead: false }, authService);
      expect(result).toBeNull();
    });

    it('should return consumer route when user is consumer', () => {
      authService.__testSignals.isConsumer.set(true);
      const result = getNotificationRoute(
        {
          id: '1',
          targetType: TargetTypeCodeEnum.DataRequest,
          targetId: 'target-1',
          isRead: false,
        },
        authService,
      );
      expect(result).toBe(`/${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/target-1`);
    });

    it('should return null when targetType has no matching role', () => {
      const result = getNotificationRoute(
        {
          id: '1',
          targetType: TargetTypeCodeEnum.DataRequest,
          targetId: 'target-1',
          isRead: false,
        },
        authService,
      );
      expect(result).toBeNull();
    });
  });

  describe('toggleReadStatus', () => {
    let notificationService: ReturnType<typeof createMockNotificationService>;
    let toastService: ReturnType<typeof createMockToastService>;
    let i18nService: ReturnType<typeof createMockI18nService>;

    beforeEach(() => {
      notificationService = createMockNotificationService();
      toastService = createMockToastService();
      i18nService = createMockI18nService();
    });

    it('should call toggleReadStatus and then notifyMutation on success', async () => {
      notificationService.toggleReadStatus.mockResolvedValueOnce(undefined);

      await toggleReadStatus(
        { id: '1', isRead: false },
        notificationService,
        toastService,
        i18nService,
      );

      expect(notificationService.toggleReadStatus).toHaveBeenCalledWith({ id: '1', isRead: false });
      expect(notificationService.notifyMutation).toHaveBeenCalled();
    });

    it('should show markAsRead error toast on failure for unread notification', async () => {
      notificationService.toggleReadStatus.mockRejectedValueOnce(new Error('fail'));

      await toggleReadStatus(
        { id: '1', isRead: false },
        notificationService,
        toastService,
        i18nService,
      );

      expect(toastService.show).toHaveBeenCalledWith(
        'notifications.markAsRead.error.title',
        'notifications.markAsRead.error.message',
        ToastType.Error,
      );
    });

    it('should show markAsUnread error toast on failure for read notification', async () => {
      notificationService.toggleReadStatus.mockRejectedValueOnce(new Error('fail'));

      await toggleReadStatus(
        { id: '1', isRead: true },
        notificationService,
        toastService,
        i18nService,
      );

      expect(toastService.show).toHaveBeenCalledWith(
        'notifications.markAsUnread.error.title',
        'notifications.markAsUnread.error.message',
        ToastType.Error,
      );
    });
  });

  describe('markAllAsRead', () => {
    let notificationService: ReturnType<typeof createMockNotificationService>;
    let toastService: ReturnType<typeof createMockToastService>;
    let i18nService: ReturnType<typeof createMockI18nService>;

    beforeEach(() => {
      notificationService = createMockNotificationService();
      toastService = createMockToastService();
      i18nService = createMockI18nService();
    });

    it('should call markAllAsRead with only unread notification IDs', async () => {
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      await markAllAsRead(
        [
          { id: '1', isRead: false },
          { id: '2', isRead: true },
          { id: '3', isRead: false },
        ],
        notificationService,
        toastService,
        i18nService,
      );

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: ['1', '3'] });
    });

    it('should call notifyMutation and show success toast on success', async () => {
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      await markAllAsRead(
        [{ id: '1', isRead: false }],
        notificationService,
        toastService,
        i18nService,
      );

      expect(notificationService.notifyMutation).toHaveBeenCalled();
      expect(toastService.show).toHaveBeenCalledWith(
        'notifications.markAllAsRead.success.title',
        'notifications.markAllAsRead.success.message',
        ToastType.Success,
      );
    });

    it('should show error toast on failure', async () => {
      notificationService.markAllAsRead.mockRejectedValueOnce(new Error('network error'));

      await markAllAsRead(
        [{ id: '1', isRead: false }],
        notificationService,
        toastService,
        i18nService,
      );

      expect(toastService.show).toHaveBeenCalledWith(
        'notifications.markAllAsRead.error.title',
        expect.any(String),
        ToastType.Error,
      );
    });

    it('should call markAllAsRead with empty array when all notifications are already read', async () => {
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      await markAllAsRead(
        [{ id: '1', isRead: true }],
        notificationService,
        toastService,
        i18nService,
      );

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: [] });
    });
  });
});
