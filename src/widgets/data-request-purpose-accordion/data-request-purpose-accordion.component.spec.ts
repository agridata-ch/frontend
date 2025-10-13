import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestDtoDataRequestProducts } from '@/entities/openapi';

import { DataRequestPurposeAccordionComponent } from './data-request-purpose-accordion.component';

describe('DataRequestPurposeAccordionComponent', () => {
  let fixture: ComponentFixture<DataRequestPurposeAccordionComponent>;
  let component: DataRequestPurposeAccordionComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestPurposeAccordionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPurposeAccordionComponent);
    component = fixture.componentInstance;
    jest.spyOn(component, 'currentLanguage').mockReturnValue('de');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('productsList computed', () => {
    it('should return empty array when products is undefined', () => {
      fixture.componentRef.setInput('products', undefined);

      const result = component.productsList();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array when products is null', () => {
      fixture.componentRef.setInput('products', null);

      const result = component.productsList();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return the array when products is an array', () => {
      const mockProducts: ConsentRequestDtoDataRequestProducts[] = [
        {
          id: '123',
          name: { de: 'Produkt 1', fr: 'Produit 1', it: 'Prodotto 1' },
        },
        {
          id: '456',
          name: { de: 'Produkt 2', fr: 'Produit 2', it: 'Prodotto 2' },
        },
      ];

      fixture.componentRef.setInput('products', mockProducts);

      const result = component.productsList();

      expect(result).toBe(mockProducts);
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('123');
      expect(result[1].id).toBe('456');
    });

    it('should return empty array when products is a non-array value', () => {
      const singleProduct: ConsentRequestDtoDataRequestProducts = {
        id: '123',
        name: { de: 'Produkt', fr: 'Produit', it: 'Prodotto' },
      };

      fixture.componentRef.setInput('products', singleProduct);

      const result = component.productsList();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  it('should return the correct lang field from products', () => {
    const mockProduct: ConsentRequestDtoDataRequestProducts = {
      id: '123',
      name: {
        de: 'Produkt Name',
        fr: 'Nom du produit',
        it: 'Nome del prodotto',
      },
      description: {
        de: 'Beschreibung',
        fr: 'Description',
        it: 'Descrizione',
      },
    };

    const result = component.getFieldFromLang(mockProduct, 'name');

    expect(result).toBe('Produkt Name');
  });
});
