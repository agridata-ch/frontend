import { computed, DestroyRef, inject, Service, signal } from '@angular/core';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DataProductDocumentMetadataDto, DocumentScanStatusEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';

import { DocumentUploadItem, DocumentUploadStatus } from './document-upload.model';

/**
 * Component-scoped store that owns the staged/uploaded document list for a data product. Handles
 * client-side validation (PDF only, size, count), loading existing documents, removing documents
 * and orchestrating the upload + scan-status polling. Provided at the detail form so the tab and
 * the parent form share one instance.
 *
 * CommentLastReviewed: 2026-08-03
 */
@Service()
export class DocumentUploadStore {
  // Injects
  private readonly destroyRef = inject(DestroyRef);
  private readonly documentService = inject(DataProductDocumentService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  private readonly acceptedMimeType = 'application/pdf';
  private readonly maxFiles = 5;
  private readonly maxSizeBytes = 10 * 1024 * 1024;

  // Aborts every in-flight scan long-poll when the panel (and this component-scoped store) is
  // destroyed, so no polling continues in the background after the side panel is closed.
  private readonly abortController = new AbortController();

  // In-flight scan long-polls per item, so the save flow can await them via `awaitPendingScans`.
  private readonly pendingScans = new Map<string, Promise<void>>();

  // Signals
  private readonly _dataProductId = signal<string | null>(null);
  private readonly _items = signal<DocumentUploadItem[]>([]);
  private readonly _validationError = signal<string | null>(null);
  private localIdCounter = 0;

  readonly items = this._items.asReadonly();
  readonly validationError = this._validationError.asReadonly();

  // Computed Signals
  // Counts every item (staged + existing, including those marked for removal): a marked document
  // still occupies a backend slot until the save commits its deletion, and it can be restored, so
  // it must count toward the max. Keeping the total <= maxFiles also keeps the save-time backend
  // peak (uploads happen before deletes) within the limit.
  readonly canAddMore = computed(() => this._items().length < this.maxFiles);

  readonly hasBlockingState = computed(() =>
    this._items().some(
      (item) =>
        !item.markedForRemoval &&
        (item.status === DocumentUploadStatus.Rejected ||
          item.status === DocumentUploadStatus.Error),
    ),
  );

  // True while any document is not yet AVAILABLE (staged, uploading, scanning or blocked). Used to
  // gate publishing and to mark the tab invalid; evaluate it after `awaitPendingScans` so a document
  // that is merely still being scanned does not read as unready. Documents staged for removal are
  // ignored since they are about to be deleted.
  readonly hasUnreadyDocuments = computed(() =>
    this._items().some(
      (item) => !item.markedForRemoval && item.status !== DocumentUploadStatus.Available,
    ),
  );

  // Newly added files coupled with the dropzone (not yet persisted, or failed to persist).
  readonly stagedItems = computed(() => this._items().filter((item) => !item.isExisting));

  // Previously uploaded documents (loaded from the server or successfully uploaded this session).
  readonly uploadedItems = computed(() => this._items().filter((item) => item.isExisting));

  // Effects
  private readonly stopPollingOnDestroy = this.destroyRef.onDestroy(() =>
    this.abortController.abort(),
  );

  addFiles(files: File[]): void {
    this._validationError.set(null);
    const accepted: DocumentUploadItem[] = [];

    for (const file of files) {
      if (file.type !== this.acceptedMimeType) {
        this.setValidationError('fileType', { fileName: file.name });
        continue;
      }
      if (file.size > this.maxSizeBytes) {
        this.setValidationError('tooLarge', { fileName: file.name, maxSize: '10MB' });
        continue;
      }
      // Count every existing/staged item (including those marked for removal) so the total never
      // exceeds the backend limit; this matches `canAddMore`, which gates the dropzone.
      if (this._items().length + accepted.length >= this.maxFiles) {
        this.setValidationError('maxFiles', { max: this.maxFiles });
        break;
      }
      accepted.push(this.createStagedItem(file));
    }

    if (accepted.length > 0) {
      this._items.update((items) => [...items, ...accepted]);
    }
  }

  /**
   * Resolves once every in-flight antivirus scan has reached its terminal state, so the caller can
   * evaluate `hasUnreadyDocuments` on settled statuses. Never rejects: a failed scan ends as `Error`
   * on the item. Scans started while awaiting (a scan queued by `uploadAll`) are awaited as well.
   */
  async awaitPendingScans(): Promise<void> {
    while (this.pendingScans.size > 0) {
      await Promise.all(this.pendingScans.values());
    }
  }

  /**
   * Commits the staged removals: deletes every existing document marked for removal and drops it
   * from the list. Runs as part of the save flow; a rejection propagates so the caller surfaces an
   * error and reopening the panel reloads the server truth.
   */
  async commitRemovals(dataProductId: string): Promise<void> {
    const targets = this._items()
      .filter((item) => item.markedForRemoval && item.isExisting && item.dto?.id)
      .map((item) => ({ localId: item.localId, id: item.dto?.id ?? '' }));
    if (targets.length === 0) return;

    await Promise.all(
      targets.map((target) =>
        this.documentService.deleteDocument(
          dataProductId,
          target.id,
          this.stateService.actingRole(),
        ),
      ),
    );

    const removedIds = new Set(targets.map((target) => target.localId));
    this._items.update((items) => items.filter((item) => !removedIds.has(item.localId)));
  }

  downloadDocument(item: DocumentUploadItem): Promise<Blob> {
    const dataProductId = this._dataProductId();
    if (!dataProductId || !item.dto?.id) {
      return Promise.reject(new Error('Cannot download a document without a data product and id.'));
    }
    return this.documentService.downloadDocument(
      dataProductId,
      item.dto.id,
      this.stateService.actingRole(),
    );
  }

  async loadExisting(dataProductId: string): Promise<void> {
    this._dataProductId.set(dataProductId);
    const documents = await this.documentService.listDocuments(
      dataProductId,
      this.stateService.actingRole(),
    );
    this._items.set(documents.map((dto) => this.createExistingItem(dto)));
    // Resume scan-status polling for any document still being scanned (e.g. the panel was
    // reopened while an antivirus scan was still running).
    this._items().forEach((item) => {
      if (item.status === DocumentUploadStatus.PendingScan && item.dto?.id) {
        this.trackScan(item, item.dto.id, dataProductId);
      }
    });
  }

  /**
   * Removes a document. Newly staged (not-yet-persisted) files are dropped immediately since
   * nothing is stored server-side. Existing documents are only marked for removal here; the actual
   * DELETE happens in `commitRemovals` during the save flow, so the user can undo via `restoreItem`
   * and closing the panel without saving keeps the document.
   */
  removeItem(item: DocumentUploadItem): void {
    if (item.isExisting) {
      this.patchItem(item.localId, { markedForRemoval: true });
      return;
    }
    this._items.update((items) => items.filter((current) => current.localId !== item.localId));
  }

  restoreItem(item: DocumentUploadItem): void {
    this.patchItem(item.localId, { markedForRemoval: false });
  }

  /**
   * Uploads every staged file concurrently and resolves once all uploads (POSTs) are done; the scan
   * long-poll for each document then runs in the background, so a caller that does not care about the
   * scan result (saving a draft) is not blocked by it. Uploading in parallel also means every file is
   * persisted immediately, so closing the panel mid-scan no longer loses the not-yet-sent files. Use
   * `awaitPendingScans` + `hasUnreadyDocuments` to gate publishing.
   */
  async uploadAll(dataProductId: string): Promise<void> {
    this._dataProductId.set(dataProductId);
    const staged = this._items().filter((item) => item.status === DocumentUploadStatus.Staged);
    await Promise.all(staged.map((item) => this.uploadItem(item, dataProductId)));
  }

  private createExistingItem(dto: DataProductDocumentMetadataDto): DocumentUploadItem {
    return {
      localId: `existing-${dto.id}`,
      filename: dto.fileName ?? '',
      sizeBytes: dto.sizeBytes ?? 0,
      status: this.mapState(dto.scanStatus),
      progress: 100,
      isExisting: true,
      dto,
    };
  }

  private createStagedItem(file: File): DocumentUploadItem {
    return {
      localId: `staged-${this.localIdCounter++}`,
      filename: file.name,
      sizeBytes: file.size,
      status: DocumentUploadStatus.Staged,
      progress: 0,
      isExisting: false,
      file,
    };
  }

  private mapState(status?: DocumentScanStatusEnum): DocumentUploadStatus {
    switch (status) {
      case DocumentScanStatusEnum.Available:
        return DocumentUploadStatus.Available;
      case DocumentScanStatusEnum.Rejected:
        return DocumentUploadStatus.Rejected;
      case DocumentScanStatusEnum.ScanFailed:
        return DocumentUploadStatus.Error;
      default:
        return DocumentUploadStatus.PendingScan;
    }
  }

  private patchItem(localId: string, patch: Partial<DocumentUploadItem>): void {
    this._items.update((items) =>
      items.map((item) => (item.localId === localId ? { ...item, ...patch } : item)),
    );
  }

  private setValidationError(key: string, params?: Record<string, unknown>): void {
    this._validationError.set(
      this.i18nService.translate(`data-products.detailForm.documents.error.${key}`, params),
    );
  }

  private async awaitScan(
    item: DocumentUploadItem,
    documentId: string,
    dataProductId: string,
  ): Promise<void> {
    try {
      const status = await this.documentService.awaitDocumentProcessed(
        dataProductId,
        documentId,
        this.stateService.actingRole(),
        this.abortController.signal,
      );
      if (this.abortController.signal.aborted) return;
      this.patchItem(item.localId, { status: this.mapState(status) });
    } catch {
      if (this.abortController.signal.aborted) return;
      this.patchItem(item.localId, { status: DocumentUploadStatus.Error });
    }
  }

  /**
   * Starts the scan long-poll and keeps it in `pendingScans` until it settles, so `awaitPendingScans`
   * can await it without blocking the caller here. The entry is only dropped while it is still the
   * item's current scan: `loadExisting` reuses the same localId, so a stale scan of a reloaded
   * document must not evict the newer one.
   */
  private trackScan(item: DocumentUploadItem, documentId: string, dataProductId: string): void {
    const scan = this.awaitScan(item, documentId, dataProductId).finally(() => {
      if (this.pendingScans.get(item.localId) === scan) this.pendingScans.delete(item.localId);
    });
    this.pendingScans.set(item.localId, scan);
  }

  private async uploadItem(item: DocumentUploadItem, dataProductId: string): Promise<void> {
    if (!item.file) return;
    this.patchItem(item.localId, { status: DocumentUploadStatus.Uploading, progress: 0 });

    let dto: DataProductDocumentMetadataDto;
    try {
      dto = await this.documentService.uploadDocument(
        dataProductId,
        item.file,
        this.stateService.actingRole(),
        (percent) => this.patchItem(item.localId, { progress: percent }),
      );
    } catch {
      this.patchItem(item.localId, { status: DocumentUploadStatus.Error });
      return;
    }

    this.patchItem(item.localId, {
      status: DocumentUploadStatus.PendingScan,
      progress: 100,
      isExisting: true,
      dto,
    });
    // Scan in the background so the upload itself is not blocked on the long-poll; the badge updates
    // once the scan finishes and the save flow awaits it via `awaitPendingScans`.
    this.trackScan(item, dto.id ?? '', dataProductId);
  }
}
