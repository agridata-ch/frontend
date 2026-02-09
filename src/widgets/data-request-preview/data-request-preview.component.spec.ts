import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataRequestDto } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks/mock-i18n-service';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';

import { DataRequestPreviewComponent } from './data-request-preview.component';

describe('DataRequestPreviewComponent', () => {
  let component: DataRequestPreviewComponent;
  let fixture: ComponentFixture<DataRequestPreviewComponent>;
  let componentRef: ComponentRef<DataRequestPreviewComponent>;
  let masterDataService: MockMasterDataService;

  beforeEach(async () => {
    masterDataService = createMockMasterDataService();

    await TestBed.configureTestingModule({
      imports: [DataRequestPreviewComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestPreviewComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required input before detectChanges
    const mockDataRequest: DataRequestDto = {
      id: 'test-id',
      dataProviderId: 'provider-1',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      title: { de: 'Test Title' },
      description: { de: 'Test Description' },
      products: ['product1'],
    };
    componentRef.setInput('dataRequest', mockDataRequest);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('computed signals', () => {
    it('should compute productsList correctly', () => {
      const mockProducts: DataProductDto[] = [
        { id: 'product1', name: { de: 'Product 1' } },
        { id: 'product2', name: { de: 'Product 2' } },
      ];

      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'provider-1',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
        products: ['product1'],
      };

      const productsMap = new Map<string, DataProductDto[]>();
      productsMap.set('provider-1', mockProducts);
      masterDataService.__testSignals.productsByProvider.set(productsMap);
      masterDataService.getProductsForProvider = jest.fn((providerId) => {
        return productsMap.get(providerId ?? '') ?? [];
      });

      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      const productsList = component['productsList']();
      expect(productsList).toHaveLength(1);
      expect(productsList).toEqual([{ id: 'product1', name: { de: 'Product 1' } }]);
    });

    it('should handle empty products list', () => {
      const mockProducts: DataProductDto[] = [{ id: 'product1', name: { de: 'Product 1' } }];

      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'provider-1',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
        products: [],
      };

      const productsMap = new Map<string, DataProductDto[]>();
      productsMap.set('provider-1', mockProducts);
      masterDataService.__testSignals.productsByProvider.set(productsMap);
      masterDataService.getProductsForProvider = jest.fn((providerId) => {
        return productsMap.get(providerId ?? '') ?? [];
      });

      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      const productsList = component['productsList']();
      expect(productsList).toHaveLength(0);
    });

    it('should call fetchProductsByProvider when dataRequest has dataProviderId', () => {
      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        dataProviderId: 'provider-1',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
        products: ['product1'],
      };

      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      expect(masterDataService.fetchProductsByProvider).toHaveBeenCalledWith('provider-1');
    });

    it('should return empty productsList when no dataProviderId', () => {
      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
        products: ['product1'],
        dataProviderId: '',
      };

      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      const productsList = component['productsList']();
      expect(productsList).toHaveLength(0);
    });
  });
});
