import { HttpEventType, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import {
  DataProductDocumentMetadataDto,
  DataProductsService,
  DocumentScanStatusEnum,
} from '@/entities/openapi';

import { DataProductDocumentService } from './data-product-document.service';

const available: DataProductDocumentMetadataDto = {
  id: 'doc-1',
  fileName: 'a.pdf',
  scanStatus: DocumentScanStatusEnum.Available,
  sizeBytes: 50,
};

function createMockApiService() {
  return {
    addDataProductDocument: jest.fn().mockReturnValue(of(new HttpResponse({ body: available }))),
    getDataProductDocumentsMetadata: jest.fn().mockReturnValue(of([available])),
    getDataProductDocumentMetadata: jest.fn().mockReturnValue(of(available)),
    getDataProductDocument: jest.fn().mockReturnValue(of(new Blob())),
    deleteDataProductDocument: jest.fn().mockReturnValue(of({})),
  };
}

describe('DataProductDocumentService', () => {
  let service: DataProductDocumentService;
  let apiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    apiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [
        DataProductDocumentService,
        { provide: DataProductsService, useValue: apiService },
      ],
    });

    service = TestBed.inject(DataProductDocumentService);
  });

  describe('uploadDocument', () => {
    it('delegates to addDataProductDocument, reports progress and resolves with the document', async () => {
      const file = new File(['pdf'], 'a.pdf', { type: 'application/pdf' });
      const onProgress = jest.fn();
      apiService.addDataProductDocument.mockReturnValue(
        of(
          { type: HttpEventType.UploadProgress, loaded: 50, total: 100 },
          new HttpResponse({ body: available }),
        ),
      );

      const result = await service.uploadDocument('product-1', file, 'PROVIDER', onProgress);

      expect(apiService.addDataProductDocument).toHaveBeenCalledWith(
        'product-1',
        'PROVIDER',
        file,
        'events',
        true,
      );
      expect(onProgress).toHaveBeenCalledWith(50);
      expect(result).toEqual(available);
    });
  });

  describe('awaitDocumentProcessed', () => {
    it('long-polls and resolves with the terminal scan status', async () => {
      const result = await service.awaitDocumentProcessed('product-1', 'doc-1', 'PROVIDER');

      expect(apiService.getDataProductDocumentMetadata).toHaveBeenCalledWith(
        'doc-1',
        'product-1',
        true,
        'PROVIDER',
      );
      expect(result).toBe(DocumentScanStatusEnum.Available);
    });

    it('resolves with REJECTED without waiting further', async () => {
      apiService.getDataProductDocumentMetadata.mockReturnValue(
        of({ ...available, scanStatus: DocumentScanStatusEnum.Rejected }),
      );

      const result = await service.awaitDocumentProcessed('product-1', 'doc-1');

      expect(result).toBe(DocumentScanStatusEnum.Rejected);
    });

    it('stops polling immediately when the abort signal is already aborted', async () => {
      const controller = new AbortController();
      controller.abort();

      const result = await service.awaitDocumentProcessed(
        'product-1',
        'doc-1',
        'PROVIDER',
        controller.signal,
      );

      expect(apiService.getDataProductDocumentMetadata).not.toHaveBeenCalled();
      expect(result).toBe(DocumentScanStatusEnum.PendingScan);
    });

    it('retries after a transient failure instead of failing the scan', async () => {
      jest.useFakeTimers();
      apiService.getDataProductDocumentMetadata
        .mockReturnValueOnce(throwError(() => new Error('network')))
        .mockReturnValue(of(available));

      const resultPromise = service.awaitDocumentProcessed('product-1', 'doc-1');
      // Let the failing poll settle, then advance past the poll interval so it retries.
      await jest.advanceTimersByTimeAsync(2000);

      await expect(resultPromise).resolves.toBe(DocumentScanStatusEnum.Available);
      expect(apiService.getDataProductDocumentMetadata).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  });

  describe('getDocument with abort signal', () => {
    it('rejects and cancels the in-flight request when aborted', async () => {
      const unsubscribe = jest.fn();
      apiService.getDataProductDocumentMetadata.mockReturnValue({
        subscribe: () => ({ unsubscribe }),
      });
      const controller = new AbortController();

      const pending = service.getDocument(
        'product-1',
        'doc-1',
        'PROVIDER',
        true,
        controller.signal,
      );
      controller.abort();

      await expect(pending).rejects.toThrow('Aborted');
      expect(unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe('listDocuments', () => {
    it('fetches the document collection', async () => {
      const result = await service.listDocuments('product-1', 'ADMIN');

      expect(apiService.getDataProductDocumentsMetadata).toHaveBeenCalledWith('product-1', 'ADMIN');
      expect(result).toHaveLength(1);
    });
  });

  describe('getDocument', () => {
    it('fetches a single document without long-polling by default', async () => {
      await service.getDocument('product-1', 'doc-1', 'PROVIDER');

      expect(apiService.getDataProductDocumentMetadata).toHaveBeenCalledWith(
        'doc-1',
        'product-1',
        false,
        'PROVIDER',
      );
    });
  });

  describe('downloadDocument', () => {
    it('downloads the document as a blob', async () => {
      const result = await service.downloadDocument('product-1', 'doc-1', 'PROVIDER');

      expect(apiService.getDataProductDocument).toHaveBeenCalledWith(
        'doc-1',
        'product-1',
        'PROVIDER',
        undefined,
        undefined,
        { httpHeaderAccept: 'application/octet-stream' },
      );
      expect(result).toBeInstanceOf(Blob);
    });
  });

  describe('deleteDocument', () => {
    it('deletes a document', async () => {
      await service.deleteDocument('product-1', 'doc-1', 'PROVIDER');

      expect(apiService.deleteDataProductDocument).toHaveBeenCalledWith(
        'doc-1',
        'product-1',
        'PROVIDER',
      );
    });
  });
});
