import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductUpdateDto as DataProductUpdateDtoSchema } from '@/assets/formSchemas/agridata-schemas.json';
import { FlowCodeEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { buildReactiveForm } from '@/shared/lib/form.helper';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import {
  dataProductFormsModel,
  FLOW_CODE_OPTIONS,
  FORM_TAB_IDS,
} from '../data-product-detail-form.model';
import { DataProductDetailTechnicalComponent } from './data-product-detail-technical.component';

describe('DataProductDetailTechnicalComponent', () => {
  let fixture: ComponentFixture<DataProductDetailTechnicalComponent>;
  let component: DataProductDetailTechnicalComponent;
  let componentRef: ComponentRef<DataProductDetailTechnicalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataProductDetailTechnicalComponent, createTranslocoTestingModule()],
      providers: [{ provide: I18nService, useValue: createMockI18nService() }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailTechnicalComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    const i18n = TestBed.inject(I18nService);
    const form = buildReactiveForm(DataProductUpdateDtoSchema, dataProductFormsModel, i18n);
    componentRef.setInput('form', form.get(FORM_TAB_IDS.TECHNICAL_FIELDS));

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('flowCodeOptions', () => {
    it('should be populated with all FlowCodeEnum values', () => {
      expect(component['flowCodeOptions']).toHaveLength(Object.values(FlowCodeEnum).length);
    });

    it('should equal FLOW_CODE_OPTIONS constant', () => {
      expect(component['flowCodeOptions']).toEqual(FLOW_CODE_OPTIONS);
    });
  });

  describe('getFormControl', () => {
    it('should return the flowCode control', () => {
      const ctrl = component['getFormControl']('flowCode');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientPathTemplate control', () => {
      const ctrl = component['getFormControl']('restClientPathTemplate');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientRequestTemplate control', () => {
      const ctrl = component['getFormControl']('restClientRequestTemplate');
      expect(ctrl).toBeTruthy();
    });

    it('should return the restClientChangeDetectionPathTemplate control', () => {
      const ctrl = component['getFormControl']('restClientChangeDetectionPathTemplate');
      expect(ctrl).toBeTruthy();
    });
  });
});
