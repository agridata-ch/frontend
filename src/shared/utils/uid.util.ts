/**
 * Strips the separators users type in a Swiss enterprise UID (e.g. "CHE-123.456.789") so it
 * matches the unformatted form the backend stores (CHE123456789, see UID_REGEX).
 *
 * CommentLastReviewed: 2026-10-29
 */
export function normalizeUid(value: string): string {
  return value.replace(/[\s.-]/g, '').toUpperCase();
}
