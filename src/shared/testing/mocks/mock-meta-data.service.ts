import { MetaDataService } from '@/entities/api/meta-data-service';
import { MockResources } from '@/shared/testing/mocks/mock-resources';

export const mockMetadataService: Partial<MetaDataService> = {
  fetchDataProducts: MockResources.createMockResourceRef([]),
};
