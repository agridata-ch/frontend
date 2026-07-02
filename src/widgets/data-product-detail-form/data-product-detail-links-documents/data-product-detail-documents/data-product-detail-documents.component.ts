import { Component, inject, input, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { I18nDirective } from '@/shared/i18n';
import { AgridataDropzoneComponent } from '@/shared/ui/agridata-dropzone';
import { BadgeVariant } from '@/shared/ui/badge';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';
import { ProgressBarComponent } from '@/shared/ui/progress-bar';
import { downloadBlob, openBlobInNewTab } from '@/shared/utils';
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
  private readonly downloadingIds = signal<ReadonlySet<string>>(new Set());
  private readonly openingIds = signal<ReadonlySet<string>>(new Set());

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
    if (this.isDownloading(item)) return;
    this.toggleLoading(this.downloadingIds, item.localId, true);
    this.store
      .downloadDocument(item)
      .then((blob) => downloadBlob(blob, item.filename))
      .catch((error) => this.errorHandler.handleError(error))
      .finally(() => this.toggleLoading(this.downloadingIds, item.localId, false));
  }

  protected handleOpen(item: DocumentUploadItem): void {
    if (this.isOpening(item)) return;
    this.toggleLoading(this.openingIds, item.localId, true);
    this.store
      .downloadDocument(item)
      .then((blob) => openBlobInNewTab(blob, 'application/pdf'))
      .catch((error) => this.errorHandler.handleError(error))
      .finally(() => this.toggleLoading(this.openingIds, item.localId, false));
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

  protected isDownloading(item: DocumentUploadItem): boolean {
    return this.downloadingIds().has(item.localId);
  }

  protected isOpening(item: DocumentUploadItem): boolean {
    return this.openingIds().has(item.localId);
  }

  protected isScanning(item: DocumentUploadItem): boolean {
    return item.status === DocumentUploadStatus.PendingScan;
  }

  protected isUploading(item: DocumentUploadItem): boolean {
    return item.status === DocumentUploadStatus.Uploading;
  }

  private toggleLoading(
    ids: ReturnType<typeof signal<ReadonlySet<string>>>,
    localId: string,
    loading: boolean,
  ): void {
    ids.update((current) => {
      const next = new Set(current);
      if (loading) {
        next.add(localId);
      } else {
        next.delete(localId);
      }
      return next;
    });
  }
}
