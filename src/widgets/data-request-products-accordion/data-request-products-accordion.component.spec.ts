import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataProductDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';

import { DataRequestProductsAccordionComponent } from './data-request-products-accordion.component';

const mockProducts: DataProductDto[] = [
  {
    id: '123',
    stateCode: 'DRAFT',
    consentRequired: false,
    name: { de: 'Produkt 1', fr: 'Produit 1', it: 'Prodotto 1' },
    description: { de: 'Beschreibung 1', fr: 'Description 1', it: 'Descrizione 1' },
  },
  {
    id: '456',
    stateCode: 'DRAFT',
    consentRequired: false,
    name: { de: 'Produkt 2', fr: 'Produit 2', it: 'Prodotto 2' },
  },
];

describe('DataRequestProductsAccordionComponent', () => {
  let fixture: ComponentFixture<DataRequestProductsAccordionComponent>;
  let component: DataRequestProductsAccordionComponent;
  let componentRef: ComponentRef<DataRequestProductsAccordionComponent>;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestProductsAccordionComponent],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestProductsAccordionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('currentLanguage', () => {
    it('should fall back to the active language of the i18n service', () => {
      i18nService.lang.set('it');
      fixture.detectChanges();

      expect(component.currentLanguage()).toBe('it');
    });

    it('should prefer the lang input over the active language', () => {
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(component.currentLanguage()).toBe('fr');
    });
  });

  describe('productsList', () => {
    it('should return an empty array when products is not set', () => {
      expect(component.productsList()).toEqual([]);
    });

    it('should return the products that were passed in', () => {
      componentRef.setInput('products', mockProducts);
      fixture.detectChanges();

      expect(component.productsList()).toBe(mockProducts);
    });
  });

  describe('getFieldFromLang', () => {
    beforeEach(() => {
      componentRef.setInput('products', mockProducts);
      fixture.detectChanges();
    });

    it('should return the field value of the active language', () => {
      expect(component.getFieldFromLang(mockProducts[0], 'name')).toBe('Produkt 1');
      expect(component.getFieldFromLang(mockProducts[0], 'description')).toBe('Beschreibung 1');
    });

    it('should follow the lang input', () => {
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(component.getFieldFromLang(mockProducts[0], 'name')).toBe('Produit 1');
    });

    it('should return an empty string when the field is missing on the product', () => {
      expect(component.getFieldFromLang(mockProducts[1], 'description')).toBe('');
    });

    it('should return an empty string when the language is absent from the field', () => {
      const partialProduct: DataProductDto = {
        id: '789',
        stateCode: 'DRAFT',
        consentRequired: false,
        name: { de: 'Nur Deutsch' },
      };
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(component.getFieldFromLang(partialProduct, 'name')).toBe('');
    });
  });

  describe('DOM rendering', () => {
    it('should render one entry per product', () => {
      componentRef.setInput('products', mockProducts);
      fixture.detectChanges();

      const content = fixture.debugElement.nativeElement.textContent;
      expect(content).toContain('Produkt 1');
      expect(content).toContain('Produkt 2');
    });

    it('should link to the public data product information', () => {
      const link = fixture.debugElement.nativeElement.querySelector('a');
      expect(link.getAttribute('href')).toBe(component.productDataLink);
    });
  });
});
