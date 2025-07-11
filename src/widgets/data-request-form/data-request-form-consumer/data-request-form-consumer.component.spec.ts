import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { COUNTRIES } from '@/shared/constants/constants';
import { I18nService } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';

import { DataRequestFormConsumerComponent } from './data-request-form-consumer.component';

class MockI18nService {
  translate(key: string) {
    return `translated:${key}`;
  }
}
class MockAuthService {
  userData() {
    return { name: 'Test User' };
  }
}

describe('DataRequestFormConsumerComponent', () => {
  let fixture: ComponentFixture<DataRequestFormConsumerComponent>;
  let component: DataRequestFormConsumerComponent;
  let componentRef: ComponentRef<DataRequestFormConsumerComponent>;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DataRequestFormConsumerComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: AuthService, useClass: MockAuthService },
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

  it('should patch form with user name on init', () => {
    component.ngOnInit();
    expect(form.get('consumer.dataConsumerDisplayName')?.value).toBe('Test User');
  });

  it('should compute countries list with translated labels', () => {
    const countries = component.countries();
    expect(Array.isArray(countries)).toBe(true);
    countries.forEach((country) => {
      expect(country.label).toMatch(/^translated:countries\./);
      expect(Object.values(COUNTRIES)).toContain(country.value);
    });
  });

  it('should inject I18nService and AuthService', () => {
    expect(component.i18nService).toBeInstanceOf(MockI18nService);
    expect(component.authService).toBeInstanceOf(MockAuthService);
  });
});
