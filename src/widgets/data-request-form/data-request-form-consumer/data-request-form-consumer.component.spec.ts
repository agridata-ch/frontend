import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import type { Mock } from 'vitest';

import { BurRegisterService } from '@/entities/api';
import { COUNTRIES } from '@/shared/constants/constants';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import {
  createMockAuthService,
  createMockBurRegisterService,
  createMockErrorHandlerService,
  createMockI18nService,
  MockAuthService,
  MockBurRegisterService,
  mockDataRequests,
  MockErrorHandlerService,
  MockI18nService,
} from '@/shared/testing/mocks';

import { DataRequestFormConsumerComponent } from './data-request-form-consumer.component';

/**
 * Creates a form group for testing the DataRequestFormConsumerComponent.
 */
function createTestFormGroup(): FormGroup {
  return new FormGroup({
    consumer: new FormGroup({
      dataConsumerDisplayName: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
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
  let burService: MockBurRegisterService;
  let authService: MockAuthService;
  let i18nService: MockI18nService;
  beforeEach(async () => {
    errorService = createMockErrorHandlerService();
    burService = createMockBurRegisterService();
    authService = createMockAuthService();
    i18nService = createMockI18nService();
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataRequestFormConsumerComponent],
      providers: [
        { provide: I18nService, useValue: i18nService },
        { provide: AuthService, useValue: authService },
        { provide: BurRegisterService, useValue: burService },
        { provide: ErrorHandlerService, useValue: errorService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = createTestFormGroup();
    componentRef.setInput('form', form);
    componentRef.setInput('isNewRequest', true);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute countries list with localized labels for the active language', () => {
    const countries = component.countries();
    expect(countries).toHaveLength(Object.values(COUNTRIES).length);

    const swiss = countries.find((country) => country.value === COUNTRIES.CH);
    expect(swiss?.label).toBe('Schweiz');
  });

  it('should update country labels when the active language changes', () => {
    i18nService.lang.set('fr');
    fixture.detectChanges();

    const swiss = component.countries().find((country) => country.value === COUNTRIES.CH);
    expect(swiss?.label).toBe('Suisse');
  });

  it('should handle errors from fetchBurInfosOfCurrentUser and send them to errorService', async () => {
    const testError = new Error('Test error from fetchBurInfosOfCurrentUser');

    // Reset and configure the mock to reject before creating the new fixture
    (burService.fetchBurInfosOfCurrentUser as Mock).mockReset();
    (burService.fetchBurInfosOfCurrentUser as Mock).mockRejectedValueOnce(testError);

    // Create a new fixture with the mocked error
    const errorFixture = TestBed.createComponent(DataRequestFormConsumerComponent);

    // Set the form input before triggering change detection
    errorFixture.componentRef.setInput('form', createTestFormGroup());
    errorFixture.componentRef.setInput('isNewRequest', true);

    errorFixture.detectChanges();
    await errorFixture.whenStable();

    expect(errorService.handleError).toHaveBeenCalledWith(testError);
  });

  it('should prefill the form with the organisation from the BUR register', async () => {
    (burService.fetchBurInfosOfCurrentUser as Mock).mockResolvedValueOnce({
      legalName: 'Muster AG',
      uid: 'CHE123456789',
      address: { street: 'Hauptstrasse 1', zip: '3000', city: 'Bern', country: COUNTRIES.CH },
    });

    const burFixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    const burForm = createTestFormGroup();
    burFixture.componentRef.setInput('form', burForm);
    burFixture.componentRef.setInput('isNewRequest', true);
    burFixture.detectChanges();
    await burFixture.whenStable();

    expect(burForm.get('consumer')?.value).toMatchObject({
      dataConsumerDisplayName: { de: 'Muster AG', fr: 'Muster AG', it: 'Muster AG' },
      dataConsumerStreet: 'Hauptstrasse 1',
      dataConsumerZip: '3000',
      dataConsumerCity: 'Bern',
      dataConsumerCountry: COUNTRIES.CH,
    });
    expect(burFixture.componentInstance.consumerUid()).toBe('CHE123456789');
  });

  describe('BUR register lookup', () => {
    const backendRequest = {
      ...mockDataRequests[0],
      dataConsumerLegalName: 'Backend AG',
      dataConsumerUid: 'CHE-123.456.789',
    };

    function createExistingRequestFixture() {
      (burService.fetchBurInfosOfCurrentUser as Mock).mockClear();
      const existingFixture = TestBed.createComponent(DataRequestFormConsumerComponent);
      existingFixture.componentRef.setInput('form', createTestFormGroup());
      existingFixture.componentRef.setInput('isNewRequest', false);
      return existingFixture;
    }

    it('should query the BUR register for a new data request', async () => {
      await fixture.whenStable();

      expect(burService.fetchBurInfosOfCurrentUser).toHaveBeenCalledTimes(1);
    });

    it('should not query the BUR register for an existing data request and use its values', async () => {
      const existingFixture = createExistingRequestFixture();
      existingFixture.componentRef.setInput('dataRequest', backendRequest);
      existingFixture.detectChanges();
      await existingFixture.whenStable();
      const existingComponent = existingFixture.componentInstance;

      expect(burService.fetchBurInfosOfCurrentUser).not.toHaveBeenCalled();
      expect(existingComponent.consumerName()).toBe('Backend AG');
      expect(existingComponent.consumerUid()).toBe('CHE-123.456.789');
    });

    it('should not query the BUR register when the data request arrives after first render', async () => {
      const existingFixture = createExistingRequestFixture();
      existingFixture.detectChanges();
      await existingFixture.whenStable();

      existingFixture.componentRef.setInput('dataRequest', backendRequest);
      existingFixture.detectChanges();
      await existingFixture.whenStable();

      expect(burService.fetchBurInfosOfCurrentUser).not.toHaveBeenCalled();
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
    it('should update the display name for the active language from the event', () => {
      const event = { target: { value: 'Bob Marley' } } as unknown as Event;
      component.handleChangeConsumerInitials('de', event);
      expect(component.consumerDisplayName()).toBe('Bob Marley');
    });
  });
});

describe('MockBurRegisterService not available', () => {
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
        { provide: BurRegisterService, useValue: createMockBurRegisterService() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = createTestFormGroup();
    componentRef.setInput('form', form);
    componentRef.setInput('isNewRequest', true);
    fixture.detectChanges();
  });

  it('should handle missing BurRegisterService gracefully', () => {
    expect(component).toBeTruthy();
  });
});
