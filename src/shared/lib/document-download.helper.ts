import { signal, WritableSignal } from '@angular/core';

import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { downloadBlob, openBlobInNewTab } from '@/shared/utils';

/**
 * Tracks per-item open/download loading state and runs the fetch → save/open flow, so any component
 * that lists downloadable files reuses one implementation instead of re-declaring the loading sets,
 * error handling and blob plumbing.
 *
 * `key` identifies a list item (any stable id). A call for a key already in flight is ignored, which
 * guards against double clicks.
 *
 * CommentLastReviewed: 2026-09-21
 */
export function createDocumentDownloadHandler(errorService: ErrorHandlerService) {
  const downloadingIds = signal<ReadonlySet<string>>(new Set());
  const openingIds = signal<ReadonlySet<string>>(new Set());

  function toggle(ids: WritableSignal<ReadonlySet<string>>, key: string, loading: boolean): void {
    ids.update((current) => {
      const next = new Set(current);
      if (loading) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  function run(
    ids: WritableSignal<ReadonlySet<string>>,
    key: string,
    fetch: () => Promise<Blob>,
    onBlob: (blob: Blob) => void,
  ): void {
    if (ids().has(key)) return;
    toggle(ids, key, true);
    fetch()
      .then(onBlob)
      .catch((error) => errorService.handleError(error))
      .finally(() => toggle(ids, key, false));
  }

  return {
    isDownloading: (key: string): boolean => downloadingIds().has(key),
    isOpening: (key: string): boolean => openingIds().has(key),
    download: (key: string, fileName: string, fetch: () => Promise<Blob>): void =>
      run(downloadingIds, key, fetch, (blob) => downloadBlob(blob, fileName)),
    open: (key: string, fetch: () => Promise<Blob>): void =>
      run(openingIds, key, fetch, (blob) => openBlobInNewTab(blob, 'application/pdf')),
  };
}
