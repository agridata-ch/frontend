import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { UidRegisterService } from '@/entities/api/uid-register.service';
import { COUNTRIES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService, UserData } from '@/shared/lib/auth';
import { MockI18nService, MockUidRegisterService } from '@/shared/testing/mocks';

import { DataRequestFormConsumerComponent } from './data-request-form-consumer.component';

describe('DataRequestFormConsumerComponent', () => {
  let fixture: ComponentFixture<DataRequestFormConsumerComponent>;
  let component: DataRequestFormConsumerComponent;
  let componentRef: ComponentRef<DataRequestFormConsumerComponent>;
  let form: FormGroup;

  const initialUserData: UserData = {
    name: 'Test User',
    uid: 123,
    email: '',
    family_name: '',
    given_name: '',
    loginid: '',
    preferred_username: '',
    sub: '',
  };

  beforeEach(async () => {
    const mockAuthService = {
      userData: jest.fn().mockReturnValue(initialUserData),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataRequestFormConsumerComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: UidRegisterService, useClass: MockUidRegisterService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormConsumerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = new FormGroup({
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
    componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should compute countries list with translated labels', () => {
    const countries = component.countries();
    expect(Array.isArray(countries)).toBe(true);
    countries.forEach((country) => {
      expect(country.label).toMatch(`countries.${country.value}`);
      expect(Object.values(COUNTRIES)).toContain(country.value);
    });
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

  describe('setConsumerInitials', () => {
    it('should set initials for a two-part name', () => {
      component.setConsumerInitials('John Doe');
      expect(component.consumerInitials()).toBe('JD');
    });
    it('should set initials for a single-part name', () => {
      component.setConsumerInitials('Alice');
      expect(component.consumerInitials()).toBe('A');
    });
    it('should set initials for a three-part name (first two only)', () => {
      component.setConsumerInitials('Jane Mary Doe');
      expect(component.consumerInitials()).toBe('JM');
    });
    it('should set empty initials for empty string', () => {
      component.setConsumerInitials('');
      expect(component.consumerInitials()).toBe('');
    });
  });

  describe('handleChangeConsumerInitials', () => {
    it('should update initials from event', () => {
      const event = { target: { value: 'Bob Marley' } } as unknown as Event;
      component.handleChangeConsumerInitials(event);
      expect(component.consumerInitials()).toBe('BM');
    });
  });
});
