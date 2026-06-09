import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { NotificationService } from '@/entities/api/notification.service';
import {
  InboxEntryDto,
  MarkAsReadRequestDto,
  ResourceQueryDto,
  TargetTypeCodeEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { PageResponseDto } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockNotificationService,
  createMockToastService,
  MockAuthService,
  MockErrorHandlerService,
  MockI18nService,
  MockNotificationService,
  MockToastService,
  mockInboxEntries,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { ToastService, ToastType } from '@/shared/toast';
import { CellRendererTypes } from '@/shared/ui/agridata-table';

import { NotificationCenterPageComponent } from './notification-center-page.component';

describe('NotificationCenterPageComponent - component behavior', () => {
  let fixture: ComponentFixture<NotificationCenterPageComponent>;
  let component: NotificationCenterPageComponent;
  let notificationService: MockNotificationService;
  let errorService: MockErrorHandlerService;
  let i18nService: MockI18nService;
  let toastService: MockToastService;
  let authService: MockAuthService;
  let mockRouter: jest.Mocked<Pick<Router, 'navigateByUrl'>>;

  const mockResponse: PageResponseDto<InboxEntryDto> = {
    items: mockInboxEntries,
    totalItems: 3,
    totalPages: 1,
    currentPage: 0,
    pageSize: 10,
  };

  beforeEach(async () => {
    notificationService = createMockNotificationService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();
    toastService = createMockToastService();
    authService = createMockAuthService();
    mockRouter = { navigateByUrl: jest.fn().mockResolvedValue(true) } as unknown as jest.Mocked<
      Pick<Router, 'navigateByUrl'>
    >;

    notificationService.fetchNotifications.mockResolvedValue(mockResponse);

    await TestBed.configureTestingModule({
      imports: [NotificationCenterPageComponent, createTranslocoTestingModule()],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: i18nService },
        { provide: ToastService, useValue: toastService },
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationCenterPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('resource loading', () => {
    it('should call fetchNotifications on init with initial params', async () => {
      await fixture.whenStable();

      expect(notificationService.fetchNotifications).toHaveBeenCalled();
    });

    it('should pass resourceQueryDto params to fetchNotifications when changed', async () => {
      await fixture.whenStable();

      const queryParams: ResourceQueryDto = {
        page: 1,
        size: 5,
        searchTerm: 'test',
      };

      notificationService.fetchNotifications.mockClear();
      component.resourceQueryDto.set(queryParams);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(notificationService.fetchNotifications).toHaveBeenCalledWith(queryParams);
    });
  });

  describe('tableMetaData computed signal', () => {
    it('should produce 4 columns', () => {
      const metadata = component['tableMetaData']();
      expect(metadata.columns.length).toBe(4);
    });

    it('should configure the title column as TEMPLATE renderer', () => {
      const metadata = component['tableMetaData']();
      const titleColumn = metadata.columns[0];

      expect(titleColumn.name).toBe('notificationCenter.table.title');
      expect(titleColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
    });

    it('should configure the title column with a template reference', async () => {
      await fixture.whenStable();
      const metadata = component['tableMetaData']();
      const titleColumn = metadata.columns[0];

      if (titleColumn.renderer.type === CellRendererTypes.TEMPLATE) {
        expect(titleColumn.renderer.template).toBeDefined();
      }
    });

    it('should configure the text column as TEMPLATE renderer', () => {
      const metadata = component['tableMetaData']();
      const textColumn = metadata.columns[1];

      expect(textColumn.name).toBe('notificationCenter.table.text');
      expect(textColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
    });

    it('should configure the text column with correct template reference', () => {
      const metadata = component['tableMetaData']();
      const textColumn = metadata.columns[1];

      expect(textColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
      if (textColumn.renderer.type === CellRendererTypes.TEMPLATE) {
        expect(textColumn.renderer.template).toBeDefined();
      }
    });

    it('should configure the date column as TEMPLATE renderer', () => {
      const metadata = component['tableMetaData']();
      const dateColumn = metadata.columns[2];

      expect(dateColumn.name).toBe('notificationCenter.table.date');
      expect(dateColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
    });

    it('should configure the action column as TEMPLATE renderer', () => {
      const metadata = component['tableMetaData']();
      const actionColumn = metadata.columns[3];

      expect(actionColumn.name).toBe('notificationCenter.table.actions');
      expect(actionColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
    });
  });

  describe('handleMarkAllAsRead', () => {
    it('should set isLoadingMarkAllAsRead to true while pending', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockImplementation(() => new Promise(() => {}));

      expect(component['isLoadingMarkAllAsRead']()).toBe(false);
      component['handleMarkAllAsRead']();
      expect(component['isLoadingMarkAllAsRead']()).toBe(true);
    });

    it('should pass only unread notification IDs to markAllAsRead', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      const expectedInbox: MarkAsReadRequestDto = { inboxIds: ['1', '3'] };
      expect(notificationService.markAllAsRead).toHaveBeenCalledWith(expectedInbox);
    });

    it('should call notifyMutation on success', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(notificationService.notifyMutation).toHaveBeenCalled();
    });

    it('should show success toast on success', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Success,
      );
    });

    it('should reset isLoadingMarkAllAsRead to false after success', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockResolvedValueOnce(undefined);

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(component['isLoadingMarkAllAsRead']()).toBe(false);
    });

    it('should show error toast on failure', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockRejectedValueOnce(new Error('Test error'));

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Error,
      );
    });

    it('should reset isLoadingMarkAllAsRead to false after error', async () => {
      await fixture.whenStable();
      notificationService.markAllAsRead.mockRejectedValueOnce(new Error('Test error'));

      component['handleMarkAllAsRead']();
      await fixture.whenStable();

      expect(component['isLoadingMarkAllAsRead']()).toBe(false);
    });
  });

  describe('tableMetaData rowAction', () => {
    it('should navigate via router when notification has a valid route', async () => {
      await fixture.whenStable();
      authService.__testSignals.isConsumer.set(true);
      fixture.detectChanges();

      const notification: InboxEntryDto = {
        id: '42',
        targetType: TargetTypeCodeEnum.DataRequest,
        targetId: 'target-123',
        isRead: false,
      };

      component['tableMetaData']().rowAction!(notification);

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/data-requests/target-123');
    });

    it('should not navigate when notification has no targetId', async () => {
      await fixture.whenStable();

      const notification: InboxEntryDto = { id: '42', isRead: false };

      component['tableMetaData']().rowAction!(notification);

      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('syncEffect', () => {
    it('should reload fetchNotificationsResource when notifyMutation is called', async () => {
      await fixture.whenStable();
      const reloadSpy = jest.spyOn(component.fetchNotificationsResource, 'reload');

      notificationService.notifyMutation();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(reloadSpy).toHaveBeenCalled();
    });
  });

  describe('handleToggleReadStatus', () => {
    it('should call toggleReadStatus with the notification', () => {
      const notification: InboxEntryDto = {
        id: '1',
        title: { de: 'Test' },
        text: { de: 'Test' },
        isRead: false,
      };

      component['handleToggleReadStatus'](notification);

      expect(notificationService.toggleReadStatus).toHaveBeenCalledWith(notification);
    });

    it('should call notifyMutation on success', async () => {
      notificationService.toggleReadStatus.mockResolvedValueOnce(undefined);

      const notification: InboxEntryDto = {
        id: '1',
        title: { de: 'Test' },
        text: { de: 'Test' },
        isRead: false,
      };

      component['handleToggleReadStatus'](notification);
      await fixture.whenStable();

      expect(notificationService.notifyMutation).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      notificationService.toggleReadStatus.mockRejectedValueOnce(new Error('Test error'));

      const notification: InboxEntryDto = {
        id: '1',
        title: { de: 'Test' },
        text: { de: 'Test' },
        isRead: false,
      };

      component['handleToggleReadStatus'](notification);
      await fixture.whenStable();

      expect(toastService.show).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        ToastType.Error,
      );
    });
  });
});
