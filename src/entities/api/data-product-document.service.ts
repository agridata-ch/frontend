import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  DataProductDocumentMetadataDto,
  DataProductsService,
  DocumentScanStatus,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';

type DataProductActingRoles = 'PROVIDER' | 'ADMIN' | undefined;

/**
 * Service for managing data product documents (PDF attachments). Handles multipart upload with
 * progress reporting, listing, deletion, download and awaiting the scan state. Wraps the generated
 * `DataProductsService`, converting its observables to promises.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Service()
export class DataProductDocumentService {
  private readonly apiService = inject(DataProductsService);

  private readonly maxPollDurationMs = 5 * 60 * 1000;
  // Fallback delay between poll iterations. When the backend honours the long-poll each request
  // blocks until the state changes and this is negligible; if it ever returns immediately while
  // still pending, this keeps the loop from hammering the API in a tight loop.
  private readonly pollIntervalMs = 2000;

  /**
   * Awaits the terminal scan state via backend long-polling. Each call blocks server-side until
   * the scan completes; the deadline guards against a server-side long-poll timeout that returns
   * a still-pending state. Transient request failures are retried until the deadline rather than
   * failing the whole scan. Returns `ScanFailed` (blocking) if no state is available in time.
   */
  async awaitDocumentProcessed(
    dataProductId: string,
    documentId: string,
    actingRole?: ActingRole,
    abortSignal?: AbortSignal,
  ): Promise<DocumentScanStatus> {
    const deadline = Date.now() + this.maxPollDurationMs;
    while (!abortSignal?.aborted && Date.now() < deadline) {
      try {
        const metadata = await this.getDocument(
          dataProductId,
          documentId,
          actingRole,
          true,
          abortSignal,
        );
        if (metadata.scanStatus && metadata.scanStatus !== DocumentScanStatus.PendingScan) {
          return metadata.scanStatus;
        }
      } catch {
        // Abort is handled by the loop condition; any other failure is treated as transient and
        // retried after the poll interval instead of terminating the scan wait.
        if (abortSignal?.aborted) break;
      }
      await this.delay(this.pollIntervalMs, abortSignal);
    }
    // Aborted (panel closed): return a non-terminal state; the caller ignores results after abort.
    if (abortSignal?.aborted) return DocumentScanStatus.PendingScan;
    return DocumentScanStatus.ScanFailed;
  }

  async deleteDocument(
    dataProductId: string,
    documentId: string,
    actingRole?: ActingRole,
  ): Promise<void> {
    await firstValueFrom(
      this.apiService.deleteDataProductDocument(
        documentId,
        dataProductId,
        actingRole as DataProductActingRoles,
      ),
    );
  }

  downloadDocument(
    dataProductId: string,
    documentId: string,
    actingRole?: ActingRole,
  ): Promise<Blob> {
    return firstValueFrom(
      this.apiService.getDataProductDocument(
        documentId,
        dataProductId,
        actingRole as DataProductActingRoles,
        undefined,
        undefined,
        { httpHeaderAccept: 'application/octet-stream' },
      ),
    );
  }

  getDocument(
    dataProductId: string,
    documentId: string,
    actingRole?: ActingRole,
    longPolling = false,
    abortSignal?: AbortSignal,
  ): Promise<DataProductDocumentMetadataDto> {
    const request$ = this.apiService.getDataProductDocumentMetadata(
      documentId,
      dataProductId,
      longPolling,
      actingRole as DataProductActingRoles,
    );
    if (!abortSignal) {
      return firstValueFrom(request$);
    }
    // Aborting unsubscribes, which cancels the in-flight (long-poll) HTTP request. The abort
    // listener is removed once the request settles so listeners don't accumulate on a shared
    // signal across repeated poll iterations.
    return new Promise<DataProductDocumentMetadataDto>((resolve, reject) => {
      if (abortSignal.aborted) {
        reject(new DOMException('Aborted', 'AbortError'));
        return;
      }
      let settled = false;
      const onAbort = (): void => {
        if (settled) return;
        settled = true;
        subscription.unsubscribe();
        reject(new DOMException('Aborted', 'AbortError'));
      };
      const finish = (action: () => void): void => {
        if (settled) return;
        settled = true;
        abortSignal.removeEventListener('abort', onAbort);
        action();
      };
      abortSignal.addEventListener('abort', onAbort, { once: true });
      const subscription = request$.subscribe({
        next: (value) => finish(() => resolve(value)),
        error: (error) => finish(() => reject(error)),
      });
    });
  }

  listDocuments(
    dataProductId: string,
    actingRole?: ActingRole,
  ): Promise<DataProductDocumentMetadataDto[]> {
    return firstValueFrom(
      this.apiService.getDataProductDocumentsMetadata(
        dataProductId,
        actingRole as DataProductActingRoles,
      ),
    );
  }

  uploadDocument(
    dataProductId: string,
    file: File,
    actingRole?: ActingRole,
    onProgress?: (percent: number) => void,
  ): Promise<DataProductDocumentMetadataDto> {
    return new Promise((resolve, reject) => {
      this.apiService
        .addDataProductDocument(
          dataProductId,
          actingRole as DataProductActingRoles,
          file,
          'events',
          true,
        )
        .subscribe({
          next: (event: HttpEvent<DataProductDocumentMetadataDto>) => {
            if (event.type === HttpEventType.UploadProgress && event.total) {
              onProgress?.(Math.round((100 * event.loaded) / event.total));
            } else if (event instanceof HttpResponse && event.body) {
              resolve(event.body);
            }
          },
          error: reject,
        });
    });
  }

  private delay(ms: number, abortSignal?: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (abortSignal?.aborted) {
        resolve();
        return;
      }
      const onAbort = (): void => {
        clearTimeout(timer);
        resolve();
      };
      const timer = setTimeout(() => {
        abortSignal?.removeEventListener('abort', onAbort);
        resolve();
      }, ms);
      abortSignal?.addEventListener('abort', onAbort, { once: true });
    });
  }
}
