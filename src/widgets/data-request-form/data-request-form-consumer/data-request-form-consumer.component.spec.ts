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
});
