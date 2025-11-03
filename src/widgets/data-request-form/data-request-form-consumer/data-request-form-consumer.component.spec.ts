import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { UidRegisterService } from '@/entities/api/uid-register.service';
import { COUNTRIES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockI18nService,
  createMockUidRegisterService,
  MockUidRegisterService,
} from '@/shared/testing/mocks';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

import { DataRequestFormConsumerComponent } from './data-request-form-consumer.component';

/**
 * Creates a form group for testing the DataRequestFormConsumerComponent.
 */
function createTestFormGroup(): FormGroup {
  return new FormGroup({
    consumer: new FormGroup({
      dataConsumerDisplayName: new FormControl(''),
      dataConsumerCity: new FormControl(''),
      dataConsumerZip: new FormControl(''),
      dataConsumerStreet: new FormControl(''),
      dataConsumerCountry: new FormControl(''),
      contactPhoneNumber: new FormControl(''),
      contactEmailAddress: new FormControl(''),
    }),
  });
}

describe('DataRequestFormConsumerComponent', () => {
  let fixture: ComponentFixture<DataRequestFormConsumerComponent>;
  let component: DataRequestFormConsumerComponent;
  let componentRef: ComponentRef<DataRequestFormConsumerComponent>;
  let form: FormGroup;
  let errorService: MockErrorHandlerService;
  let uidService: MockUidRegisterService;
  let authService: MockAuthService;
  beforeEach(async () => {
    errorService = createMockErrorHandlerService();
    uidService = createMockUidRegisterService();
    authService = createMockAuthService();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataRequestFormConsumerComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: UidRegisterService, useValue: uidService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = createTestFormGroup();
    componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute countries list with translated labels', () => {
    // Ensure form is properly set before accessing computed signals
    const countries = component.countries();
    expect(Array.isArray(countries)).toBe(true);
    countries.forEach((country) => {
      expect(country.label).toMatch(`countries.${country.value}`);
      expect(Object.values(COUNTRIES)).toContain(country.value);
    });
  });

  it('should handle errors from fetchUidInfosOfCurrentUser and send them to errorService', async () => {
    const testError = new Error('Test error from fetchUidInfosOfCurrentUser');

    // Reset and configure the mock to reject before creating the new fixture
    (uidService.fetchUidInfosOfCurrentUser as jest.Mock).mockReset();
    (uidService.fetchUidInfosOfCurrentUser as jest.Mock).mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(DataRequestFormConsumerComponent);

    // Set the form input before triggering change detection
    errorFixture.componentRef.setInput('form', createTestFormGroup());

    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  describe('formatBytes', () => {
    it('should format bytes < 1024 as B', () => {
      expect(component['formatBytes'](512)).toBe('512B');
    });
    it('should format bytes < 1MB as kB', () => {
      expect(component['formatBytes'](2048)).toBe('2kB');
    });
    it('should format bytes >= 1MB as MB', () => {
      expect(component['formatBytes'](2 * 1024 * 1024)).toBe('2.00MB');
    });
  });

  describe('onFileSelected', () => {
    it('should set error if file is too large', () => {
      const file = new File(['a'.repeat(200 * 1024)], 'large.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.logoErrorMessage()).toBeTruthy();
      expect(component.logoFile()).toBeNull();
    });

    it('should accept file if size is ok', () => {
      const file = new File(['a'.repeat(50 * 1024)], 'small.png', { type: 'image/png' });
      const event = { target: { files: [file] } } as unknown as Event;
      component.onFileSelected(event);
      expect(component.logoErrorMessage()).toBeNull();
      expect(component.logoFile()).toBe(file);
    });

    it('should do nothing if no file selected', () => {
      const event = { target: { files: [] } } as unknown as Event;
      component.logoFile.set(null);
      component.logoErrorMessage.set(null);
      component.onFileSelected(event);
      expect(component.logoFile()).toBeNull();
      expect(component.logoErrorMessage()).toBeNull();
    });
  });

  describe('handleChangeConsumerInitials', () => {
    it('should update initials from event', () => {
      const event = { target: { value: 'Bob Marley' } } as unknown as Event;
      component.handleChangeConsumerInitials(event);
      expect(component.consumerDisplayName()).toBe('Bob Marley');
    });
  });
});

describe('MockUidRegisterService not available', () => {
  let fixture: ComponentFixture<DataRequestFormConsumerComponent>;
  let component: DataRequestFormConsumerComponent;
  let componentRef: ComponentRef<DataRequestFormConsumerComponent>;
  let form: FormGroup;
  let authService: MockAuthService;

  beforeEach(async () => {
    authService = createMockAuthService();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataRequestFormConsumerComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: AuthService, useValue: authService },
        { provide: UidRegisterService, useValue: createMockUidRegisterService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = createTestFormGroup();
    componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should handle missing UidRegisterService gracefully', () => {
    expect(component).toBeTruthy();
  });
});
