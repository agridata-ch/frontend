import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { createMockDataRequestService, MockDataRequestService } from '@/shared/testing/mocks';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { AdminPage, FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from './admin.page';

describe('AdminPage - component behavior', () => {
  let fixture: ComponentFixture<AdminPage>;
  let component: AdminPage;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let mockRouter: jest.Mocked<Router>;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      currentNavigation: jest.fn().mockReturnValue(null),
    } as unknown as jest.Mocked<Router>;
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    await TestBed.configureTestingModule({
      imports: [createTranslocoTestingModule()],

      providers: [
        AdminPage,
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handle errors from dataRequestsResource and send them to errorService', async () => {
    const testError = new Error('Test error from fetchDataRequests');
    dataRequestService.fetchDataRequests.mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(AdminPage);
    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  it('should navigate to request route when navigateToRequest is called with a valid request', () => {
    const mockRequest = { id: 'test-request-123' };

    component['navigateToRequest'](mockRequest as any);

    expect(mockRouter.navigate).toHaveBeenCalledWith([ROUTE_PATHS.ADMIN_PATH, 'test-request-123']);
  });

  it('should not navigate when navigateToRequest is called with null', () => {
    mockRouter.navigate.mockClear();

    component['navigateToRequest'](null);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate when navigateToRequest is called with undefined', () => {
    mockRouter.navigate.mockClear();

    component['navigateToRequest']();

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should not navigate when navigateToRequest is called with request without id', () => {
    mockRouter.navigate.mockClear();
    const mockRequest = { name: 'test' };

    component['navigateToRequest'](mockRequest as any);

    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should reload dataRequestsResource when navigation state has refresh flag', async () => {
    const mockNavigation = {
      extras: {
        state: {
          [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: true,
        },
      },
    };

    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      currentNavigation: jest.fn().mockReturnValue(mockNavigation),
    } as unknown as jest.Mocked<Router>;

    TestBed.resetTestingModule();

    const reloadSpy = jest.spyOn(component['dataRequestsResource'], 'reload');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('should not reload dataRequestsResource when navigation state does not have refresh flag', async () => {
    const mockNavigation = {
      extras: {
        state: {},
      },
    };
    mockRouter = {
      navigate: jest.fn().mockResolvedValue(true),
      currentNavigation: jest.fn().mockReturnValue(mockNavigation),
    } as unknown as jest.Mocked<Router>;

    TestBed.resetTestingModule();

    const reloadSpy = jest.spyOn(component['dataRequestsResource'], 'reload');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(reloadSpy).not.toHaveBeenCalled();
  });
});
