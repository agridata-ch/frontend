import { signal, WritableSignal } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataProviderDto, UserPreferencesDto } from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';
import { MultiSelectCategory } from '@/shared/ui/agridata-multi-select';

export type MockMasterDataServiceTestSignals = {
  dataProducts: WritableSignal<Array<DataProductDto>>;
  dataProductsCategories: WritableSignal<Array<{ label: string; value: string }>>;
  dataProductsGrouped: WritableSignal<Array<MultiSelectCategory>>;
  dataProviders: WritableSignal<Array<DataProviderDto>>;
  productsByProvider: WritableSignal<Map<string, DataProductDto[]>>;
  userPreferences: WritableSignal<undefined | UserPreferencesDto>;
};

export type MockMasterDataService = MockifyWithWritableSignals<
  MasterDataService,
  MockMasterDataServiceTestSignals
>;

export function createMockMasterDataService(): MockMasterDataService {
  const dataProducts = signal<Array<DataProductDto>>([]);
  const dataProductsCategories = signal<Array<{ label: string; value: string }>>([]);
  const dataProductsGrouped = signal<Array<MultiSelectCategory>>([]);
  const dataProviders = signal<Array<DataProviderDto>>([]);
  const productsByProvider = signal<Map<string, DataProductDto[]>>(new Map());
  const userPreferences = signal(undefined);

  const getProductsForProvider = jest.fn((providerId: string) => {
    // First try the new productsByProvider map
    if (providerId && productsByProvider().has(providerId)) {
      return productsByProvider().get(providerId) ?? [];
    }
    // Fallback to legacy dataProducts signal for backwards compatibility
    return dataProducts();
  });

  return {
    dataProviders,
    fetchProductsByProvider: jest.fn(),
    getProductsForProvider,
    __testSignals: {
      dataProducts,
      dataProductsCategories,
      dataProductsGrouped,
      dataProviders,
      productsByProvider,
      userPreferences,
    },
  } satisfies MockMasterDataService;
}
