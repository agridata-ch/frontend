import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockI18nService,
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks';

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
      stateCode: DataRequestStateEnum.Draft,
      title: { de: 'Test Title' },
      description: { de: 'Test Description' },
      products: ['product1'],
      dataProviderId: 'provider-1',
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
        { id: 'product1', name: { de: 'Product 1' }, stateCode: 'DRAFT' },
        { id: 'product2', name: { de: 'Product 2' }, stateCode: 'DRAFT' },
      ];

      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.Draft,
        products: ['product1'],
        dataProviderId: 'provider-1',
      };

      masterDataService.__testSignals.dataProducts.set(mockProducts);
      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      const productsList = component.productsList();
      expect(productsList).toHaveLength(1);
      expect(productsList).toEqual([
        { id: 'product1', name: { de: 'Product 1' }, stateCode: 'DRAFT' },
      ]);
    });

    it('should handle empty products list', () => {
      const mockProducts: DataProductDto[] = [
        { id: 'product1', name: { de: 'Product 1' }, stateCode: 'DRAFT' },
      ];

      const mockDataRequest: DataRequestDto = {
        id: 'test-id',
        stateCode: DataRequestStateEnum.Draft,
        products: [],
      };

      masterDataService.__testSignals.dataProducts.set(mockProducts);
      componentRef.setInput('dataRequest', mockDataRequest);
      fixture.detectChanges();

      const productsList = component.productsList();
      expect(productsList).toHaveLength(0);
    });
  });
});
