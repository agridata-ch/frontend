import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export type MockDataProductService = Mockify<DataProductService>;

/**
 * Factory that creates a strict mock implementation of DataProductService for tests.
 *
 * CommentLastReviewed: 2026-05-19
 */
export function createMockDataProductService(): MockDataProductService {
  return {
    getAllDataProducts: jest.fn().mockResolvedValue({
      items: [] as DataProductDto[],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    }),
  } satisfies MockDataProductService;
}
