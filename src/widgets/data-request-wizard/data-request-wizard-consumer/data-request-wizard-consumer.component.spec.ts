import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/pages/data-requests-consumer';
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

import { DataRequestWizardConsumerComponent } from './data-request-wizard-consumer.component';

describe('DataRequestWizardConsumerComponent', () => {
  let fixture: ComponentFixture<DataRequestWizardConsumerComponent>;
  let component: DataRequestWizardConsumerComponent;
  let componentRef: ComponentRef<DataRequestWizardConsumerComponent>;
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
        DataRequestWizardConsumerComponent,
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
              path: `${ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH}/:dataRequestId`,
              component: DataRequestWizardConsumerComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestWizardConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    authService.getUserFullName.mockReturnValue('Test User');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('saveDataRequest (consumer-specific)', () => {
    it('should call createDataRequest when saving a new draft', async () => {
      const returned: DataRequestDto = {
        id: 'ABC123',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.createDataRequest.mockResolvedValue(returned);

      await component['handleSave']();

      expect(dataRequestService.createDataRequest).toHaveBeenCalledTimes(1);
      expect(component['currentDataRequestId']()).toBe('ABC123');
    });

    it('should call updateDataRequestDetails when saving an existing draft', async () => {
      component['currentDataRequestId'].set('EXISTING');

      await component['handleSave']();

      expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalledTimes(1);
    });

    it('should create request without logo', async () => {
      const newDto: DataRequestDto = {
        id: 'NEW123',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.createDataRequest.mockResolvedValue(newDto);

      await component['saveDataRequest']();

      expect(dataRequestService.createDataRequest).toHaveBeenCalled();
      expect(component['currentDataRequestId']()).toBe('NEW123');
      expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
    });

    it('should create request with logo', async () => {
      const newDto: DataRequestDto = {
        id: 'NEW123',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.createDataRequest.mockResolvedValue(newDto);
      const file = new File([''], 'logo.png', { type: 'image/png' });
      component['handleSaveLogo'](file);

      await component['saveDataRequest']();

      expect(dataRequestService.createDataRequest).toHaveBeenCalled();
      expect(component['currentDataRequestId']()).toBe('NEW123');
      expect(dataRequestService.uploadLogo).toHaveBeenCalled();
    });

    it('should update request without logo', async () => {
      component['currentDataRequestId'].set('123');

      await component['saveDataRequest']();

      expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
      expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
    });

    it('should update request with logo', async () => {
      component['currentDataRequestId'].set('123');
      const file = new File([''], 'logo.png', { type: 'image/png' });
      component['handleSaveLogo'](file);

      await component['saveDataRequest']();

      expect(dataRequestService.uploadLogo).toHaveBeenCalled();
      expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
    });
  });

  describe('formControlSteps (shared logic)', () => {
    it('initially all formControlSteps are valid', () => {
      component['formControlSteps'].update((steps) =>
        steps.map((step) => ({ ...step, isValid: true })),
      );
      const steps = component['formControlSteps']();
      expect(steps.every((step) => step.isValid)).toBe(true);
    });

    it('marks a step invalid after its controls are touched but invalid', () => {
      component['updateFormSteps']();
      const form = component['form'];
      form.get('request')?.markAsTouched();

      const steps = component['formControlSteps']();
      const requestStep = steps.find((step) => step.id === 'request')!;
      expect(requestStep.isValid).toBe(false);
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
      expect(component['form'].disabled).toBe(true);
    });
  });

  describe('handleNextStep (shared logic)', () => {
    it('should call handleSave when form is not disabled', () => {
      const spy = jest.spyOn(component as any, 'handleSave');
      component['handleNextStep']();
      expect(spy).toHaveBeenCalled();
    });

    it('should not call handleSave when form is disabled', () => {
      const handleSaveSpy = jest.spyOn(component as any, 'handleSave');
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.InReview,
      });

      component['handleNextStep']();

      expect(handleSaveSpy).not.toHaveBeenCalled();
    });

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

  describe('handlePreviousStep', () => {
    it('should call handleSave when form is not disabled', () => {
      const spy = jest.spyOn(component as any, 'handleSave');
      component['handlePreviousStep']();
      expect(spy).toHaveBeenCalled();
    });

    it('should reset hasFreshReleasedToProvider', () => {
      component['hasFreshReleasedToProvider'].set(true);
      jest.spyOn(component as any, 'handleSave').mockImplementation();

      component['handlePreviousStep']();

      expect(component['hasFreshReleasedToProvider']()).toBe(false);
    });
  });

  describe('handleStepChange (shared logic)', () => {
    it('should not call handleSave when form is disabled', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.InReview,
      });
      const handleSave = jest.spyOn(component as any, 'handleSave');

      component['handleStepChange']();

      expect(handleSave).not.toHaveBeenCalled();
    });

    it('should call handleSave when form is not disabled', () => {
      const handleSave = jest.spyOn(component as any, 'handleSave');

      component['handleStepChange']();

      expect(handleSave).toHaveBeenCalled();
    });
  });

  describe('handleSaveLogo (consumer-specific)', () => {
    it('should set logoFile signal', () => {
      const file = new File([''], 'logo.png', { type: 'image/png' });

      component['handleSaveLogo'](file);

      expect(component['logoFile']()).toBe(file);
    });

    it('should upload logo when dataRequestId exists', () => {
      component['currentDataRequestId'].set('123');
      const file = new File([''], 'logo.png', { type: 'image/png' });

      component['handleSaveLogo'](file);

      expect(dataRequestService.uploadLogo).toHaveBeenCalledWith('123', file);
    });
  });

  describe('handleSubmitAndContinue (consumer-specific)', () => {
    beforeEach(() => {
      jest.spyOn(component['wizard']() as never, 'nextStep').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(component as any, 'handleSave').mockResolvedValue(undefined);
      jest.spyOn(component['form'], 'markAllAsTouched').mockImplementation();
      jest.spyOn(component as any, 'updateFormSteps').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not call submitDataRequest when form is invalid', async () => {
      Object.defineProperty(component['form'], 'valid', { get: () => false });

      await component['handleSubmitAndContinue']();

      expect(dataRequestService.submitDataRequest).not.toHaveBeenCalled();
    });

    it('should call submitDataRequest when form is valid', async () => {
      const mockResponse = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.InReview,
      };
      Object.defineProperty(component['form'], 'valid', { get: () => true });
      dataRequestService.submitDataRequest.mockResolvedValue(mockResponse);
      componentRef.setInput('dataRequestId', 'test-id');
      fixture.detectChanges();

      await component['handleSubmitAndContinue']();

      expect(dataRequestService.submitDataRequest).toHaveBeenCalled();
    });

    it('should handle errors from submitDataRequest', async () => {
      const testError = new Error('Submit error');
      Object.defineProperty(component['form'], 'valid', { get: () => true });
      component['currentDataRequestId'].set('test-id');
      dataRequestService.submitDataRequest.mockRejectedValue(testError);

      await component['handleSubmitAndContinue']();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['isSaving']()).toBe(false);
    });
  });

  describe('updateDataRequestFromInputEffect (shared logic)', () => {
    it('should update dataRequest when initialDataRequest is set', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.Draft,
      };
      componentRef.setInput('initialDataRequest', newRequest);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['dataRequest']()).toEqual(newRequest);
    });
  });

  describe('handleRetreat (consumer-specific)', () => {
    it('should set refreshListNeeded to true', async () => {
      component['currentDataRequestId'].set('test-id-123');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-123',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);

      await component['handleRetreat']();

      expect(component['refreshListNeeded']()).toBe(true);
    });

    it('should return early if no dataRequestId exists', async () => {
      component['currentDataRequestId'].set(undefined);

      await component['handleRetreat']();

      expect(dataRequestService.retreatDataRequest).not.toHaveBeenCalled();
    });

    it('should call retreatDataRequest with the current dataRequestId', async () => {
      component['currentDataRequestId'].set('test-id-456');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-456',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);

      await component['handleRetreat']();

      expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith('test-id-456');
    });

    it('should update dataRequest signal with retreated data', async () => {
      component['currentDataRequestId'].set('test-id-789');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-789',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);

      await component['handleRetreat']();

      expect(component['dataRequest']()).toEqual(retreatedRequest);
    });

    it('should call updateFormSteps after retreating', async () => {
      component['currentDataRequestId'].set('test-id-update');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-update',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);
      const updateFormStepsSpy = jest.spyOn(component as any, 'updateFormSteps');

      await component['handleRetreat']();

      expect(updateFormStepsSpy).toHaveBeenCalled();
    });

    it('should navigate to PRODUCER step when current step is CONTRACT', async () => {
      component['currentDataRequestId'].set('test-id-contract');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-contract',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);
      await fixture.whenStable();
      fixture.detectChanges();

      component['wizard']()!.currentStepId.set('contract');
      const wizardSpy = jest.spyOn(component['wizard']()!, 'handleChangeStep');

      await component['handleRetreat']();

      expect(wizardSpy).toHaveBeenCalled();
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

      component['handleReloadDataRequest']();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });

  describe('handleClose (consumer-specific)', () => {
    it('should navigate to consumer path with refresh state', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component['refreshListNeeded'].set(true);

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH], {
        state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: true },
      });
    });
  });

  describe('canReleaseDataRequest (consumer-specific)', () => {
    it('should return true when stateCode is ToBeReleasedByConsumer', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeReleasedByConsumer,
      });
      expect(component['canReleaseDataRequest']()).toBe(true);
    });

    it('should return false when stateCode is Draft', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.Draft,
      });
      expect(component['canReleaseDataRequest']()).toBe(false);
    });
  });

  describe('handleRelease (consumer-specific)', () => {
    beforeEach(() => {
      jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return early if form is invalid', async () => {
      Object.defineProperty(component['form'], 'invalid', { get: () => true });

      await component['handleRelease']();

      expect(dataRequestService.releaseDataRequestToProvider).not.toHaveBeenCalled();
    });

    it('should return early if no dataRequestId exists', async () => {
      Object.defineProperty(component['form'], 'invalid', { get: () => false });
      component['currentDataRequestId'].set(undefined);

      await component['handleRelease']();

      expect(dataRequestService.releaseDataRequestToProvider).not.toHaveBeenCalled();
    });

    it('should call releaseDataRequestToProvider and update state on success', async () => {
      const releasedRequest: DataRequestDto = {
        id: 'release-id',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      };
      Object.defineProperty(component['form'], 'invalid', { get: () => false });
      component['currentDataRequestId'].set('release-id');
      dataRequestService.releaseDataRequestToProvider.mockResolvedValue(releasedRequest);

      await component['handleRelease']();

      expect(dataRequestService.releaseDataRequestToProvider).toHaveBeenCalledWith('release-id');
      expect(component['dataRequest']()).toEqual(releasedRequest);
      expect(component['hasFreshReleasedToProvider']()).toBe(true);
      expect(component['isHandlingReleaseDataRequest']()).toBe(false);
    });

    it('should handle errors from releaseDataRequestToProvider', async () => {
      const testError = new Error('Release error');
      Object.defineProperty(component['form'], 'invalid', { get: () => false });
      component['currentDataRequestId'].set('release-id');
      dataRequestService.releaseDataRequestToProvider.mockRejectedValue(testError);

      await component['handleRelease']();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['isHandlingReleaseDataRequest']()).toBe(false);
    });
  });

  describe('setInitialWizardStepEffect (consumer-specific)', () => {
    it('should navigate to CONTRACT step when stateCode is ToBeSignedByConsumer', async () => {
      const newFixture = TestBed.createComponent(DataRequestWizardConsumerComponent);
      const newComponentRef = newFixture.componentRef;

      newComponentRef.setInput('initialDataRequest', {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeSignedByConsumer,
      });
      newFixture.detectChanges();
      await newFixture.whenStable();

      const wizard = newFixture.componentInstance['wizard']()!;
      expect(wizard.currentStepId()).toBe('contract');
    });

    it('should navigate to COMPLETION step when stateCode is ToBeReleasedByConsumer', async () => {
      const newFixture = TestBed.createComponent(DataRequestWizardConsumerComponent);
      const newComponentRef = newFixture.componentRef;

      newComponentRef.setInput('initialDataRequest', {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeReleasedByConsumer,
      });
      newFixture.detectChanges();
      await newFixture.whenStable();

      const wizard = newFixture.componentInstance['wizard']()!;
      expect(wizard.currentStepId()).toBe('completion');
    });
  });

  describe('isNextStepDisabled (shared logic)', () => {
    it('should return true when next step is disabled', () => {
      component['wizard']()!.handleChangeStep(3); // PRODUCER step, next is CONTRACT which is disabled
      expect(component['isNextStepDisabled']()).toBe(true);
    });

    it('should return false when next step is enabled', () => {
      component['wizard']()!.handleChangeStep(0); // CONSUMER step, next is REQUEST which is enabled
      expect(component['isNextStepDisabled']()).toBe(false);
    });
  });

  describe('checkExternalCompletion (consumer-specific)', () => {
    it('should return true for CONTRACT when stateCode is ToBeReleasedByConsumer', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeReleasedByConsumer,
      });
      expect(component['checkExternalCompletion']('contract')).toBe(true);
    });

    it('should return true for CONTRACT when stateCode is ToBeSignedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      expect(component['checkExternalCompletion']('contract')).toBe(true);
    });

    it('should return false for CONTRACT when stateCode is Draft', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.Draft,
      });
      expect(component['checkExternalCompletion']('contract')).toBe(false);
    });

    it('should return true for COMPLETION when stateCode is ToBeSignedByProvider', () => {
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      expect(component['checkExternalCompletion']('completion')).toBe(true);
    });

    it('should return true for unknown formGroupName', () => {
      expect(component['checkExternalCompletion']('unknown')).toBe(true);
    });
  });
});
