import { faFilePdf } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { IconDefinition } from '@fortawesome/angular-fontawesome';

/**
 * Maps a file name to the FontAwesome icon that best represents its type.
 *
 * CommentLastReviewed: 2026-07-13
 *
 * Currently only PDF files are supported. When new file types are added, extend
 * the map below and introduce a generic fallback icon.
 *
 * @param fileName The file name (used to read the extension).
 * @returns The matching icon; falls back to the PDF icon while PDF is the only type.
 */
const ICON_BY_EXTENSION: Record<string, IconDefinition> = {
  pdf: faFilePdf,
};

export function getFileIcon(fileName: string): IconDefinition {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return ICON_BY_EXTENSION[extension] ?? faFilePdf;
}
