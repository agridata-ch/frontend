/**
 * Formats a byte count into a short human-readable string (B / kB / MB).
 *
 * CommentLastReviewed: 2026-07-13
 *
 * @param bytes The size in bytes.
 * @returns A compact string such as "512B", "24kB" or "3.15MB".
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}
