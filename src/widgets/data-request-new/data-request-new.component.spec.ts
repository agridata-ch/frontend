import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';

import { DataRequestService, UidRegisterService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AgridataWizardComponent } from '@/widgets/agridata-wizard';

import { DataRequestNewComponent } from './data-request-new.component';

describe('DataRequestNewComponent', () => {
  let fixture: ComponentFixture<DataRequestNewComponent>;
  let component: DataRequestNewComponent;
  let mockDataRequestService: jest.Mocked<DataRequestService>;
  let mockUidRegisterService: jest.Mocked<UidRegisterService>;

  beforeEach(async () => {
    const newDto: DataRequestDto = { id: 'ABC123', stateCode: 'DRAFT' };
    mockDataRequestService = {
      createDataRequest: jest.fn().mockResolvedValue(newDto),
      updateDataRequestDetails: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<DataRequestService>;

    mockUidRegisterService = {
      uidInfosOfCurrentUser: {
        value: jest.fn().mockReturnValue({
          uid: 'UID123',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@example.com',
        }),
        isLoading: jest.fn().mockReturnValue(false),
        reload: jest.fn(),
      },
      searchByUidResource: jest.fn(),
    } as unknown as jest.Mocked<UidRegisterService>;

    const mockI18nService = {
      translateSignal: jest.fn((key: string) => jest.fn(() => `Translated: ${key}`)),
      translate: jest.fn((key: string) => `Translated: ${key}`),
      useObjectTranslation: jest.fn((obj) => obj?.de ?? ''),
      lang: jest.fn(() => 'de'),
    } as unknown as jest.Mocked<I18nService>;

    const mockAuthService = {
      userData: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [DataRequestNewComponent, ReactiveFormsModule, AgridataWizardComponent],
      providers: [
        { provide: DataRequestService, useValue: mockDataRequestService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UidRegisterService, useValue: mockUidRegisterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestNewComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call createDataRequest when saving a new draft', async () => {
    const returned: DataRequestDto = { id: 'ABC123', stateCode: 'DRAFT' };
    mockDataRequestService.createDataRequest.mockResolvedValue(returned);

    component.handleSave('request', false);

    expect(mockDataRequestService.createDataRequest).toHaveBeenCalledTimes(1);

    await mockDataRequestService.createDataRequest.mock.results[0].value;
    expect(component.dataRequestId()).toBe('ABC123');
  });

  it('should call updateDataRequestDetails when saving an existing draft', async () => {
    component.dataRequestId.set('EXISTING');
    fixture.detectChanges();

    component.handleSave('request', false);

    expect(mockDataRequestService.updateDataRequestDetails).toHaveBeenCalledTimes(1);
  });

  it('should advance wizard when nextStep=true', async () => {
    fixture.detectChanges();

    const wizard: AgridataWizardComponent = component.wizard;
    const spy = jest.spyOn(wizard, 'nextStep');

    await component.handleSave('request', true);

    expect(spy).toHaveBeenCalled();
  });

  it('initially all formControlSteps are valid', () => {
    const steps = component.formControlSteps();
    expect(steps.every((step) => step.isValid)).toBe(true);
  });

  it('marks a step invalid after its controls are touched but invalid', () => {
    component.updateFormSteps();
    component.form.get('request')?.markAsTouched();

    const steps = component.formControlSteps();
    const consumerStep = steps.find((step) => step.id === 'request')!;
    expect(consumerStep.isValid).toBe(false);
  });
});
