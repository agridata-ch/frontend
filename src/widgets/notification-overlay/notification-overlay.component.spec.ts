import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotificationService } from '@/entities/api/notification.service';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  createMockNotificationService,
  MockNotificationService,
} from '@/shared/testing/mocks';

import { NotificationOverlayComponent } from './notification-overlay.component';

describe('NotificationOverlayComponent', () => {
  let component: NotificationOverlayComponent;
  let fixture: ComponentFixture<NotificationOverlayComponent>;
  let notificationService: MockNotificationService;

  beforeEach(async () => {
    notificationService = createMockNotificationService();

    await TestBed.configureTestingModule({
      imports: [NotificationOverlayComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('showPopover signal', () => {
    it('should initialize as false', () => {
      expect(component['showPopover']()).toBe(false);
    });
  });

  describe('hasUnreadNotifications computed', () => {
    it('should return true when there are unread notifications', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['hasUnreadNotifications']()).toBe(true);
    });

    it('should return false when all notifications are read', async () => {
      notificationService.fetchHeaderNotifications.mockResolvedValueOnce({
        items: [
          { id: '1', title: { de: 'Read 1' }, isRead: true, createdAt: '2026-05-11' },
          { id: '2', title: { de: 'Read 2' }, isRead: true, createdAt: '2026-05-11' },
        ],
        totalItems: 2,
        currentPage: 0,
        pageSize: 10,
        totalPages: 1,
      });

      const testFixture = TestBed.createComponent(NotificationOverlayComponent);
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(testFixture.componentInstance['hasUnreadNotifications']()).toBe(false);
    });

    it('should return false when items array is empty', async () => {
      notificationService.fetchHeaderNotifications.mockResolvedValueOnce({
        items: [],
        totalItems: 0,
        currentPage: 0,
        pageSize: 10,
        totalPages: 0,
      });

      const testFixture = TestBed.createComponent(NotificationOverlayComponent);
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(testFixture.componentInstance['hasUnreadNotifications']()).toBe(false);
    });
  });

  describe('closeOverlay', () => {
    it('should set showPopover to false', () => {
      component['showPopover'].set(true);
      component['closeOverlay']();

      expect(component['showPopover']()).toBe(false);
    });
  });

  describe('handleToggle', () => {
    it('should toggle showPopover from false to true', () => {
      component['showPopover'].set(false);
      component['handleToggle']();

      expect(component['showPopover']()).toBe(true);
    });

    it('should toggle showPopover from true to false', () => {
      component['showPopover'].set(true);
      component['handleToggle']();

      expect(component['showPopover']()).toBe(false);
    });
  });

  describe('notificationResource', () => {
    it('should fetch notifications on initialization', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(notificationService.fetchHeaderNotifications).toHaveBeenCalled();
    });

    it('should have the correct value from the service', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['notificationResource'].value()).toBeDefined();
      expect(component['notificationResource'].value()?.items).toHaveLength(3);
    });
  });
});
