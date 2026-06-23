import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto } from '@/entities/openapi';
import { ACTING_ROLES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockActivatedRoute,
  createMockAgridataStateService,
  createMockAuthService,
  createMockContractRevisionService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockMasterDataService,
  createMockUidRegisterService,
  mockDataRequests,
  MockAgridataStateService,
  MockDataRequestService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { DataRequestDetailsComponent } from '@/widgets/data-request-details';

import { AdminDataRequestDetailsComponent } from './admin-data-request-details.component';

describe('AdminDataRequestDetailsComponent', () => {
  let fixture: ComponentFixture<AdminDataRequestDetailsComponent>;
  let component: AdminDataRequestDetailsComponent;
  let componentRef: ComponentRef<AdminDataRequestDetailsComponent>;

  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let stateService: MockAgridataStateService;
  let router: { navigate: jest.Mock };

  const dataRequestId = 'test-request-id';
  const actingRole = ACTING_ROLES.ADMIN;

  const flushPromises = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

  function getDetailsComponent(): DataRequestDetailsComponent {
    return fixture.debugElement.query(By.directive(DataRequestDetailsComponent)).componentInstance;
  }

  function mockDetailsReload(): jest.SpyInstance {
    return jest
      .spyOn(getDetailsComponent().dataRequestResource, 'reload')
      .mockImplementation(() => true);
  }

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    stateService = createMockAgridataStateService();
    router = { navigate: jest.fn() };

    stateService.__testSignals.actingRole.set(actingRole);

    await TestBed.configureTestingModule({
      imports: [AdminDataRequestDetailsComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ActivatedRoute, useValue: createMockActivatedRoute() },
        { provide: AgridataStateService, useValue: stateService },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: ContractRevisionService, useValue: createMockContractRevisionService() },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: Router, useValue: router },
        { provide: UidRegisterService, useValue: createMockUidRegisterService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDataRequestDetailsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('dataRequestId', dataRequestId);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should approve the request and reload details', async () => {
    const reloadSpy = mockDetailsReload();

    component['acceptRequest']();

    await flushPromises();

    expect(dataRequestService.approveDataRequest).toHaveBeenCalledWith(dataRequestId, actingRole);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should activate the request and reload details', async () => {
    const reloadSpy = mockDetailsReload();

    component['activateRequest']();

    await flushPromises();

    expect(dataRequestService.activateDataRequest).toHaveBeenCalledWith(dataRequestId, actingRole);
    expect(reloadSpy).toHaveBeenCalled();
  });

  it('should reject the request and navigate back with refresh enabled', async () => {
    component['rejectRequest']();

    await flushPromises();

    expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith(dataRequestId, actingRole);
    expect(router.navigate).toHaveBeenCalledWith(
      ['..'],
      expect.objectContaining({
        state: { refresh: true },
      }),
    );
  });

  it('should navigate back with refresh disabled when closed before a successful action', () => {
    component['handleClose']();

    expect(router.navigate).toHaveBeenCalledWith(
      ['..'],
      expect.objectContaining({
        state: { refresh: false },
      }),
    );
  });

  it.each([
    ['acceptRequest', 'approveDataRequest'],
    ['activateRequest', 'activateDataRequest'],
    ['rejectRequest', 'retreatDataRequest'],
  ] as const)('should handle errors when %s fails', async (componentMethod, serviceMethod) => {
    const error = new Error('request failed');

    dataRequestService[serviceMethod].mockRejectedValueOnce(error);

    component[componentMethod]();

    await flushPromises();

    expect(errorService.handleError).toHaveBeenCalledWith(error);
  });

  it.each([
    ['acceptRequest', 'approveDataRequest', 'isAccepting'],
    ['activateRequest', 'activateDataRequest', 'isActivating'],
    ['rejectRequest', 'retreatDataRequest', 'isRejecting'],
  ] as const)(
    'should toggle the loading signal while %s is pending',
    async (componentMethod, serviceMethod, loadingSignal) => {
      mockDetailsReload();

      let resolvePromise!: (value: DataRequestDto) => void;

      dataRequestService[serviceMethod].mockReturnValueOnce(
        new Promise<DataRequestDto>((resolve) => {
          resolvePromise = resolve;
        }),
      );

      expect(component[loadingSignal]()).toBe(false);

      component[componentMethod]();

      expect(component[loadingSignal]()).toBe(true);

      resolvePromise(mockDataRequests[0]);
      await flushPromises();

      expect(component[loadingSignal]()).toBe(false);
    },
  );
});
