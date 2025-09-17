import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { MockI18nService } from '@/shared/testing/mocks/mock-i18n.service';

import { SectionContactFormBlockComponent } from './section-contact-form-block.component';

describe('SectionContactFormBlockComponent', () => {
  let component: SectionContactFormBlockComponent;
  let fixture: ComponentFixture<SectionContactFormBlockComponent>;
  let componentRef: ComponentRef<SectionContactFormBlockComponent>;
  let mockI18nService: MockI18nService;

  beforeEach(async () => {
    mockI18nService = new MockI18nService();

    await TestBed.configureTestingModule({
      imports: [SectionContactFormBlockComponent],
      providers: [{ provide: I18nService, useValue: mockI18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionContactFormBlockComponent);
    component = fixture.componentInstance;

    componentRef = fixture.componentRef;

    componentRef.setInput('block', {
      __component: 'blocks.contact-form',
      id: 4,
      heading: 'Kontaktformular',
      subHeading: 'Teilen Sie uns Ihr Anliegen mit. ',
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit the form when valid and reset it afterwards', () => {
    const form = component['contactForm'];

    form.get('firstName')?.setValue('John');
    form.get('lastName')?.setValue('Doe');
    form.get('organisation')?.setValue('Test Company');
    form.get('email')?.setValue('john.doe@example.com');
    form.get('phone')?.setValue('1234567890');
    form.get('message')?.setValue('This is a test message');

    component['handleSubmit']();

    expect(form.get('firstName')?.value).toBe(null);
    expect(form.get('lastName')?.value).toBe(null);
    expect(form.get('organisation')?.value).toBe(null);
    expect(form.get('email')?.value).toBe(null);
    expect(form.get('phone')?.value).toBe(null);
    expect(form.get('message')?.value).toBe(null);
  });

  it('should show error messages using the i18n service', () => {
    jest.spyOn(mockI18nService, 'translate');

    const firstNameControl = component['contactForm'].get('firstName') as FormControlWithMessages;
    const lastNameControl = component['contactForm'].get('lastName') as FormControlWithMessages;
    const messageControl = component['contactForm'].get('message') as FormControlWithMessages;
    const emailControl = component['contactForm'].get('email') as FormControlWithMessages;

    const firstNameRequiredErrorMessage = firstNameControl.errorMessages?.['required']?.();
    const lastNameRequiredErrorMessage = lastNameControl.errorMessages?.['required']?.();
    const messageRequiredErrorMessage = messageControl.errorMessages?.['required']?.();
    const emailRequiredErrorMessage = emailControl.errorMessages?.['required']?.();
    const emailErrorMessage = emailControl.errorMessages?.['email']?.();

    expect(mockI18nService.translate).toHaveBeenCalledWith('forms.error.required');
    expect(mockI18nService.translate).toHaveBeenCalledWith('forms.error.pattern');
    expect(firstNameRequiredErrorMessage).toBe('forms.error.required');
    expect(lastNameRequiredErrorMessage).toBe('forms.error.required');
    expect(messageRequiredErrorMessage).toBe('forms.error.required');
    expect(emailRequiredErrorMessage).toBe('forms.error.required');
    expect(emailErrorMessage).toBe('forms.error.pattern');
  });

  it('should have correct form control structure', () => {
    const form = component['contactForm'];

    expect(form.contains('firstName')).toBeTruthy();
    expect(form.contains('lastName')).toBeTruthy();
    expect(form.contains('organisation')).toBeTruthy();
    expect(form.contains('email')).toBeTruthy();
    expect(form.contains('phone')).toBeTruthy();
    expect(form.contains('message')).toBeTruthy();

    const messageControl = form.get('message') as FormControlWithMessages;
    const errorMessage = messageControl.errorMessages?.['maxlength']?.();

    expect(messageControl.errorMessages).toBeDefined();
    expect(messageControl.errorMessages?.['maxlength']).toBeDefined();
    expect(errorMessage).toBe('forms.error.maxlength');
  });
});
