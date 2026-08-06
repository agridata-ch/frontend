import { signal, WritableSignal } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import {
  DataProductDto,
  DataProviderDto,
  TranslationDto,
  UserPreferencesDto,
} from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks';
import { MultiSelectCategory } from '@/shared/ui/agridata-multi-select';

export type MockMasterDataServiceTestSignals = {
  dataProducts: WritableSignal<Array<DataProductDto>>;
  dataProductsCategories: WritableSignal<Array<{ label: string; value: string }>>;
  dataProductsGrouped: WritableSignal<Array<MultiSelectCategory>>;
  dataProviders: WritableSignal<Array<DataProviderDto>>;
  productsByProvider: WritableSignal<Map<string, DataProductDto[]>>;
  providersLoading: WritableSignal<boolean>;
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
  const providersLoading = signal<boolean>(false);
  const userPreferences = signal(undefined);

  const getProductsForProvider = jest.fn((providerId: string) => {
    // First try the new productsByProvider map
    if (providerId && productsByProvider().has(providerId)) {
      return productsByProvider().get(providerId) ?? [];
    }
    // Fallback to legacy dataProducts signal for backwards compatibility
    return dataProducts();
  });

  const providerName = jest.fn((providerId: string | undefined, lang?: string) => {
    const provider = dataProviders().find((candidate) => candidate.id === providerId);
    return provider?.name?.[(lang ?? 'de') as keyof TranslationDto] ?? '';
  });

  return {
    dataProviders,
    fetchProductsByProvider: jest.fn(),
    getProductsForProvider,
    providerName,
    providersLoading,
    __testSignals: {
      dataProducts,
      dataProductsCategories,
      dataProductsGrouped,
      dataProviders,
      productsByProvider,
      providersLoading,
      userPreferences,
    },
  } satisfies MockMasterDataService;
}
