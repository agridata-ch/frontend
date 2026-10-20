import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAgridataStateService,
  createMockAuthService,
  createMockContractRevisionService,
  createMockDataRequestService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockMasterDataService,
  createMockToastService,
  MockDataRequestService,
  MockErrorHandlerService,
  MockToastService,
} from '@/shared/testing/mocks';
import { ToastService, ToastType } from '@/shared/toast';

import { DataRequestDetailsWrapperComponent } from './data-request-details-wrapper.component';

describe('DataRequestDetailsWrapperComponent', () => {
  let component: DataRequestDetailsWrapperComponent;
  let componentRef: ComponentRef<DataRequestDetailsWrapperComponent>;
  let fixture: ComponentFixture<DataRequestDetailsWrapperComponent>;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let toastService: MockToastService;

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    toastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsWrapperComponent],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: AuthService, useValue: createMockAuthService() },
        { provide: ContractRevisionService, useValue: createMockContractRevisionService() },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: ToastService, useValue: toastService },
        { provide: MasterDataService, useValue: createMockMasterDataService() },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        provideRouter(
          [
            {
              path: `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/:dataRequestId`,
              component: DataRequestDetailsWrapperComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsWrapperComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequestId', 'new');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set shouldShowActiveComponent to true when stateCode is ACTIVE', async () => {
    dataRequestService.fetchDataRequest.mockResolvedValueOnce({
      burPresent: false,
      id: 'test-id',
      stateCode: 'ACTIVE',
      dataProviderId: 'provider-id',
      advantages: [],
    });
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['shouldShowActiveComponent']()).toBe(true);
  });

  it('should set shouldShowActiveComponent to false for non-ACTIVE states', async () => {
    dataRequestService.fetchDataRequest.mockResolvedValueOnce({
      burPresent: false,
      id: 'test-id',
      stateCode: 'DRAFT',
      dataProviderId: 'provider-id',
      advantages: [],
    });
    componentRef.setInput('dataRequestId', 'test-id');

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component['shouldShowActiveComponent']()).toBe(false);
  });

  describe('terminate', () => {
    async function loadRequest(stateCode: DataRequestStateEnum, id = 'test-id') {
      dataRequestService.fetchDataRequest.mockResolvedValue({
        burPresent: false,
        id,
        stateCode,
        dataProviderId: 'provider-id',
        advantages: [],
      });
      componentRef.setInput('dataRequestId', id);
      fixture.detectChanges();
      await fixture.whenStable();
    }

    it('should allow terminating only active requests', async () => {
      await loadRequest(DataRequestStateEnum.Active);
      expect(component['canTerminate']()).toBe(true);

      await loadRequest(DataRequestStateEnum.TerminationPending, 'terminating-id');
      expect(component['canTerminate']()).toBe(false);
    });

    it.each([
      [DataRequestStateEnum.Active, true],
      [DataRequestStateEnum.TerminationPending, true],
      [DataRequestStateEnum.Paused, false],
      [DataRequestStateEnum.Terminated, false],
    ])('should show the terminate button for %s: %s', async (stateCode, expected) => {
      await loadRequest(stateCode, `${stateCode}-id`);

      expect(component['showTerminateButton']()).toBe(expected);
    });

    it('should keep the read-only details view once termination is pending', async () => {
      await loadRequest(DataRequestStateEnum.TerminationPending);

      expect(component['shouldShowActiveComponent']()).toBe(true);
    });

    it('should open the confirmation modal and close it on cancel', async () => {
      await loadRequest(DataRequestStateEnum.Active);

      component['openTerminateConfirmation']();
      expect(component['showTerminateConfirmation']()).toBe(true);

      component['closeTerminateConfirmation']();
      expect(component['showTerminateConfirmation']()).toBe(false);
      expect(dataRequestService.terminateDataRequest).not.toHaveBeenCalled();
    });

    it('should terminate the request and show a success toast when confirmed', async () => {
      await loadRequest(DataRequestStateEnum.Active);

      component['terminateRequest']();
      await fixture.whenStable();

      expect(dataRequestService.terminateDataRequest).toHaveBeenCalledWith('test-id', undefined);
      expect(toastService.show).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        ToastType.Success,
      );
      expect(component['isTerminating']()).toBe(false);
    });

    it('should ignore a late terminate response after switching to another request', async () => {
      await loadRequest(DataRequestStateEnum.Active, 'request-a');
      const terminated = {
        burPresent: false,
        id: 'request-a',
        stateCode: DataRequestStateEnum.TerminationPending,
        dataProviderId: 'provider-id',
        advantages: [],
      };
      let resolveTerminate: (value: typeof terminated) => void = () => {};
      dataRequestService.terminateDataRequest.mockReturnValueOnce(
        new Promise((resolve) => (resolveTerminate = resolve)),
      );

      component['terminateRequest']();
      await loadRequest(DataRequestStateEnum.Active, 'request-b');
      resolveTerminate(terminated);
      await fixture.whenStable();

      expect(component['dataRequest']()?.id).toBe('request-b');
      expect(component['dataRequest']()?.stateCode).toBe(DataRequestStateEnum.Active);
    });

    it('should report errors when terminating fails', async () => {
      await loadRequest(DataRequestStateEnum.Active);
      const error = new Error('fail');
      dataRequestService.terminateDataRequest.mockRejectedValueOnce(error);

      component['terminateRequest']();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
    });
  });
});
