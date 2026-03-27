import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractRevisionService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataProductDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import {
  createMockContractRevisionService,
  mockContractRevision,
  MockContractRevisionService,
} from '@/shared/testing/mocks/mock-contract-revision-service';
import {
  createMockMasterDataService,
  MockMasterDataService,
} from '@/shared/testing/mocks/mock-master-data-service';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { DataRequestCompletionComponent } from './data-request-completion.component';

const mockDataRequest: DataRequestDto = {
  id: 'dr-1',
  stateCode: 'ToBeSigned',
  humanFriendlyId: 'DR-001',
  submissionDate: '2026-03-01T10:00:00Z',
  dataProviderId: 'provider-1',
  products: ['product-1'],
  currentContractRevisionId: 'cr-1',
};

const mockDataProduct: DataProductDto = {
  id: 'product-1',
  name: { de: 'Produkt A', fr: 'Produit A', it: 'Prodotto A' },
};

describe('DataRequestCompletionComponent', () => {
  let component: DataRequestCompletionComponent;
  let componentRef: ComponentRef<DataRequestCompletionComponent>;
  let fixture: ComponentFixture<DataRequestCompletionComponent>;
  let contractRevisionService: MockContractRevisionService;
  let masterDataService: MockMasterDataService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    contractRevisionService = createMockContractRevisionService();
    masterDataService = createMockMasterDataService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataRequestCompletionComponent, createTranslocoTestingModule()],
      providers: [
        { provide: ContractRevisionService, useValue: contractRevisionService },
        { provide: MasterDataService, useValue: masterDataService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestCompletionComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('dataRequest', mockDataRequest);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('contractResource', () => {
    it('should call fetchContract when currentContractRevisionId is set', async () => {
      await fixture.whenStable();
      expect(contractRevisionService.fetchContract).toHaveBeenCalledWith('cr-1');
    });

    it('should not call fetchContract when currentContractRevisionId is not set', async () => {
      contractRevisionService.fetchContract = jest.fn();
      const localFixture = TestBed.createComponent(DataRequestCompletionComponent);
      localFixture.componentRef.setInput('dataRequest', {
        ...mockDataRequest,
        currentContractRevisionId: undefined,
      });
      localFixture.detectChanges();
      await localFixture.whenStable();
      expect(contractRevisionService.fetchContract).not.toHaveBeenCalled();
    });

    it('should expose the fetched contract via contract()', async () => {
      await fixture.whenStable();
      expect(component['contract']()).toEqual(mockContractRevision);
    });
  });

  describe('dataRequestProducts', () => {
    it('should return products matching the data request product ids', () => {
      masterDataService.__testSignals.productsByProvider.set(
        new Map([['provider-1', [mockDataProduct]]]),
      );
      fixture.detectChanges();
      const products = component['dataRequestProducts']();
      expect(products).toHaveLength(1);
      expect(products[0].id).toBe('product-1');
    });

    it('should return empty array when no provider id is set', () => {
      componentRef.setInput('dataRequest', { ...mockDataRequest, dataProviderId: undefined });
      fixture.detectChanges();
      expect(component['dataRequestProducts']()).toEqual([]);
    });

    it('should filter out products not in the data request', () => {
      const otherProduct: DataProductDto = { id: 'product-99', name: { de: 'Other' } };
      masterDataService.__testSignals.productsByProvider.set(
        new Map([['provider-1', [mockDataProduct, otherProduct]]]),
      );
      fixture.detectChanges();
      const products = component['dataRequestProducts']();
      expect(products.map((p) => p.id)).toEqual(['product-1']);
    });
  });

  describe('formattedSubmissionDate', () => {
    it('should return a formatted date string for a valid submission date', () => {
      const result = component['formattedSubmissionDate']();
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('getStatusTranslation', () => {
    it('should return translated status code', () => {
      component['getStatusTranslation']('ToBeSigned');
      expect(i18nService.translate).toHaveBeenCalledWith('data-request.stateCode.ToBeSigned');
    });

    it('should return empty string when value is undefined', () => {
      expect(component['getStatusTranslation'](undefined)).toBe('');
    });
  });
});
