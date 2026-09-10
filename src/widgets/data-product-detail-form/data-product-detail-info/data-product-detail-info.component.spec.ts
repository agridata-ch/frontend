import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { I18nService } from '@/shared/i18n';
import { buildReactiveForm } from '@/shared/lib/form.helper';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { availableLangs } from '../../../../transloco.config';
import { dataProductFormsModel, FORM_TAB_IDS } from '../data-product-detail-form.model';
import { DataProductDetailInfoComponent } from './data-product-detail-info.component';

describe('DataProductDetailInfoComponent', () => {
  let fixture: ComponentFixture<DataProductDetailInfoComponent>;
  let component: DataProductDetailInfoComponent;
  let componentRef: ComponentRef<DataProductDetailInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataProductDetailInfoComponent, createTranslocoTestingModule()],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailInfoComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    const i18n = TestBed.inject(I18nService);
    const form = buildReactiveForm(DataProductUpdateDtoSchema, dataProductFormsModel, i18n);
    componentRef.setInput('form', form.get(FORM_TAB_IDS.NAME_AND_DESCRIPTION));

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Radio groups don't carry their own id, but the form-control label they sit next to does
  // (`[for]="id()"`) and is rendered as a sibling within the same container, so scope by that.
  const radioInputsFor = (controlId: string) => {
    const label = fixture.nativeElement.querySelector(
      `label[for="${controlId}"]`,
    ) as HTMLLabelElement;
    return Array.from(
      label.parentElement!.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
  };

  describe('getFormControl', () => {
    it('should return the name.de control', () => {
      expect(component['getFormControl']('name.de')).toBeTruthy();
    });

    it('should return the description.de control', () => {
      expect(component['getFormControl']('description.de')).toBeTruthy();
    });

    it('should return the extendedDescription.de control', () => {
      expect(component['getFormControl']('extendedDescription.de')).toBeTruthy();
    });

    it('should return the consentRequired control', () => {
      expect(component['getFormControl']('consentRequired')).toBeTruthy();
    });

    it('should return the paymentRequired control', () => {
      expect(component['getFormControl']('paymentRequired')).toBeTruthy();
    });

    it('should return the pricingBasis.de control', () => {
      expect(component['getFormControl']('pricingBasis.de')).toBeTruthy();
    });
  });

  describe('consent required radio group', () => {
    const radioInputs = () => radioInputsFor('consentRequired');

    it('should render one radio per option and write the user choice into the control', async () => {
      const radios = radioInputs();
      expect(radios).toHaveLength(2);

      // first option carries value=true
      radios[0].click();
      await fixture.whenStable();

      expect(component['form']().get('consentRequired')?.value).toBe(true);
    });

    it('should reflect the control value as the checked radio', async () => {
      component['getFormControl']('consentRequired').setValue(true);
      await fixture.whenStable();
      expect(radioInputs()[0].checked).toBe(true);

      component['getFormControl']('consentRequired').setValue(false);
      await fixture.whenStable();
      expect(radioInputs()[1].checked).toBe(true);
    });

    it('should not affect the paymentRequired selection when a consentRequired option is clicked', async () => {
      const paymentRadios = radioInputsFor('paymentRequired');

      radioInputs()[0].click();
      await fixture.whenStable();

      expect(component['getFormControl']('paymentRequired').value).toBe(false);
      expect(paymentRadios[0].checked).toBe(true);
    });
  });

  describe('payment required radio group', () => {
    const radioInputs = () => radioInputsFor('paymentRequired');

    it('should render one radio per option, defaulting to the false option', () => {
      const radios = radioInputs();
      expect(radios).toHaveLength(2);
      expect(radios[0].checked).toBe(true);
      expect(radios[1].checked).toBe(false);
    });

    it('should write true into the control when the true-valued option is clicked', async () => {
      const radios = radioInputs();

      // second option carries value=true (radioOptionsPaymentRequired[1])
      radios[1].click();
      await fixture.whenStable();

      expect(component['getFormControl']('paymentRequired').value).toBe(true);
    });

    it('should write false into the control when the false-valued option is clicked', async () => {
      component['getFormControl']('paymentRequired').setValue(true);
      await fixture.whenStable();

      radioInputs()[0].click();
      await fixture.whenStable();

      expect(component['getFormControl']('paymentRequired').value).toBe(false);
    });

    it('should not affect the consentRequired selection when a paymentRequired option is clicked', async () => {
      const consentRadios = radioInputsFor('consentRequired');
      const consentValueBefore = component['getFormControl']('consentRequired').value;
      const consentCheckedBefore = consentRadios.map((radio) => radio.checked);

      radioInputs()[0].click();
      await fixture.whenStable();

      expect(component['getFormControl']('consentRequired').value).toBe(consentValueBefore);
      expect(consentRadios.map((radio) => radio.checked)).toEqual(consentCheckedBefore);
    });
  });

  describe('pricing basis fields', () => {
    it('should disable the pricing basis controls while paymentRequired is false', () => {
      for (const lang of availableLangs) {
        expect(component['getFormControl'](`pricingBasis.${lang}`).disabled).toBe(true);
      }
    });

    it('should enable the pricing basis controls once paymentRequired becomes true, and disable them again once it becomes false', async () => {
      component['getFormControl']('paymentRequired').setValue(true);
      await fixture.whenStable();

      for (const lang of availableLangs) {
        expect(component['getFormControl'](`pricingBasis.${lang}`).enabled).toBe(true);
      }

      component['getFormControl']('paymentRequired').setValue(false);
      await fixture.whenStable();

      for (const lang of availableLangs) {
        expect(component['getFormControl'](`pricingBasis.${lang}`).disabled).toBe(true);
      }
    });

    it('should keep pricing basis values once paymentRequired becomes false again', async () => {
      component['getFormControl']('paymentRequired').setValue(true);
      await fixture.whenStable();

      for (const lang of availableLangs) {
        component['getFormControl'](`pricingBasis.${lang}`).setValue('some pricing text');
      }

      component['getFormControl']('paymentRequired').setValue(false);
      await fixture.whenStable();

      for (const lang of availableLangs) {
        expect(component['getFormControl'](`pricingBasis.${lang}`).value).toBe('some pricing text');
      }
    });
  });

  describe('nested translation field disabling', () => {
    it('should render the name input disabled AND greyed when the name group is disabled', async () => {
      component['form']().get('name')?.disable();
      fixture.detectChanges();
      await fixture.whenStable();

      const input = fixture.nativeElement.querySelector('#name-de') as HTMLInputElement;
      expect(input.disabled).toBe(true);
      expect(input.classList.contains('bg-gray-100')).toBe(true);
    });
  });

  describe('language rendering', () => {
    it('should render name, description and extendedDescription controls for each available language', () => {
      for (const lang of availableLangs) {
        expect(fixture.nativeElement.querySelector(`#name-${lang}`)).toBeTruthy();
        expect(fixture.nativeElement.querySelector(`#description-${lang}`)).toBeTruthy();
        expect(fixture.nativeElement.querySelector(`#extendedDescription-${lang}`)).toBeTruthy();
      }
    });
  });
});
