import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { NotificationService } from '@/entities/api/notification.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  createMockI18nService,
  createMockNotificationService,
  mockInboxEntries,
  MockNotificationService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { NotificationOverlayContentComponent } from './notification-overlay-content.component';

describe('NotificationOverlayContentComponent', () => {
  let component: NotificationOverlayContentComponent;
  let fixture: ComponentFixture<NotificationOverlayContentComponent>;
  let componentRef: ComponentRef<NotificationOverlayContentComponent>;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    notificationService = createMockNotificationService();

    await TestBed.configureTestingModule({
      imports: [NotificationOverlayContentComponent, createTranslocoTestingModule()],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationOverlayContentComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('handleToggleReadStatus', () => {
    it('should call toggleReadStatus and notifyMutation on success', async () => {
      componentRef.setInput('notifications', mockInboxEntries);

      component['handleToggleReadStatus'](mockInboxEntries[0]);
      await fixture.whenStable();

      expect(notificationService.toggleReadStatus).toHaveBeenCalledWith(mockInboxEntries[0]);
      expect(notificationService.notifyMutation).toHaveBeenCalled();
    });

    it('should not call notifyMutation on failure', async () => {
      notificationService.toggleReadStatus.mockRejectedValueOnce(new Error('Error'));
      componentRef.setInput('notifications', mockInboxEntries);

      component['handleToggleReadStatus'](mockInboxEntries[0]);
      await fixture.whenStable();

      expect(notificationService.notifyMutation).not.toHaveBeenCalled();
    });
  });

  describe('handleMarkAllAsRead', () => {
    it('should mark all unread notifications as read and call notifyMutation', async () => {
      componentRef.setInput('notifications', mockInboxEntries);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: ['1', '3'] });
      expect(notificationService.notifyMutation).toHaveBeenCalled();
    });

    it('should pass empty inboxIds when all notifications are already read', async () => {
      const allRead = mockInboxEntries.map((n) => ({ ...n, isRead: true }));
      componentRef.setInput('notifications', allRead);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: [] });
    });

    it('should set isLoadingMarkAllAsRead to false after success', async () => {
      componentRef.setInput('notifications', mockInboxEntries);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(component['isLoadingMarkAllAsRead']()).toBe(false);
    });

    it('should set isLoadingMarkAllAsRead to false after error', async () => {
      notificationService.markAllAsRead.mockRejectedValueOnce(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      componentRef.setInput('notifications', mockInboxEntries);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(component['isLoadingMarkAllAsRead']()).toBe(false);
      consoleSpy.mockRestore();
    });

    it('should pass empty inboxIds when notifications input is undefined', async () => {
      componentRef.setInput('notifications', undefined);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: [] });
    });
  });

  describe('navigateToNotifications', () => {
    it('should navigate to the notifications path', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component['navigateToNotifications']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.NOTIFICATIONS_PATH]);
    });
  });
});
