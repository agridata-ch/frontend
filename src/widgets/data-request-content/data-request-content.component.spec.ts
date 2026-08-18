import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { MasterDataService } from '@/entities/api/master-data.service';
import {
  DataProductDto,
  DataProviderDto,
  DataRequestDto,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockI18nService,
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos';

import { DataRequestContentComponent } from './data-request-content.component';

describe('DataRequestContentComponent', () => {
  let component: DataRequestContentComponent;
  let fixture: ComponentFixture<DataRequestContentComponent>;
  let componentRef: ComponentRef<DataRequestContentComponent>;
  let masterDataService: MockMasterDataService;

  const mockDataRequest: DataRequestDto = {
    id: 'test-id',
    stateCode: DataRequestStateEnum.Draft,
    advantages: [],
    title: { de: 'Test Titel', fr: 'Titre test' },
    description: { de: 'Test Beschreibung', fr: 'Description test' },
    products: ['product1'],
    dataProviderId: 'provider-1',
  };

  beforeEach(async () => {
    masterDataService = createMockMasterDataService();

    await TestBed.configureTestingModule({
      imports: [DataRequestContentComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContentComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    componentRef.setInput('dataRequest', mockDataRequest);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('products', () => {
    it('should only keep the products of the request', () => {
      const mockProducts: DataProductDto[] = [
        { id: 'product1', name: { de: 'Product 1' }, stateCode: 'DRAFT', consentRequired: false },
        { id: 'product2', name: { de: 'Product 2' }, stateCode: 'DRAFT', consentRequired: false },
      ];
      masterDataService.__testSignals.dataProducts.set(mockProducts);
      fixture.detectChanges();

      expect(component['products']()).toEqual([mockProducts[0]]);
    });

    it('should be empty when the request has no products', () => {
      masterDataService.__testSignals.dataProducts.set([
        { id: 'product1', name: { de: 'Product 1' }, stateCode: 'DRAFT', consentRequired: false },
      ]);
      componentRef.setInput('dataRequest', { ...mockDataRequest, products: [] });
      fixture.detectChanges();

      expect(component['products']()).toHaveLength(0);
    });
  });

  describe('language', () => {
    beforeEach(() => {
      masterDataService.__testSignals.dataProviders.set([
        { id: 'provider-1', name: { de: 'Identitas AG', fr: 'Identitas SA' } } as DataProviderDto,
      ]);
      fixture.detectChanges();
    });

    it('should use the active language when no language is given', () => {
      expect(component['title']()).toBe('Test Titel');
      expect(component['description']()).toBe('Test Beschreibung');
      expect(component['providerName']()).toBe('Identitas AG');
    });

    it('should use the given language', () => {
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(component['title']()).toBe('Titre test');
      expect(component['description']()).toBe('Description test');
      expect(component['providerName']()).toBe('Identitas SA');
    });

    it('should pass the language on to the child components', () => {
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      const privacyInfos = fixture.debugElement.query(
        By.directive(DataRequestPrivacyInfosComponent),
      );
      expect(privacyInfos.componentInstance.lang()).toBe('fr');
    });
  });

  describe('product tour anchors', () => {
    const anchorIds = () =>
      ['#data-request-products-accordion', '#data-request-purpose'].map(
        (selector) => fixture.nativeElement.querySelector(selector) !== null,
      );

    it('should be set without an explicit language', () => {
      expect(anchorIds()).toEqual([true, true]);
    });

    it('should be omitted when a language is given', () => {
      componentRef.setInput('lang', 'fr');
      fixture.detectChanges();

      expect(anchorIds()).toEqual([false, false]);
    });
  });

  it('should be empty when no provider matches', () => {
    componentRef.setInput('dataRequest', {
      ...mockDataRequest,
      dataProviderId: 'unknown-provider',
    });
    fixture.detectChanges();

    expect(component['providerName']()).toBe('');
  });
});
