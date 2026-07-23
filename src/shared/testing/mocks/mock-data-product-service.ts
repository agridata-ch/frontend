import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export type MockDataProductService = Mockify<DataProductService>;

/**
 * Factory that creates a strict mock implementation of DataProductService for tests.
 *
 * CommentLastReviewed: 2026-06-08
 */
export function createMockDataProductService(): MockDataProductService {
  return {
    createDataProduct: jest.fn().mockResolvedValue({}),
    getAllDataProducts: jest.fn().mockResolvedValue({
      items: [] as DataProductDto[],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    }),
    getDataProductById: jest.fn().mockResolvedValue({}),
    patchDataProduct: jest.fn().mockResolvedValue({}),
    setDataProductStatus: jest.fn().mockResolvedValue({}),
    updateDataProduct: jest.fn().mockResolvedValue({}),
  } satisfies MockDataProductService;
}
