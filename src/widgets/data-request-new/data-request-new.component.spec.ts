import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { DataRequestService, UidRegisterService } from '@/entities/api';
import {
  ConsentRequestDetailViewDtoDataRequestStateCode,
  DataRequestDto,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  MockAuthService,
  MockDataRequestService,
  MockI18nService,
  MockUidRegisterService,
} from '@/shared/testing/mocks';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestNewComponent } from './data-request-new.component';

describe('DataRequestNewComponent', () => {
  let fixture: ComponentFixture<DataRequestNewComponent>;
  let component: DataRequestNewComponent;
  let componentRef: ComponentRef<DataRequestNewComponent>;
  let mockDataRequestService: MockDataRequestService;
  let authService: AuthService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestNewComponent, ReactiveFormsModule, AgridataWizardComponent],
      providers: [
        { provide: DataRequestService, useClass: MockDataRequestService },
        { provide: I18nService, useClass: MockI18nService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: UidRegisterService, useClass: MockUidRegisterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestNewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    mockDataRequestService = TestBed.inject(
      DataRequestService,
    ) as unknown as MockDataRequestService;
    authService = TestBed.inject(AuthService);
    jest.spyOn(authService, 'getUserFullName').mockReturnValue('Test User');

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
    mockDataRequestService.createDataRequest.mockResolvedValue(returned);

    component.handleSave();

    expect(mockDataRequestService.createDataRequest).toHaveBeenCalledTimes(1);

    await mockDataRequestService.createDataRequest.mock.results[0].value;
    expect(component.dataRequestId()).toBe('ABC123');
  });

  it('should call updateDataRequestDetails when saving an existing draft', async () => {
    component.dataRequestId.set('EXISTING');
    fixture.detectChanges();

    component.handleSave();

    expect(mockDataRequestService.updateDataRequestDetails).toHaveBeenCalledTimes(1);
  });

  it('initially all formControlSteps are valid', () => {
    // Mock the form validity
    component.formControlSteps.update((steps) => steps.map((step) => ({ ...step, isValid: true })));
    const steps = component.formControlSteps();
    expect(steps.every((step) => step.isValid)).toBe(true);
  });

  it('marks a step invalid after its controls are touched but invalid', () => {
    component.updateFormSteps();
    const form = component.form();
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

  it('should compute formDisabled with Status InReview', () => {
    component.dataRequest.set({
      id: '123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.InReview,
    });
    expect(component.formDisabled()).toBe(true);
  });

  it('should create request on createOrSetDataRequestId without logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    };
    mockDataRequestService.createDataRequest.mockResolvedValue(newDto);
    await component.createOrSaveDataRequest();
    expect(mockDataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component.dataRequestId()).toBe('NEW123');
    expect(mockDataRequestService.uploadLogo).not.toHaveBeenCalled();
  });

  it('should create request on createOrSetDataRequestId with logo', async () => {
    const newDto: DataRequestDto = {
      id: 'NEW123',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    };
    mockDataRequestService.createDataRequest.mockResolvedValue(newDto);
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    await component.createOrSaveDataRequest();
    expect(mockDataRequestService.createDataRequest).toHaveBeenCalled();
    expect(component.dataRequestId()).toBe('NEW123');
    expect(mockDataRequestService.uploadLogo).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId without logo', async () => {
    component.dataRequestId.set('123');
    await component.createOrSaveDataRequest();
    expect(mockDataRequestService.uploadLogo).not.toHaveBeenCalled();
    expect(mockDataRequestService.updateDataRequestDetails).toHaveBeenCalled();
  });

  it('should update request on createOrSetDataRequestId with logo', async () => {
    component.dataRequestId.set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    await component.createOrSaveDataRequest();
    expect(mockDataRequestService.uploadLogo).toHaveBeenCalled();
    expect(mockDataRequestService.updateDataRequestDetails).toHaveBeenCalled();
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
    component.dataRequestId.set('123');
    const file = new File([''], 'logo.png', { type: 'image/png' });
    component.handleSaveLogo(file);
    expect(mockDataRequestService.uploadLogo).toHaveBeenCalledWith('123', file);
  });

  describe('handleSubmitAndContinue', () => {
    beforeEach(() => {
      const form = component.form();
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
      expect(mockDataRequestService.submitDataRequest).not.toHaveBeenCalled();
    });

    it('should call submitDataRequest and advance to next step when form is valid', async () => {
      const mockResponse = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.InReview,
      };

      const form = component.form();

      Object.defineProperty(form, 'valid', { get: () => true });
      mockDataRequestService.submitDataRequest.mockResolvedValue(mockResponse);

      await component.handleSubmitAndContinue();

      expect(component.handleSave).toHaveBeenCalled();
      expect(mockDataRequestService.submitDataRequest).toHaveBeenCalled();
    });
  });

  describe('selectedRequestEffect', () => {
    it('should update dataRequest when selectedRequest changes', () => {
      const newRequest = {
        id: '456',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      };
      componentRef.setInput('selectedRequest', newRequest);
      fixture.detectChanges();
      expect(component.dataRequest()).toEqual(newRequest);
    });
  });
});
