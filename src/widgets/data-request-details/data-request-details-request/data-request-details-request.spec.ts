import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataProductDto } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import {
  MockMasterDataService,
  createMockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';

import { DataRequestDetailsRequestComponent } from './data-request-details-request.component';

describe('DataRequestDetailsRequestComponent', () => {
  let fixture: ComponentFixture<DataRequestDetailsRequestComponent>;
  let component: DataRequestDetailsRequestComponent;
  let componentRef: ComponentRef<DataRequestDetailsRequestComponent>;
  let masterDataService: MockMasterDataService;

  beforeEach(async () => {
    masterDataService = createMockMasterDataService();

    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsRequestComponent],
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsRequestComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // Set required input before detectChanges
    componentRef.setInput('dataRequest', {
      id: 'test-id',
      dataProviderId: 'test-provider',
      submissionDate: '2026-01-09T10:00:00Z',
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    } as DataRequestDto);

    fixture.detectChanges();
  });

  describe('computed signals', () => {
    it('should compute formattedSubmissionDate correctly', () => {
      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        submissionDate: '2026-01-09T10:00:00Z',
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      } as DataRequestDto);
      fixture.detectChanges();

      expect(component['formattedSubmissionDate']()).toBeDefined();
      expect(component['formattedSubmissionDate']()).toContain('09.01.2026');
    });

    it('should compute productsList correctly', () => {
      const mockProducts: DataProductDto[] = [
        { id: 'product1', name: { de: 'Product 1' } },
        { id: 'product2', name: { de: 'Product 2' } },
        { id: 'product3', name: { de: 'Product 3' } },
      ];

      const productsByProvider = new Map<string, DataProductDto[]>();
      productsByProvider.set('test-provider', mockProducts);
      masterDataService.__testSignals.productsByProvider.set(productsByProvider);

      componentRef.setInput('dataRequest', {
        id: 'test-id',
        dataProviderId: 'test-provider',
        products: ['product1', 'product2'],
        stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      } as DataRequestDto);
      fixture.detectChanges();

      const productsList = component['productsList']();
      expect(productsList).toHaveLength(2);
      expect(productsList).toEqual([
        { id: 'product1', name: { de: 'Product 1' } },
        { id: 'product2', name: { de: 'Product 2' } },
      ]);
    });
  });

  describe('getStatusTranslation', () => {
    it('should return translated status for valid stateCode', () => {
      const result = component['getStatusTranslation'](
        ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
      );
      expect(result).toBeDefined();
    });

    it('should return empty string for undefined stateCode', () => {
      const result = component['getStatusTranslation']();
      expect(result).toBe('');
    });
  });
});
