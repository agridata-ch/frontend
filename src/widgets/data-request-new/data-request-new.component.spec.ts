import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService, UidRegisterService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { SidepanelComponent } from '@/shared/sidepanel';
import {
  createMockDataRequestService,
  createMockI18nService,
  MockDataRequestService,
} from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestNewComponent } from './data-request-new.component';

describe('DataRequestNewComponent', () => {
  let fixture: ComponentFixture<DataRequestNewComponent>;
  let component: DataRequestNewComponent;
  let componentRef: ComponentRef<DataRequestNewComponent>;
  let authService: MockAuthService;
  let dataRequestService: MockDataRequestService;
  let errorService: MockErrorHandlerService;

  beforeEach(async () => {
    dataRequestService = createMockDataRequestService();
    errorService = createMockErrorHandlerService();

    // Create factory mock and provide it so tests can mutate signals directly
    authService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [DataRequestNewComponent, ReactiveFormsModule, AgridataWizardComponent],
      providers: [
        { provide: DataRequestService, useValue: dataRequestService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
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
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    };
    dataRequestService.createDataRequest.mockResolvedValue(returned);

    await component.handleSave();

    expect(dataRequestService.createDataRequest).toHaveBeenCalledTimes(1);

    expect(component.currentDataRequestId()).toBe('ABC123');
  });

  it('should call updateDataRequestDetails when saving an existing draft', async () => {
    component.currentDataRequestId.set('EXISTING');

    await component.handleSave();

    expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalledTimes(1);
  });

  it('initially all formControlSteps are valid', () => {
    // Mock the form validity
    component.formControlSteps.update((steps) => steps.map((step) => ({ ...step, isValid: true })));
    const steps = component.formControlSteps();
    expect(steps.every((step) => step.isValid)).toBe(true);
  });

  it('marks a step invalid after its controls are touched but invalid', () => {
    component.updateFormSteps();
    const form = component.form;
    form.get('request')?.markAsTouched();

    const steps = component.formControlSteps();
    const consumerStep = steps.find((step) => step.id === 'request')!;
    expect(consumerStep.isValid).toBe(false);
  });

  it('should compute formDisabled with Status Draft', () => {
    component.dataRequest.set({
      id: '123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    });
    expect(component.formDisabled()).toBe(false);
  });

  it('should compute formDisabled with Status InReview', async () => {
    component.dataRequest.set({
      id: '123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.InReview,
    });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.formDisabled()).toBe(true);
    expect(component.form.disabled).toBe(true);
    Object.keys(component.form.controls).forEach((control) => {
      expect(component.form.get(control)?.disabled).toBe(true);
    });
  });

  it('should create request on createOrSetDataRequestId without logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    };
    dataRequestService.createDataRequest = jest.fn().mockResolvedValue(newDto);
    await component.createOrSaveDataRequest();
    expect(dataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component.currentDataRequestId()).toBe('NEW123');
    expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
  });

  it('should create request on createOrSetDataRequestId with logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    };
    dataRequestService.createDataRequest = jest.fn().mockResolvedValue(newDto);
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    await component.createOrSaveDataRequest();
    expect(dataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component.currentDataRequestId()).toBe('NEW123');
    expect(dataRequestService.uploadLogo).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId without logo', async () => {
    component.currentDataRequestId.set('123');
    await component.createOrSaveDataRequest();
    expect(dataRequestService.uploadLogo).not.toHaveBeenCalled();
    expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId with logo', async () => {
    component.currentDataRequestId.set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    await component.createOrSaveDataRequest();
    expect(dataRequestService.uploadLogo).toHaveBeenCalled();
    expect(dataRequestService.updateDataRequestDetails).toHaveBeenCalled();
  });

  it('should handle next step correctly', () => {
    const spy = jest.spyOn(component, 'handleSave');
    component.handleNextStep();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle previous step correctly', () => {
    const spy = jest.spyOn(component, 'handleSave');
    component.handlePreviousStep();
    expect(spy).toHaveBeenCalled();
  });

  it('should call handleSave in handleStepChange with form disabled', () => {
    jest.spyOn(component, 'formDisabled').mockReturnValue(true);
    const handleSave = jest.spyOn(component, 'handleSave');
    component.handleStepChange();
    expect(handleSave).not.toHaveBeenCalled();
  });

  it('should call handleSave in handleStepChange with form disabled = false', () => {
    jest.spyOn(component, 'formDisabled').mockReturnValue(false);
    const handleSave = jest.spyOn(component, 'handleSave');
    component.handleStepChange();
    expect(handleSave).toHaveBeenCalled();
  });

  it('should handleSaveLogo', () => {
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    expect(component.logoFile()).toBe(file);
  });

  it('should handleSaveLogo with dataRequestId', () => {
    component.currentDataRequestId.set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    expect(dataRequestService.uploadLogo).toHaveBeenCalledWith('123', file);
  });

  describe('handleSubmitAndContinue', () => {
    beforeEach(() => {
      const form = component.form;
      jest.spyOn(component.wizard, 'nextStep').mockImplementation();
      jest.spyOn(console, 'error').mockImplementation();
      jest.spyOn(component, 'handleSave').mockImplementation(() => Promise.resolve());
      jest.spyOn(form, 'markAllAsTouched').mockImplementation();
      jest.spyOn(component, 'updateFormSteps').mockImplementation();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should not call submitDataRequest when form is invalid', async () => {
      Object.defineProperty(component.form, 'valid', { get: () => false });

      await component.handleSubmitAndContinue();

      expect(component.handleSave).toHaveBeenCalled();
      expect(dataRequestService.submitDataRequest).not.toHaveBeenCalled();
    });

    it('should call submitDataRequest and advance to next step when form is valid', async () => {
      const mockResponse = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.InReview,
      };

      const form = component.form;

      Object.defineProperty(form, 'valid', { get: () => true });
      dataRequestService.submitDataRequest = jest.fn().mockResolvedValue(mockResponse);
      componentRef.setInput('dataRequestId', 'test-id');
      fixture.detectChanges();
      await component.handleSubmitAndContinue();

      expect(component.handleSave).toHaveBeenCalled();
      expect(dataRequestService.submitDataRequest).toHaveBeenCalled();
    });
  });

  describe('updateDataRequestFromRessourceEffect', () => {
    it('should update dataRequest when request loaded', async () => {
      const newRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };
      componentRef.setInput('dataRequestId', 'test-id');

      dataRequestService.fetchDataRequest.mockResolvedValue(newRequest);

      fixture.detectChanges();
      await fixture.whenStable();
      expect(component.dataRequest()).toEqual(newRequest);
    });

    it('should open panel once data is loaded', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const sidePanelComp = fixture.debugElement.query(By.directive(SidepanelComponent));
      expect(sidePanelComp).toBeTruthy();
      expect(sidePanelComp.componentInstance.isOpen()).toBe(true);
    });

    it('should handle errors from dataRequestsResource and send them to errorService', async () => {
      const testError = new Error('Test error from fetchDataRequests');
      dataRequestService.fetchDataRequest.mockRejectedValueOnce(testError);
      componentRef.setInput('dataRequestId', 'test-id');

      fixture.detectChanges();
      await fixture.whenStable();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });
});
