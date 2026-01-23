/**
 * Copies the provided text to the system clipboard
 *
 * CommentLastReviewed: 2026-01-20
 *
 * @param text The text to copy to clipboard
 * @returns A promise that resolves when the text has been copied
 * @throws Error if clipboard operation fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}
