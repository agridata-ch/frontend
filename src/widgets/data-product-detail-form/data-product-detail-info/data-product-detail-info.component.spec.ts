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
