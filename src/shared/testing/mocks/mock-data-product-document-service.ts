import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DocumentScanStatusEnum } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export type MockDataProductDocumentService = Mockify<DataProductDocumentService>;

/**
 * Factory that creates a strict mock implementation of DataProductDocumentService for tests.
 *
 * CommentLastReviewed: 2026-07-13
 */
export function createMockDataProductDocumentService(): MockDataProductDocumentService {
  return {
    awaitDocumentProcessed: vi.fn().mockResolvedValue(DocumentScanStatusEnum.Available),
    deleteDocument: vi.fn().mockResolvedValue(undefined),
    downloadDocument: vi.fn().mockResolvedValue(new Blob()),
    getDocument: vi.fn().mockResolvedValue({}),
    listDocuments: vi.fn().mockResolvedValue([]),
    uploadDocument: vi.fn().mockResolvedValue({}),
  } satisfies MockDataProductDocumentService;
}
