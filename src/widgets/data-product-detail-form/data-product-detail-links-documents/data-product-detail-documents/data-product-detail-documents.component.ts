import { Component, inject, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective } from '@/shared/i18n';
import { createDocumentDownloadHandler } from '@/shared/lib/document-download.helper';
import { AgridataDropzoneComponent } from '@/shared/ui/agridata-dropzone';
import { BadgeVariant } from '@/shared/ui/badge';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';
import { ProgressBarComponent } from '@/shared/ui/progress-bar';
import {
  DocumentUploadStore,
  DocumentUploadItem,
  DocumentUploadStatus,
} from '@/widgets/data-product-detail-form/data-product-detail-links-documents';

/**
 * Tab component for the links and documents of a data product. Renders a PDF dropzone plus two
 * lists: newly staged files (with upload progress) and previously uploaded documents (with open /
 * download / remove actions). Upload itself is triggered from the parent form's save flow via the
 * shared DocumentUploadStore.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Component({
  selector: 'app-data-product-detail-documents',
  imports: [
    AgridataDropzoneComponent,
    AgridataFileDownloadComponent,
    I18nDirective,
    ProgressBarComponent,
  ],
  templateUrl: './data-product-detail-documents.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailDocumentsComponent {
  // Injects
  protected readonly store = inject(DocumentUploadStore);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Constants
  protected readonly BadgeVariant = BadgeVariant;

  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);

  // Signals
  protected readonly downloads = createDocumentDownloadHandler(this.errorHandler);

  protected badgeVariant(status: DocumentUploadStatus): BadgeVariant {
    switch (status) {
      case DocumentUploadStatus.Available:
        return BadgeVariant.SUCCESS;
      case DocumentUploadStatus.PendingScan:
        return BadgeVariant.WARNING;
      case DocumentUploadStatus.Rejected:
      case DocumentUploadStatus.Error:
        return BadgeVariant.ERROR;
      default:
        return BadgeVariant.LIGHT;
    }
  }

  protected handleDownload(item: DocumentUploadItem): void {
    this.downloads.download(item.localId, item.filename, () => this.store.downloadDocument(item));
  }

  protected handleOpen(item: DocumentUploadItem): void {
    this.downloads.open(item.localId, () => this.store.downloadDocument(item));
  }

  protected handleRemove(item: DocumentUploadItem): void {
    this.store.removeItem(item);
  }

  protected handleRestore(item: DocumentUploadItem): void {
    this.store.restoreItem(item);
  }

  protected isDownloadable(item: DocumentUploadItem): boolean {
    return item.isExisting && item.status === DocumentUploadStatus.Available;
  }

  protected isScanning(item: DocumentUploadItem): boolean {
    return item.status === DocumentUploadStatus.PendingScan;
  }

  protected isUploading(item: DocumentUploadItem): boolean {
    return item.status === DocumentUploadStatus.Uploading;
  }
}
