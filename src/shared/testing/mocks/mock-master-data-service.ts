import { signal, WritableSignal } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, UserPreferencesDto } from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockMasterDataServiceTestSignals = {
  dataProducts: WritableSignal<Array<DataProductDto>>;
  userPreferences: WritableSignal<undefined | UserPreferencesDto>;
};

export type MockMasterDataService = MockifyWithWritableSignals<
  MasterDataService,
  MockMasterDataServiceTestSignals
>;

export function createMockMasterDataService(): MockMasterDataService {
  const dataProducts = signal<Array<DataProductDto>>([]);
  const userPreferences = signal(undefined);

  return {
    dataProducts,
    // used to override read only signals in tests
    __testSignals: { dataProducts, userPreferences },
  } satisfies MockMasterDataService;
}
