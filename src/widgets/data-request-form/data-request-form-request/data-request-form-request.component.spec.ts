import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataProviderDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';

import { DataRequestFormRequestComponent } from './data-request-form-request.component';

const createMockForm = () =>
  new FormGroup({
    request: new FormGroup({
      products: new FormControl([], Validators.required),
      title: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
      description: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
      purpose: new FormGroup({
        de: new FormControl(''),
        fr: new FormControl(''),
        it: new FormControl(''),
      }),
    }),
  });

const mockDataProducts: DataProductDto[] = [
  {
    id: 'product-1',
    name: { de: 'Produkt 1', fr: 'Produit 1', it: 'Prodotto 1' },
    dataSourceSystemCode: 'AGIS',
  },
  {
    id: 'product-2',
    name: { de: 'Produkt 2', fr: 'Produit 2', it: 'Prodotto 2' },
    dataSourceSystemCode: 'AGIS',
  },
  {
    id: 'product-3',
    name: { de: 'Produkt 3', fr: 'Produit 3', it: 'Prodotto 3' },
    dataSourceSystemCode: 'TVD',
  },
];

const mockProviders: DataProviderDto[] = [
  { id: 'provider-1', name: { de: 'Provider 1' } },
  { id: 'provider-2', name: { de: 'Provider 2' } },
];

let fixture: ComponentFixture<DataRequestFormRequestComponent>;
let component: DataRequestFormRequestComponent;
let componentRef: ComponentRef<DataRequestFormRequestComponent>;
let metadataService: MockMasterDataService;
let i18nService: MockI18nService;

