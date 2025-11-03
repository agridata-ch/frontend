import { EffectRef, signal, WritableSignal } from '@angular/core';

import { MetaDataService } from '@/entities/api/meta-data-service';
import { DataProductDto } from '@/entities/openapi';
import { MockifyWithWritableSignals } from '@/shared/testing/mocks/test-model';

export type MockMetaDataServiceTestSignals = {
  dataProducts: WritableSignal<Array<DataProductDto>>;
};

export type MockMetaDataService = MockifyWithWritableSignals<
  MetaDataService,
  MockMetaDataServiceTestSignals
>;

export function createMockMetadataService(): MockMetaDataService {
  const dataProducts = signal<Array<DataProductDto>>([]);

  const dataProductFetchEffect: EffectRef = { destroy: jest.fn() };

  return {
    getDataProducts: jest.fn(() => dataProducts.asReadonly()),
    dataProductFetchEffect,
    // used to override read only signals in tests
    __testSignals: { dataProducts },
  } satisfies MockMetaDataService;
}
