// Delay before revoking the object URL of a blob opened in a new tab. Revoking synchronously can
// leave the new tab blank because the navigation may not have started reading the blob yet.
const OPEN_IN_TAB_REVOKE_DELAY_MS = 60_000;

/**
 * Triggers a browser download of a Blob under the given file name by creating a temporary
 * object URL and clicking a synthetic anchor.
 *
 * CommentLastReviewed: 2026-07-13
 *
 * @param blob The binary content to download.
 * @param fileName The name the downloaded file should have.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/**
 * Opens a Blob in a new browser tab via a temporary object URL. Pass `mimeType` to force the
 * display type (e.g. `application/pdf`) when the fetched blob is a generic `application/octet-stream`,
 * which browsers would otherwise download instead of rendering inline.
 *
 * CommentLastReviewed: 2026-07-13
 *
 * @param blob The binary content to open.
 * @param mimeType Optional MIME type to re-tag the blob with before opening.
 */
export function openBlobInNewTab(blob: Blob, mimeType?: string): void {
  const typedBlob = mimeType ? new Blob([blob], { type: mimeType }) : blob;
  const url = URL.createObjectURL(typedBlob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), OPEN_IN_TAB_REVOKE_DELAY_MS);
}
