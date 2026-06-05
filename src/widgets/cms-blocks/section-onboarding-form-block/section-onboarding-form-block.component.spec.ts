import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsService } from '@/entities/cms';
import { I18nService } from '@/shared/i18n';
import {
  MockCmsService,
  MockI18nService,
  MockToastService,
  createMockCmsService,
  createMockI18nService,
  createMockToastService,
} from '@/shared/testing/mocks';
import { ToastService, ToastType } from '@/shared/toast';

import { SectionOnboardingFormBlockComponent } from './section-onboarding-form-block.component';

const mockBlock = {
  __component: 'blocks.onboarding-form',
  id: 1,
  heading: 'Onboarding',
  subHeading: 'Fill out the form',
  anchorId: 'onboarding',
};

describe('SectionOnboardingFormBlockComponent', () => {
  let component: SectionOnboardingFormBlockComponent;
  let fixture: ComponentFixture<SectionOnboardingFormBlockComponent>;
  let componentRef: ComponentRef<SectionOnboardingFormBlockComponent>;
  let mockCmsService: MockCmsService;
  let mockI18nService: MockI18nService;
  let mockToastService: MockToastService;

  beforeEach(async () => {
    mockCmsService = createMockCmsService();
    mockI18nService = createMockI18nService();
    mockToastService = createMockToastService();

    await TestBed.configureTestingModule({
      imports: [SectionOnboardingFormBlockComponent],
      providers: [
        { provide: CmsService, useValue: mockCmsService },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ToastService, useValue: mockToastService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionOnboardingFormBlockComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('block', mockBlock);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('form structure', () => {
    it('has all top-level company fields', () => {
      const form = component['onboardingForm'];

      expect(form.contains('uid')).toBe(true);
      expect(form.contains('company')).toBe(true);
      expect(form.contains('country')).toBe(true);
      expect(form.contains('street')).toBe(true);
      expect(form.contains('number')).toBe(true);
      expect(form.contains('postalCode')).toBe(true);
      expect(form.contains('city')).toBe(true);
    });

    it('has all contact person fields', () => {
      const contactPerson = component['contactPersonGroup'];

      expect(contactPerson.contains('salutation')).toBe(true);
      expect(contactPerson.contains('firstName')).toBe(true);
      expect(contactPerson.contains('lastName')).toBe(true);
      expect(contactPerson.contains('email')).toBe(true);
      expect(contactPerson.contains('phone')).toBe(true);
    });

    it('has all additional fields', () => {
      const form = component['onboardingForm'];

      expect(form.contains('additionalNotes')).toBe(true);
      expect(form.contains('existingAgateSystems')).toBe(true);
      expect(form.contains('interestedDataDescription')).toBe(true);
      expect(form.contains('ownSystemDescription')).toBe(true);
      expect(form.contains('wishedDateRange')).toBe(true);
    });

    it('initialises with one person in the persons array', () => {
      expect(component['personsArray'].length).toBe(1);
    });

    it('initial person group has all expected fields', () => {
      const person = component['personGroup'](0);

      expect(person.contains('agateNumber')).toBe(true);
      expect(person.contains('firstName')).toBe(true);
      expect(person.contains('lastName')).toBe(true);
      expect(person.contains('email')).toBe(true);
      expect(person.contains('function')).toBe(true);
    });
  });

  describe('addPerson', () => {
    it('adds a new person group to the persons array', () => {
      component['addPerson']();

      expect(component['personsArray'].length).toBe(2);
    });

    it('new person group has all expected fields', () => {
      component['addPerson']();

      const newPerson = component['personGroup'](1);

      expect(newPerson.contains('agateNumber')).toBe(true);
      expect(newPerson.contains('firstName')).toBe(true);
      expect(newPerson.contains('lastName')).toBe(true);
      expect(newPerson.contains('email')).toBe(true);
      expect(newPerson.contains('function')).toBe(true);
    });
  });

  describe('removePerson', () => {
    it('removes the person at the given index when multiple persons exist', () => {
      component['addPerson']();
      expect(component['personsArray'].length).toBe(2);

      component['removePerson'](1);

      expect(component['personsArray'].length).toBe(1);
    });

    it('does not remove the last remaining person', () => {
      expect(component['personsArray'].length).toBe(1);

      component['removePerson'](0);

      expect(component['personsArray'].length).toBe(1);
    });
  });

  describe('handleSubmit', () => {
    const fillForm = (comp: SectionOnboardingFormBlockComponent) => {
      const form = comp['onboardingForm'];
      form.get('uid')?.setValue('123');
      form.get('company')?.setValue('Acme AG');
      form.get('country')?.setValue('Switzerland');
      form.get('street')?.setValue('Hauptstrasse');
      form.get('number')?.setValue('1');
      form.get('postalCode')?.setValue('3000');
      form.get('city')?.setValue('Bern');
      form.get('contactPerson')?.get('salutation')?.setValue('Mr');
      form.get('contactPerson')?.get('firstName')?.setValue('John');
      form.get('contactPerson')?.get('lastName')?.setValue('Doe');
      form.get('contactPerson')?.get('email')?.setValue('john@example.com');
      form.get('contactPerson')?.get('phone')?.setValue('+41791234567');
    };

    it('calls submitOnboardingForm with mapped form data', async () => {
      fillForm(component);

      await component['handleSubmit']();

      expect(mockCmsService.submitOnboardingForm).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: '123',
          company: 'Acme AG',
          country: 'Switzerland',
          street: 'Hauptstrasse',
          number: '1',
          postalCode: '3000',
          city: 'Bern',
        }),
      );
    });

    it('resets form fields to null on success', async () => {
      fillForm(component);

      await component['handleSubmit']();

      const form = component['onboardingForm'];
      expect(form.get('uid')?.value).toBeNull();
      expect(form.get('company')?.value).toBeNull();
      expect(form.get('city')?.value).toBeNull();
    });

    it('resets persons array to one entry on success', async () => {
      component['addPerson']();
      component['addPerson']();
      expect(component['personsArray'].length).toBe(3);

      await component['handleSubmit']();

      expect(component['personsArray'].length).toBe(1);
    });

    it('shows success toast on successful submission', async () => {
      await component['handleSubmit']();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'onboardingForm.success.title',
        'onboardingForm.success.message',
        ToastType.Success,
      );
    });

    it('shows error toast on failed submission', async () => {
      mockCmsService.submitOnboardingForm.mockRejectedValueOnce(new Error('Network error'));

      await component['handleSubmit']();

      expect(mockToastService.show).toHaveBeenCalledWith(
        'onboardingForm.error.title',
        expect.any(String),
        ToastType.Error,
      );
    });

    it('does not reset form on failed submission', async () => {
      const form = component['onboardingForm'];
      form.get('company')?.setValue('Acme AG');

      mockCmsService.submitOnboardingForm.mockRejectedValueOnce(new Error('Network error'));

      await component['handleSubmit']();

      expect(form.get('company')?.value).toBe('Acme AG');
    });
  });
});
