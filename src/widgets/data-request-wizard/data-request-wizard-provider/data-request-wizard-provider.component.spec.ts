import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockDataRequestService,
  createMockI18nService,
  mockDataRequests,
  MockDataRequestService,
} from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockContractRevisionService,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestWizardProviderComponent } from './data-request-wizard-provider.component';

describe('DataRequestWizardProviderComponent', () => {
  let fixture: ComponentFixture<DataRequestWizardProviderComponent>;
  let component: DataRequestWizardProviderComponent;
  let componentRef: ComponentRef<DataRequestWizardProviderComponent>;
  let authService: MockAuthService;
  let contractRevisionService: MockContractRevisionService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;
  let masterDataService: MockMasterDataService;

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();
    masterDataService = createMockMasterDataService();
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [
        DataRequestWizardProviderComponent,
        ReactiveFormsModule,
        AgridataWizardComponent,
        createTranslocoTestingModule(),
      ],
      providers: [
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: MasterDataService, useValue: masterDataService },
        { provide: UidRegisterService, useValue: createMockI18nService() },
        { provide: ErrorHandlerService, useValue: errorService },
        provideRouter(
          [
            {
              path: `${ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH}/:dataRequestId`,
              component: DataRequestWizardProviderComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestWizardProviderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    authService.getUserFullName.mockReturnValue('Test User');
    // Provider starts at PREVIEW step which needs a dataRequest to render
    component['dataRequest'].set(mockDataRequests[0]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('formsModel', () => {
    it('should use provider forms model with 3 steps', () => {
      const steps = component['formControlSteps']();
      expect(steps.length).toBe(3);
      expect(steps.map((s) => s.id)).toEqual(['preview', 'contract', 'completion']);
    });
  });

  describe('listRoutePath', () => {
    it('should use provider route path', () => {
      expect(component['listRoutePath']).toBe(ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH);
    });
  });

  describe('canReleaseContract (provider-specific)', () => {
    it('should return false when stateCode is ToBeSignedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      expect(component['canReleaseContract']()).toBe(false);
    });

    it('should return true when stateCode is ToBeReleasedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      expect(component['canReleaseContract']()).toBe(true);
    });

    it('should return false when stateCode is Draft', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.Draft,
      });
      expect(component['canReleaseContract']()).toBe(false);
    });

    it('should return false when stateCode is ToBeReleasedByConsumer', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeReleasedByConsumer,
      });
      expect(component['canReleaseContract']()).toBe(false);
    });
  });

  describe('checkExternalCompletion (provider-specific)', () => {
    it('should return true for CONTRACT when stateCode is ToBeReleasedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      expect(component['checkExternalCompletion']('contract')).toBe(true);
    });

    it('should return false for CONTRACT when stateCode is ToBeSignedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      expect(component['checkExternalCompletion']('contract')).toBe(false);
    });

    it('should return true for COMPLETION when stateCode is Active', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.Active,
      });
      expect(component['checkExternalCompletion']('completion')).toBe(true);
    });

    it('should return false for COMPLETION when stateCode is ToBeSignedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      expect(component['checkExternalCompletion']('completion')).toBe(false);
    });

    it('should return true for unknown formGroupName', () => {
      expect(component['checkExternalCompletion']('unknown')).toBe(true);
    });
  });

  describe('handleReleaseContract (provider-specific)', () => {
    it('should return early if no dataRequestId exists', async () => {
      component['currentDataRequestId'].set(undefined);

      await component['handleReleaseContract']();

      // Method returns early, no service calls expected
      expect(component['currentDataRequestId']()).toBeUndefined();
    });

    it('should return early if canReleaseContract is false', async () => {
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });

      await component['handleReleaseContract']();

      expect(dataRequestService.releaseDataRequestToBeActivated).not.toHaveBeenCalled();
    });

    it('should call releaseDataRequestToBeActivated with the current dataRequestId', async () => {
      const released: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeActivated,
      };
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      dataRequestService.releaseDataRequestToBeActivated.mockResolvedValue(released);

      await component['handleReleaseContract']();

      expect(dataRequestService.releaseDataRequestToBeActivated).toHaveBeenCalledWith('test-id');
    });

    it('should update dataRequest and refreshListNeeded on success', async () => {
      const released: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeActivated,
      };
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      dataRequestService.releaseDataRequestToBeActivated.mockResolvedValue(released);

      await component['handleReleaseContract']();

      expect(component['dataRequest']()).toEqual(released);
      expect(component['refreshListNeeded']()).toBe(true);
    });

    it('should reset isHandlingReleaseDataRequest to false after success', async () => {
      const released: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeActivated,
      };
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      dataRequestService.releaseDataRequestToBeActivated.mockResolvedValue(released);

      await component['handleReleaseContract']();

      expect(component['isHandlingReleaseDataRequest']()).toBe(false);
    });

    it('should call errorService.handleError on failure', async () => {
      const testError = new Error('release failed');
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      dataRequestService.releaseDataRequestToBeActivated.mockRejectedValue(testError);

      await component['handleReleaseContract']();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });

    it('should reset isHandlingReleaseDataRequest to false after failure', async () => {
      component['currentDataRequestId'].set('test-id');
      component['dataRequest'].set({
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByProvider,
      });
      dataRequestService.releaseDataRequestToBeActivated.mockRejectedValue(new Error('fail'));

      await component['handleReleaseContract']();

      expect(component['isHandlingReleaseDataRequest']()).toBe(false);
    });
  });

  describe('handleClose (provider-specific)', () => {
    it('should navigate to provider path', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component['refreshListNeeded'].set(true);

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_PROVIDER_PATH], {
        state: { forceReload: true },
      });
    });
  });

  describe('formDisabled (shared logic)', () => {
    it('should return false when stateCode is Draft', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.Draft,
      });
      expect(component['formDisabled']()).toBe(false);
    });

    it('should return true when stateCode is InReview', async () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.InReview,
      });
      fixture.detectChanges();
      await fixture.whenStable();
      expect(component['formDisabled']()).toBe(true);
    });
  });

  describe('handleNextStep (shared logic)', () => {
    it('should not call wizard.nextStep when next step is disabled', () => {
      const wizard = component['wizard']()!;
      const nextStepSpy = jest.spyOn(wizard, 'nextStep');
      jest.spyOn(component as any, 'handleSave').mockImplementation();
      jest.spyOn(component as any, 'isNextStepDisabled').mockReturnValue(true);

      component['handleNextStep']();

      expect(nextStepSpy).not.toHaveBeenCalled();
    });

    it('should call wizard.nextStep when next step is not disabled', () => {
      const wizard = component['wizard']()!;
      const nextStepSpy = jest.spyOn(wizard, 'nextStep');
      jest.spyOn(component as any, 'handleSave').mockImplementation();
      jest.spyOn(component as any, 'isNextStepDisabled').mockReturnValue(false);

      component['handleNextStep']();

      expect(nextStepSpy).toHaveBeenCalled();
    });
  });

  describe('handleReloadDataRequest (shared logic)', () => {
    it('should return early if no dataRequestId exists', async () => {
      component['currentDataRequestId'].set(undefined);

      component['handleReloadDataRequest']();

      expect(dataRequestService.fetchDataRequest).not.toHaveBeenCalled();
    });

    it('should call fetchDataRequest with the current dataRequestId', async () => {
      component['currentDataRequestId'].set('test-id-reload');
      dataRequestService.fetchDataRequest.mockResolvedValue(mockDataRequests[0]);

      component['handleReloadDataRequest']();
      await fixture.whenStable();

      expect(dataRequestService.fetchDataRequest).toHaveBeenCalledWith('test-id-reload');
    });

    it('should handle errors from fetchDataRequest', async () => {
      const testError = new Error('Test fetch error');
      component['currentDataRequestId'].set('test-id-reload');
      dataRequestService.fetchDataRequest.mockRejectedValue(testError);

      await component['handleReloadDataRequest']();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });

  describe('updateDataRequestFromInputEffect (shared logic)', () => {
    it('should update dataRequest when initialDataRequest is set', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      };
      componentRef.setInput('initialDataRequest', newRequest);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['dataRequest']()).toEqual(newRequest);
    });
  });

  describe('isNextStepDisabled (shared logic)', () => {
    it('should return true when next step is disabled', () => {
      // At CONTRACT (step 1), next is COMPLETION which is disabled for non-provider-release states
      component['wizard']()!.handleChangeStep(1);
      expect(component['isNextStepDisabled']()).toBe(true);
    });
  });
});
