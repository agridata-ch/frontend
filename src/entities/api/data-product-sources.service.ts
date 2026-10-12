import { inject, Service } from '@angular/core';

import { DataProductDocumentMetadataDto, PublicDataProductDto } from '@/entities/openapi';

import { DataProductDocumentService } from './data-product-document.service';
import { DataProductService } from './data-product.service';

/** Where a data product and its documents are read from. */
export interface DataProductSource {
  downloadDocument: (productId: string, documentId: string) => Promise<Blob>;
  getProduct: (productId: string) => Promise<PublicDataProductDto>;
  listDocuments: (productId: string) => Promise<DataProductDocumentMetadataDto[]>;
}

/**
 * Provides the read sources for displaying a single data product: the public endpoints (data
 * catalog) and the authenticated ones (producers may read all active products). Lets a view stay
 * agnostic of which API it is talking to.
 *
 * CommentLastReviewed: 2026-10-12
 */
@Service()
export class DataProductSourcesService {
  private readonly dataProductService = inject(DataProductService);
  private readonly documentService = inject(DataProductDocumentService);

  readonly internalSource: DataProductSource = {
    downloadDocument: (productId, documentId) =>
      this.documentService.downloadDocument(productId, documentId),
    getProduct: (productId) => this.dataProductService.getDataProductById(productId),
    listDocuments: (productId) => this.documentService.listDocuments(productId),
  };

  readonly publicSource: DataProductSource = {
    downloadDocument: (productId, documentId) =>
      this.documentService.downloadDocumentPublic(productId, documentId),
    getProduct: (productId) => this.dataProductService.getPublicProductById(productId),
    listDocuments: (productId) => this.documentService.listDocumentsPublic(productId),
  };
}
