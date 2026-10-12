import { TestBed } from '@angular/core/testing';

import {
  createMockDataProductDocumentService,
  createMockDataProductService,
  MockDataProductDocumentService,
  MockDataProductService,
} from '@/shared/testing/mocks';

import { DataProductDocumentService } from './data-product-document.service';
import { DataProductSourcesService } from './data-product-sources.service';
import { DataProductService } from './data-product.service';

describe('DataProductSourcesService', () => {
  let service: DataProductSourcesService;
  let dataProductService: MockDataProductService;
  let documentService: MockDataProductDocumentService;

  beforeEach(() => {
    dataProductService = createMockDataProductService();
    documentService = createMockDataProductDocumentService();
    TestBed.configureTestingModule({
      providers: [
        { provide: DataProductService, useValue: dataProductService },
        { provide: DataProductDocumentService, useValue: documentService },
      ],
    });
    service = TestBed.inject(DataProductSourcesService);
  });

  describe('publicSource', () => {
    it('reads through the public endpoints', async () => {
      await service.publicSource.getProduct('p1');
      await service.publicSource.listDocuments('p1');
      await service.publicSource.downloadDocument('p1', 'd1');

      expect(dataProductService.getPublicProductById).toHaveBeenCalledWith('p1');
      expect(documentService.listDocumentsPublic).toHaveBeenCalledWith('p1');
      expect(documentService.downloadDocumentPublic).toHaveBeenCalledWith('p1', 'd1');
      expect(dataProductService.getDataProductById).not.toHaveBeenCalled();
    });
  });

  describe('internalSource', () => {
    it('reads through the authenticated endpoints', async () => {
      await service.internalSource.getProduct('p1');
      await service.internalSource.listDocuments('p1');
      await service.internalSource.downloadDocument('p1', 'd1');

      expect(dataProductService.getDataProductById).toHaveBeenCalledWith('p1');
      expect(documentService.listDocuments).toHaveBeenCalledWith('p1');
      expect(documentService.downloadDocument).toHaveBeenCalledWith('p1', 'd1');
      expect(dataProductService.getPublicProductById).not.toHaveBeenCalled();
    });
  });
});
