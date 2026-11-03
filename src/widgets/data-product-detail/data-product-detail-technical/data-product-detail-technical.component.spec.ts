import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { FlowCodeEnum, PublicDataProductDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { TooltipBubbleService } from '@/shared/tooltip';

import { DataProductDetailTechnicalComponent } from './data-product-detail-technical.component';

const product = (): PublicDataProductDto => ({
  id: 'product-1',
  paymentRequired: false,
  consentRequired: false,
  stateCode: 'ACTIVE' as PublicDataProductDto['stateCode'],
  name: { de: 'Produkt' },
});

describe('DataProductDetailTechnicalComponent', () => {
  let fixture: ComponentFixture<DataProductDetailTechnicalComponent>;
  let component: DataProductDetailTechnicalComponent;
  let componentRef: ComponentRef<DataProductDetailTechnicalComponent>;
  let showTransient: Mock;
  let writeText: Mock;

  beforeEach(async () => {
    showTransient = vi.fn();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    await TestBed.configureTestingModule({
      imports: [DataProductDetailTechnicalComponent, createTranslocoTestingModule()],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: TooltipBubbleService, useValue: { show: vi.fn(), showTransient } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductDetailTechnicalComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('product', product());
    fixture.detectChanges();
  });

  describe('fields', () => {
    it('lists all technical fields that are set', () => {
      componentRef.setInput('product', {
        ...product(),
        flowCode: FlowCodeEnum.BurBasedPreValidation,
        restClientPathTemplate: '/api/{{bur}}',
        restClientRequestTemplate: '{ "a": 1 }',
      });

      expect(component['fields']().map((field) => field.value)).toEqual([
        'product-1',
        FlowCodeEnum.BurBasedPreValidation,
        '/api/{{bur}}',
        '{\n  "a": 1\n}',
      ]);
    });

    it('shows the request template formatted', () => {
      componentRef.setInput('product', {
        ...product(),
        restClientRequestTemplate: '{"a":{{a}}}',
      });

      expect(component['fields']().at(-1)?.value).toBe('{\n  "a": {{a}}\n}');
    });

    it('lists only the id when the optional fields are missing', () => {
      expect(component['fields']().map((field) => field.key)).toEqual(['productId']);
    });
  });

  describe('copy', () => {
    it('copies the field value with the technical tab messages', async () => {
      fixture.nativeElement.querySelector('[data-testid="copy-productId"]').click();
      await fixture.whenStable();

      expect(writeText).toHaveBeenCalledWith('product-1');
      expect(component['copyFeedback'].message()).toBe('data-catalog.product.technical.copied');
    });
  });
});
