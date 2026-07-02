import { TestBed } from '@angular/core/testing';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DocumentScanStatus } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  createMockAgridataStateService,
  createMockDataProductDocumentService,
  createMockI18nService,
  MockDataProductDocumentService,
} from '@/shared/testing/mocks';

import { DocumentUploadStatus } from './document-upload.model';
import { DocumentUploadStore } from './document-upload.store';

function pdf(name: string, sizeBytes = 1024): File {
  const file = new File(['content'], name, { type: 'application/pdf' });
  Object.defineProperty(file, 'size', { value: sizeBytes });
  return file;
}

describe('DocumentUploadStore', () => {
  let store: DocumentUploadStore;
  let documentService: MockDataProductDocumentService;

  beforeEach(() => {
    documentService = createMockDataProductDocumentService();

    TestBed.configureTestingModule({
      providers: [
        DocumentUploadStore,
        { provide: DataProductDocumentService, useValue: documentService },
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: I18nService, useValue: createMockI18nService() },
      ],
    });

    store = TestBed.inject(DocumentUploadStore);
  });

  describe('addFiles', () => {
    it('stages valid PDF files', () => {
      store.addFiles([pdf('a.pdf'), pdf('b.pdf')]);

      expect(store.items().map((item) => item.filename)).toEqual(['a.pdf', 'b.pdf']);
      expect(store.stagedItems()).toHaveLength(2);
      expect(store.validationError()).toBeNull();
    });

    it('rejects non-PDF files and sets a validation error', () => {
      const file = new File(['x'], 'image.png', { type: 'image/png' });

      store.addFiles([file]);

      expect(store.items()).toHaveLength(0);
      expect(store.validationError()).toBe('data-products.detailForm.documents.error.fileType');
    });

    it('rejects files larger than 10MB', () => {
      store.addFiles([pdf('big.pdf', 11 * 1024 * 1024)]);

      expect(store.items()).toHaveLength(0);
      expect(store.validationError()).toBe('data-products.detailForm.documents.error.tooLarge');
    });

    it('caps the total number of files at 5', () => {
      store.addFiles([pdf('1.pdf'), pdf('2.pdf'), pdf('3.pdf')]);
      store.addFiles([pdf('4.pdf'), pdf('5.pdf'), pdf('6.pdf')]);

      expect(store.items()).toHaveLength(5);
      expect(store.canAddMore()).toBe(false);
      expect(store.validationError()).toBe('data-products.detailForm.documents.error.maxFiles');
    });

    it('enforces the cap even when a document is marked for removal (still occupies a slot)', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: '1.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-2', fileName: '2.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-3', fileName: '3.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-4', fileName: '4.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-5', fileName: '5.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');
      store.removeItem(store.items()[0]);
      expect(store.canAddMore()).toBe(false);

      store.addFiles([pdf('replacement.pdf')]);

      expect(store.stagedItems()).toHaveLength(0);
      expect(store.validationError()).toBe('data-products.detailForm.documents.error.maxFiles');
    });
  });

  describe('removeItem', () => {
    it('removes a staged file immediately without calling the API', () => {
      store.addFiles([pdf('a.pdf')]);

      store.removeItem(store.items()[0]);

      expect(store.items()).toHaveLength(0);
      expect(documentService.deleteDocument).not.toHaveBeenCalled();
    });

    it('only marks an existing document for removal, without calling the API', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');

      store.removeItem(store.items()[0]);

      expect(documentService.deleteDocument).not.toHaveBeenCalled();
      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].markedForRemoval).toBe(true);
    });
  });

  describe('restoreItem', () => {
    it('clears the marked-for-removal flag', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');
      store.removeItem(store.items()[0]);

      store.restoreItem(store.items()[0]);

      expect(store.items()[0].markedForRemoval).toBe(false);
    });
  });

  describe('commitRemovals', () => {
    it('deletes every marked document and drops it from the list', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-2', fileName: 'b.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');
      store.removeItem(store.items()[0]);

      await store.commitRemovals('product-1');

      expect(documentService.deleteDocument).toHaveBeenCalledWith('product-1', 'doc-1', undefined);
      expect(documentService.deleteDocument).toHaveBeenCalledTimes(1);
      expect(store.items().map((item) => item.filename)).toEqual(['b.pdf']);
    });

    it('does nothing when no document is marked for removal', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');

      await store.commitRemovals('product-1');

      expect(documentService.deleteDocument).not.toHaveBeenCalled();
      expect(store.items()).toHaveLength(1);
    });

    it('keeps a marked document from blocking publishing', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.Rejected },
      ]);
      await store.loadExisting('product-1');
      expect(store.hasBlockingState()).toBe(true);

      store.removeItem(store.items()[0]);

      expect(store.hasBlockingState()).toBe(false);
      expect(store.hasUnreadyDocuments()).toBe(false);
    });
  });

  describe('loadExisting', () => {
    it('populates items from the server list', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.Available },
        { id: 'doc-2', fileName: 'b.pdf', scanStatus: DocumentScanStatus.PendingScan },
      ]);

      await store.loadExisting('product-1');

      expect(store.items().map((item) => item.filename)).toEqual(['a.pdf', 'b.pdf']);
      expect(store.items().every((item) => item.isExisting)).toBe(true);
    });

    it('resumes scan polling for documents still pending', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.PendingScan },
      ]);
      documentService.awaitDocumentProcessed.mockResolvedValue(DocumentScanStatus.Available);

      await store.loadExisting('product-1');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(documentService.awaitDocumentProcessed).toHaveBeenCalledWith(
        'product-1',
        'doc-1',
        undefined,
        expect.any(AbortSignal),
      );
      expect(store.items()[0].status).toBe(DocumentUploadStatus.Available);
    });
  });

  describe('stagedItems / uploadedItems', () => {
    it('partitions items by whether they already exist on the server', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');
      store.addFiles([pdf('new.pdf')]);

      expect(store.uploadedItems().map((item) => item.filename)).toEqual(['existing.pdf']);
      expect(store.stagedItems().map((item) => item.filename)).toEqual(['new.pdf']);
    });

    it('moves a file into uploadedItems as soon as the upload completes, before the scan finishes', async () => {
      documentService.uploadDocument.mockResolvedValue({
        id: 'doc-1',
        fileName: 'a.pdf',
        scanStatus: DocumentScanStatus.PendingScan,
      });
      // Scan never resolves so we observe the post-POST / pre-scan state.
      documentService.awaitDocumentProcessed.mockReturnValue(new Promise<never>(() => {}));
      store.addFiles([pdf('a.pdf')]);

      await store.uploadAll('product-1');

      expect(store.uploadedItems().map((item) => item.filename)).toEqual(['a.pdf']);
      expect(store.stagedItems()).toEqual([]);
      expect(store.uploadedItems()[0].status).toBe(DocumentUploadStatus.PendingScan);
    });
  });

  describe('downloadDocument', () => {
    it('delegates to the service with the data product and document id', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');

      await store.downloadDocument(store.items()[0]);

      expect(documentService.downloadDocument).toHaveBeenCalledWith(
        'product-1',
        'doc-1',
        undefined,
      );
    });

    it('rejects when the item has no id', async () => {
      store.addFiles([pdf('new.pdf')]);

      await expect(store.downloadDocument(store.items()[0])).rejects.toThrow();
      expect(documentService.downloadDocument).not.toHaveBeenCalled();
    });
  });

  describe('uploadAll', () => {
    it('uploads staged files and marks them available once scanned', async () => {
      documentService.uploadDocument.mockResolvedValue({
        id: 'doc-1',
        fileName: 'a.pdf',
        scanStatus: DocumentScanStatus.PendingScan,
      });
      documentService.awaitDocumentProcessed.mockResolvedValue(DocumentScanStatus.Available);
      store.addFiles([pdf('a.pdf')]);

      await store.uploadAll('product-1');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(documentService.uploadDocument).toHaveBeenCalledTimes(1);
      expect(store.hasUnreadyDocuments()).toBe(false);
      expect(store.hasBlockingState()).toBe(false);
    });

    it('marks a document blocking when it is rejected', async () => {
      documentService.uploadDocument.mockResolvedValue({
        id: 'doc-1',
        fileName: 'a.pdf',
        scanStatus: DocumentScanStatus.PendingScan,
      });
      documentService.awaitDocumentProcessed.mockResolvedValue(DocumentScanStatus.Rejected);
      store.addFiles([pdf('a.pdf')]);

      await store.uploadAll('product-1');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(store.hasBlockingState()).toBe(true);
      expect(store.hasUnreadyDocuments()).toBe(true);
    });

    it('marks a document blocking when the scan fails', async () => {
      documentService.uploadDocument.mockResolvedValue({
        id: 'doc-1',
        fileName: 'a.pdf',
        scanStatus: DocumentScanStatus.PendingScan,
      });
      documentService.awaitDocumentProcessed.mockResolvedValue(DocumentScanStatus.ScanFailed);
      store.addFiles([pdf('a.pdf')]);

      await store.uploadAll('product-1');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(store.hasBlockingState()).toBe(true);
    });

    it('marks a document as error when the upload throws', async () => {
      documentService.uploadDocument.mockRejectedValue(new Error('network'));
      store.addFiles([pdf('a.pdf')]);

      await store.uploadAll('product-1');

      expect(store.hasBlockingState()).toBe(true);
    });

    it('does not re-upload existing documents', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'existing.pdf', scanStatus: DocumentScanStatus.Available },
      ]);
      await store.loadExisting('product-1');

      await store.uploadAll('product-1');

      expect(store.hasUnreadyDocuments()).toBe(false);
      expect(documentService.uploadDocument).not.toHaveBeenCalled();
    });

    it('uploads staged files concurrently rather than serializing behind the first scan', async () => {
      documentService.uploadDocument.mockResolvedValue({
        id: 'doc-1',
        fileName: 'x.pdf',
        scanStatus: DocumentScanStatus.PendingScan,
      });
      // The first document's scan never resolves during the test; concurrent uploads must still
      // POST the second file.
      documentService.awaitDocumentProcessed.mockReturnValueOnce(new Promise<never>(() => {}));
      documentService.awaitDocumentProcessed.mockResolvedValue(DocumentScanStatus.Available);
      store.addFiles([pdf('a.pdf'), pdf('b.pdf')]);

      void store.uploadAll('product-1');
      await new Promise<void>((resolve) => setTimeout(resolve, 0));

      expect(documentService.uploadDocument).toHaveBeenCalledTimes(2);
    });
  });

  describe('polling lifecycle', () => {
    it('aborts in-flight scan polling when the store is destroyed', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.PendingScan },
      ]);
      documentService.awaitDocumentProcessed.mockReturnValue(new Promise<never>(() => {}));

      await store.loadExisting('product-1');

      const signal = documentService.awaitDocumentProcessed.mock.calls[0][3];
      expect(signal?.aborted).toBe(false);

      TestBed.resetTestingModule();

      expect(signal?.aborted).toBe(true);
    });
  });

  describe('hasUnreadyDocuments', () => {
    it('is false when there are no documents', () => {
      expect(store.hasUnreadyDocuments()).toBe(false);
    });

    it('is true while a document is not yet available', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.PendingScan },
      ]);
      documentService.awaitDocumentProcessed.mockReturnValue(new Promise<never>(() => {}));

      await store.loadExisting('product-1');

      expect(store.hasUnreadyDocuments()).toBe(true);
    });

    it('is false once every document is available', async () => {
      documentService.listDocuments.mockResolvedValueOnce([
        { id: 'doc-1', fileName: 'a.pdf', scanStatus: DocumentScanStatus.Available },
      ]);

      await store.loadExisting('product-1');

      expect(store.hasUnreadyDocuments()).toBe(false);
    });
  });
});
