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
    createDataProduct: vi.fn().mockResolvedValue({}),
    deleteDataProduct: vi.fn().mockResolvedValue(undefined),
    getAllDataProducts: vi.fn().mockResolvedValue({
      items: [] as DataProductDto[],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    }),
    getDataProductById: vi.fn().mockResolvedValue({}),
    getPublicProducts: vi.fn().mockResolvedValue({
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 12,
    }),
    getPublicProductById: vi.fn().mockResolvedValue({}),
    patchDataProduct: vi.fn().mockResolvedValue({}),
    setDataProductStatus: vi.fn().mockResolvedValue({}),
    updateDataProduct: vi.fn().mockResolvedValue({}),
  } satisfies MockDataProductService;
}
