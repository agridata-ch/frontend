import { signal, WritableSignal } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, UserPreferencesDto } from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';
import { MultiSelectCategory, MultiSelectOption } from '@/shared/ui/agridata-multi-select';

export type MockMasterDataServiceTestSignals = {
  dataProducts: WritableSignal<Array<DataProductDto>>;
  dataProductsCategories: WritableSignal<Array<{ label: string; value: string }>>;
  dataProductsGrouped: WritableSignal<Array<MultiSelectCategory>>;
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
  const userPreferences = signal(undefined);

  return {
    dataProducts,
    dataProductsCategories,
    dataProductsGrouped,
    getDataProductsByCategory: jest.fn().mockReturnValue([] as MultiSelectOption[]),
    getDataProductsGroupedByCategory: jest.fn().mockReturnValue([] as MultiSelectCategory[]),
    __testSignals: { dataProducts, dataProductsCategories, dataProductsGrouped, userPreferences },
  } satisfies MockMasterDataService;
}
