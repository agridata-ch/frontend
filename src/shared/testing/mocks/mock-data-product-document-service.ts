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
    awaitDocumentProcessed: jest.fn().mockResolvedValue(DocumentScanStatusEnum.Available),
    deleteDocument: jest.fn().mockResolvedValue(undefined),
    downloadDocument: jest.fn().mockResolvedValue(new Blob()),
    getDocument: jest.fn().mockResolvedValue({}),
    listDocuments: jest.fn().mockResolvedValue([]),
    uploadDocument: jest.fn().mockResolvedValue({}),
  } satisfies MockDataProductDocumentService;
}
