import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { NotificationService } from '@/entities/api/notification.service';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import {
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
  let mockRouter: Partial<Router>;

  beforeEach(async () => {
    notificationService = createMockNotificationService();
    mockRouter = { navigate: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [NotificationOverlayContentComponent, createTranslocoTestingModule()],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: Router, useValue: mockRouter },
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

  describe('handleMarkAsRead', () => {
    it('should mark notification as read and emit reloadNotifications', async () => {
      const reloadSpy = jest.fn();
      componentRef.setInput('notifications', mockInboxEntries);
      component.reloadNotifications.subscribe(reloadSpy);

      component['handleMarkAsRead'](mockInboxEntries[0]);
      await fixture.whenStable();

      expect(notificationService.markNotificationAsRead).toHaveBeenCalledWith('1');
      expect(reloadSpy).toHaveBeenCalled();
    });

    it('should not call markNotificationAsRead when notification has no id', () => {
      const notificationWithoutId = { ...mockInboxEntries[0], id: undefined };
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      component['handleMarkAsRead'](notificationWithoutId);

      expect(notificationService.markNotificationAsRead).not.toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('handleMarkAllAsRead', () => {
    it('should mark all unread notifications as read and emit reloadNotifications', async () => {
      const reloadSpy = jest.fn();
      componentRef.setInput('notifications', mockInboxEntries);
      component.reloadNotifications.subscribe(reloadSpy);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(notificationService.markAllAsRead).toHaveBeenCalledWith({ inboxIds: ['1', '3'] });
      expect(reloadSpy).toHaveBeenCalled();
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
      component['navigateToNotifications']();

      expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.NOTIFICATIONS_PATH]);
    });
  });
});
