import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService, DataRequestService, UidRegisterService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { SidepanelComponent } from '@/shared/sidepanel';
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
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestNewComponent } from './data-request-new.component';

describe('DataRequestNewComponent', () => {
  let fixture: ComponentFixture<DataRequestNewComponent>;
  let component: DataRequestNewComponent;
  let componentRef: ComponentRef<DataRequestNewComponent>;
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

    // Create factory mock and provide it so tests can mutate signals directly
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestNewComponent, ReactiveFormsModule, AgridataWizardComponent],
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
              component: DataRequestNewComponent,
            },
          ],
          withComponentInputBinding(),
        ),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestNewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set up mock behavior
    authService.getUserFullName.mockReturnValue('Test User');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

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

  it('initially all formControlSteps are valid', () => {
    // Mock the form validity
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
    const consumerStep = steps.find((step) => step.id === 'request')!;
    expect(consumerStep.isValid).toBe(false);
  });

  it('should compute formDisabled with Status Draft', () => {
    component['dataRequest'].set({
      id: '123',
      stateCode: DataRequestStateEnum.Draft,
    });
    expect(component['formDisabled']()).toBe(false);
  });

  it('should compute formDisabled with Status InReview', async () => {
    component['dataRequest'].set({
      id: '123',
      stateCode: DataRequestStateEnum.InReview,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component['formDisabled']()).toBe(true);
    expect(component['form'].disabled).toBe(true);
    Object.keys(component['form'].controls).forEach((control) => {
      expect(component['form'].get(control)?.disabled).toBe(true);
    });
  });

  it('should create request on createOrSetDataRequestId without logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: DataRequestStateEnum.Draft,
    };
    dataRequestService.createDataRequest = jest.fn().mockResolvedValue(newDto);
    await component['createOrSaveDataRequest']();
    expect(dataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component['currentDataRequestId']()).toBe('NEW123');
    expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
  });

  it('should create request on createOrSetDataRequestId with logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: DataRequestStateEnum.Draft,
    };
    dataRequestService.createDataRequest = jest.fn().mockResolvedValue(newDto);
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component['handleSaveLogo'](file);
    await component['createOrSaveDataRequest']();
    expect(dataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component['currentDataRequestId']()).toBe('NEW123');
    expect(dataRequestService.uploadLogo).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId without logo', async () => {
    component['currentDataRequestId'].set('123');
    await component['createOrSaveDataRequest']();
    expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
    expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId with logo', async () => {
    component['currentDataRequestId'].set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component['handleSaveLogo'](file);
    await component['createOrSaveDataRequest']();
    expect(dataRequestService.uploadLogo).toHaveBeenCalled();
    expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
  });

  it('should handle next step correctly', () => {
    const spy = jest.spyOn(component as any, 'handleSave');
    component['handleNextStep']();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle previous step correctly', () => {
    const spy = jest.spyOn(component as any, 'handleSave');
    component['handlePreviousStep']();
    expect(spy).toHaveBeenCalled();
  });

  it('should call handleSave in handleStepChange with form disabled', () => {
    jest.spyOn(component as any, 'formDisabled').mockReturnValue(true);
    const handleSave = jest.spyOn(component as any, 'handleSave');
    component['handleStepChange']();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('should call handleSave in handleStepChange with form disabled = false', () => {
    jest.spyOn(component as any, 'formDisabled').mockReturnValue(false);
    const handleSave = jest.spyOn(component as any, 'handleSave');
    component['handleStepChange']();
    expect(handleSave).toHaveBeenCalled();
  });

  it('should handleSaveLogo', () => {
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component['handleSaveLogo'](file);
    expect(component['logoFile']()).toBe(file);
  });

  it('should handleSaveLogo with dataRequestId', () => {
    component['currentDataRequestId'].set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component['handleSaveLogo'](file);
    expect(dataRequestService.uploadLogo).toHaveBeenCalledWith('123', file);
  });

  describe('handleSubmitAndContinue', () => {
    beforeEach(() => {
      const form = component['form'];
      jest.spyOn(component['wizard']() as any, 'nextStep').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(component as any, 'handleSave').mockImplementation(() => Promise.resolve());
      jest.spyOn(form, 'markAllAsTouched').mockImplementation();
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

    it('should call submitDataRequest and advance to next step when form is valid', async () => {
      const mockResponse = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.InReview,
      };

      const form = component['form'];

      Object.defineProperty(form, 'valid', { get: () => true });
      dataRequestService.submitDataRequest = jest.fn().mockResolvedValue(mockResponse);
      componentRef.setInput('dataRequestId', 'test-id');
      fixture.detectChanges();
      await component['handleSubmitAndContinue']();

      expect(dataRequestService.submitDataRequest).toHaveBeenCalled();
    });
  });

  describe('updateDataRequestFromInputEffect', () => {
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

    it('should open panel once data is loaded', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const sidePanelComp = fixture.debugElement.query(By.directive(SidepanelComponent));
      expect(sidePanelComp).toBeTruthy();
      expect(sidePanelComp.componentInstance.isOpen()).toBe(true);
    });
  });

  describe('handleRetreat', () => {
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

    it('should call wizard.previousStep when current step is CONTRACT', async () => {
      component['currentDataRequestId'].set('test-id-contract');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-contract',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);

      // Wait for wizard to be available
      await fixture.whenStable();
      fixture.detectChanges();

      // Mock the wizard's currentStepId signal to return CONTRACT
      component['wizard']()!.currentStepId.set('contract');
      const wizardSpy = jest.spyOn(component['wizard']()!, 'previousStep');

      await component['handleRetreat']();

      expect(wizardSpy).toHaveBeenCalled();
    });

    it('should not call wizard.previousStep when current step is not CONTRACT', async () => {
      component['currentDataRequestId'].set('test-id-other');
      const retreatedRequest: DataRequestDto = {
        id: 'test-id-other',
        stateCode: DataRequestStateEnum.Draft,
      };
      dataRequestService.retreatDataRequest.mockResolvedValue(retreatedRequest);

      // Wait for wizard to be available
      await fixture.whenStable();
      fixture.detectChanges();

      // Mock the wizard's currentStepId signal to return CONSUMER
      component['wizard']()!.currentStepId.set('consumer');
      const wizardSpy = jest.spyOn(component['wizard']()!, 'previousStep');

      await component['handleRetreat']();

      expect(wizardSpy).not.toHaveBeenCalled();
    });
  });

  describe('handleReloadDataRequest', () => {
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

    it('should update dataRequest signal with fetched data', async () => {
      const fetchedRequest: DataRequestDto = {
        id: 'test-id-reload',
        stateCode: DataRequestStateEnum.Draft,
      };
      component['currentDataRequestId'].set('test-id-reload');
      dataRequestService.fetchDataRequest.mockResolvedValue(fetchedRequest);

      component['handleReloadDataRequest']();
      await fixture.whenStable();

      expect(component['dataRequest']()).toEqual(fetchedRequest);
    });

    it('should call updateFormSteps after fetching', async () => {
      component['currentDataRequestId'].set('test-id-reload');
      dataRequestService.fetchDataRequest.mockResolvedValue(mockDataRequests[0]);
      const updateFormStepsSpy = jest.spyOn(component as any, 'updateFormSteps');

      component['handleReloadDataRequest']();
      await fixture.whenStable();

      expect(updateFormStepsSpy).toHaveBeenCalled();
    });

    it('should handle errors from fetchDataRequest and forward them to errorService', async () => {
      const testError = new Error('Test fetch error');
      component['currentDataRequestId'].set('test-id-reload');
      dataRequestService.fetchDataRequest.mockRejectedValue(testError);

      component['handleReloadDataRequest']();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });

  describe('handleClose', () => {
    it('should navigate to data requests consumer path with refresh state', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
      component['refreshListNeeded'].set(true);

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH], {
        state: { refresh: true },
      });
    });

    it('should pass false for refresh state when refreshListNeeded is false', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

      component['handleClose']();

      expect(navigateSpy).toHaveBeenCalledWith([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH], {
        state: { refresh: false },
      });
    });
  });

  describe('canReleaseDataRequest', () => {
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

  describe('handleRelease', () => {
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

  describe('handleSubmitAndContinue error handling', () => {
    it('should handle errors from submitDataRequest', async () => {
      const testError = new Error('Submit error');
      const form = component['form'];

      jest.spyOn(component as any, 'handleSave').mockResolvedValue(undefined);
      jest.spyOn(form, 'markAllAsTouched').mockImplementation();
      jest.spyOn(component as any, 'updateFormSteps').mockImplementation();
      Object.defineProperty(form, 'valid', { get: () => true });
      component['currentDataRequestId'].set('test-id');
      dataRequestService.submitDataRequest.mockRejectedValue(testError);

      await component['handleSubmitAndContinue']();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
      expect(component['isSaving']()).toBe(false);
    });
  });

  describe('setInitialWizardStepEffect', () => {
    it('should navigate to CONTRACT step when stateCode is ToBeSignedByConsumer', async () => {
      const newFixture = TestBed.createComponent(DataRequestNewComponent);
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
      const newFixture = TestBed.createComponent(DataRequestNewComponent);
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

    it('should navigate to COMPLETION step when stateCode is ToBeSignedByProvider', async () => {
      const newFixture = TestBed.createComponent(DataRequestNewComponent);
      const newComponentRef = newFixture.componentRef;

      newComponentRef.setInput('initialDataRequest', {
        id: 'test-id',
        stateCode: DataRequestStateEnum.ToBeSignedByProvider,
      });
      newFixture.detectChanges();
      await newFixture.whenStable();

      const wizard = newFixture.componentInstance['wizard']()!;
      expect(wizard.currentStepId()).toBe('completion');
    });
  });

  describe('handleNextStep with disabled next step', () => {
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

    it('should not call handleSave when form is disabled', () => {
      const handleSaveSpy = jest.spyOn(component as any, 'handleSave');
      jest.spyOn(component as any, 'isNextStepDisabled').mockReturnValue(true);
      component['dataRequest'].set({
        id: '123',
        stateCode: DataRequestStateEnum.InReview,
      });

      component['handleNextStep']();

      expect(handleSaveSpy).not.toHaveBeenCalled();
    });
  });

  describe('isNextStepDisabled', () => {
    it('should return true when next step is disabled', () => {
      // Default state: CONTRACT and COMPLETION are disabled, wizard starts at step 0 (CONSUMER)
      // Navigate to PRODUCER (step 3), next is CONTRACT which is disabled
      component['wizard']()!.handleChangeStep(3);

      expect(component['isNextStepDisabled']()).toBe(true);
    });

    it('should return false when next step is enabled', () => {
      // At step 0 (CONSUMER), next step is REQUEST which is enabled
      component['wizard']()!.handleChangeStep(0);

      expect(component['isNextStepDisabled']()).toBe(false);
    });
  });
});
