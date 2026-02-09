import { signal, WritableSignal } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataProviderDto } from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockMasterDataServiceTestSignals = {
  dataProviders: WritableSignal<DataProviderDto[]>;
  isLoadingProducts: WritableSignal<boolean>;
  isProvidersLoading: WritableSignal<boolean>;
  productsByProvider: WritableSignal<Map<string, DataProductDto[]>>;
};

export type MockMasterDataService = MockifyWithWritableSignals<
  MasterDataService,
  MockMasterDataServiceTestSignals
>;

export function createMockMasterDataService(): MockMasterDataService {
  const dataProviders = signal<DataProviderDto[]>([]);
  const isLoadingProducts = signal(false);
  const isProvidersLoading = signal(false);
  const productsByProvider = signal<Map<string, DataProductDto[]>>(new Map());

  return {
    dataProviders,
    isLoadingProducts,
    isProvidersLoading,
    getProductsForProvider: jest.fn((providerId: string | undefined) => {
      if (!providerId) return [];
      return productsByProvider().get(providerId) ?? [];
    }),
    isLoadingProductsByProvider: jest.fn((providerId: string | undefined) => {
      if (!providerId) return false;
      return isLoadingProducts();
    }),
    fetchProductsByProvider: jest.fn(),
    __testSignals: { dataProviders, isLoadingProducts, isProvidersLoading, productsByProvider },
  } satisfies MockMasterDataService;
}