describe('DataRequestFormRequestComponent', () => {
  beforeEach(async () => {
    metadataService = createMockMasterDataService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestFormRequestComponent],
      providers: [
        { provide: I18nService, useValue: i18nService },
        { provide: MasterDataService, useValue: metadataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('form', createMockForm());
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('dataProductsCategories', () => {
    it('should return empty array when no products loaded', () => {
      expect(component['dataProductsCategories']().length).toBe(0);
    });

    it('should include all categories plus "All Systems" option when multiple categories', () => {
      // Set up products for the selected provider
      const productsMap = new Map<string, DataProductDto[]>();
      productsMap.set('provider-1', mockDataProducts);
      metadataService.__testSignals.productsByProvider.set(productsMap);
      metadataService.getProductsForProvider = jest.fn((providerId) => {
        return productsMap.get(providerId ?? '') ?? [];
      });

      // Select a provider to trigger products loading
      component['selectedProviderId'].set('provider-1');
      fixture.detectChanges();

      const categories = component['dataProductsCategories']();
      expect(categories.length).toBe(3);
      expect(categories[0].value).toBeNull();
      expect(categories[1].value).toBe('AGIS');
      expect(categories[2].value).toBe('TVD');
    });

    it('should not include "All Systems" when only one category', () => {
      const singleCategoryProducts: DataProductDto[] = [
        { id: 'product-1', name: { de: 'Produkt 1' }, dataSourceSystemCode: 'AGIS' },
      ];
      const productsMap = new Map<string, DataProductDto[]>();
      productsMap.set('provider-1', singleCategoryProducts);
      metadataService.__testSignals.productsByProvider.set(productsMap);
      metadataService.getProductsForProvider = jest.fn((providerId) => {
        return productsMap.get(providerId ?? '') ?? [];
      });

      component['selectedProviderId'].set('provider-1');
      fixture.detectChanges();

      const categories = component['dataProductsCategories']();
      expect(categories.length).toBe(1);
      expect(categories[0].value).toBe('AGIS');
    });
  });

  describe('productsGrouped', () => {
    beforeEach(() => {
      const productsMap = new Map<string, DataProductDto[]>();
      productsMap.set('provider-1', mockDataProducts);
      metadataService.__testSignals.productsByProvider.set(productsMap);
      metadataService.getProductsForProvider = jest.fn((providerId) => {
        return productsMap.get(providerId ?? '') ?? [];
      });

      component['selectedProviderId'].set('provider-1');
      fixture.detectChanges();
    });

    it('should show all products grouped by category when no category is selected', () => {
      const grouped = component['productsGrouped']();

      expect(grouped.length).toBe(2);
      expect(grouped[0].categoryLabel).toBe('AGIS');
      expect(grouped[0].options.length).toBe(2);
      expect(grouped[1].categoryLabel).toBe('TVD');
      expect(grouped[1].options.length).toBe(1);
    });

    it('should filter products by selected category', () => {
      component['onCategoryChange']('AGIS');
      fixture.detectChanges();

      const grouped = component['productsGrouped']();

      expect(grouped.length).toBe(1);
      expect(grouped[0].categoryLabel).toBe('AGIS');
      expect(grouped[0].options.length).toBe(2);
    });

    it('should use current language for product labels', () => {
      // Default mock language is 'de'
      const grouped = component['productsGrouped']();
      expect(grouped[0].options[0].label).toBe('Produkt 1');
    });
  });

  describe('onCategoryChange', () => {
    it('should update selectedCategory signal', () => {
      component['onCategoryChange']('AGIS');
      expect(component['selectedCategory']()).toBe('AGIS');
    });

    it('should handle null value for "All Systems"', () => {
      component['onCategoryChange']('AGIS');
      component['onCategoryChange'](null);
      expect(component['selectedCategory']()).toBeNull();
    });

    it('should clear products when category changes to a specific category', async () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.setValue(['product-1', 'product-2']);

      component['onCategoryChange']('TVD');
      await fixture.whenStable();

      expect(productsControl?.value).toEqual([]);
    });
  });

  describe('onProviderChange', () => {
    it('should update selectedProviderId signal', () => {
      component['onProviderChange']('provider-1');
      expect(component['selectedProviderId']()).toBe('provider-1');
    });

    it('should clear products and category when provider changes', () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.setValue(['product-1']);
      component['selectedCategory'].set('AGIS');

      component['onProviderChange']('provider-2');

      expect(productsControl?.value).toEqual([]);
      expect(component['selectedCategory']()).toBeNull();
    });

    it('should call fetchProductsByProvider when provider is selected', () => {
      component['onProviderChange']('provider-1');
      fixture.detectChanges();

      expect(metadataService.fetchProductsByProvider).toHaveBeenCalledWith('provider-1');
    });
  });

  describe('hasProductsError', () => {
    it('should return false when control is untouched', () => {
      expect(component['hasProductsError']()).toBe(false);
    });

    it('should return true when control is touched and invalid', () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.markAsTouched();
      fixture.detectChanges();

      expect(component['hasProductsError']()).toBe(true);
    });

    it('should return false when control is touched and valid', () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.setValue(['product-1']);
      productsControl?.markAsTouched();
      fixture.detectChanges();

      expect(component['hasProductsError']()).toBe(false);
    });
  });

  describe('getProductsErrorMessage', () => {
    it('should return null when control is untouched', () => {
      expect(component['getProductsErrorMessage']()).toBeNull();
    });

    it('should return null when control has no errorMessages defined', () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.markAsTouched();
      fixture.detectChanges();

      // Returns null because plain FormControl doesn't have errorMessages
      expect(component['getProductsErrorMessage']()).toBeNull();
    });

    it('should return null when control is valid', () => {
      const form = component.form()!;
      const productsControl = form.get('request.products');
      productsControl?.setValue(['product-1']);
      productsControl?.markAsTouched();
      fixture.detectChanges();

      expect(component['getProductsErrorMessage']()).toBeNull();
    });
  });

  describe('formDisabled input', () => {
    it('should default to false', () => {
      expect(component.formDisabled()).toBe(false);
    });

    it('should accept true value', () => {
      componentRef.setInput('formDisabled', true);
      fixture.detectChanges();

      expect(component.formDisabled()).toBe(true);
    });
  });

  describe('dataProviderId input', () => {
    it('should initialize selectedProviderId from input', async () => {
      componentRef.setInput('dataProviderId', 'provider-1');
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['selectedProviderId']()).toBe('provider-1');
    });
  });

  describe('singleProviderAutoSelectEffect', () => {
    it('should auto-select provider when only one provider available', async () => {
      metadataService.__testSignals.dataProviders.set([mockProviders[0]]);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['selectedProviderId']()).toBe('provider-1');
    });
  });
});
