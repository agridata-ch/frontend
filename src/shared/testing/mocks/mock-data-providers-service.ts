import { DataProvidersService } from '@/entities/api/data-providers.service';
import { DataSourceSystemDto, RestClientDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export type MockDataProvidersService = Mockify<DataProvidersService>;

/**
 * Factory that creates a strict mock implementation of DataProvidersService for tests.
 *
 * CommentLastReviewed: 2026-06-09
 */
export function createMockDataProvidersService(): MockDataProvidersService {
  return {
    getDataProviders: vi.fn().mockResolvedValue([]),
    getDataSourceSystems: vi.fn().mockResolvedValue([] as DataSourceSystemDto[]),
    getRestClients: vi.fn().mockResolvedValue([] as RestClientDto[]),
  } satisfies MockDataProvidersService;
}
