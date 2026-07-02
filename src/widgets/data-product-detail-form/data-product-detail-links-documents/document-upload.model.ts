import { DataProductDocumentMetadataDto } from '@/entities/openapi';

/**
 * Status of a document within the upload UI. Combines the server-side scan states with
 * client-only states (staged, uploading, error).
 */
export const DocumentUploadStatus = {
  Staged: 'STAGED',
  Uploading: 'UPLOADING',
  PendingScan: 'PENDING_SCAN',
  Available: 'AVAILABLE',
  Rejected: 'REJECTED',
  Error: 'ERROR',
} as const;
export type DocumentUploadStatus = (typeof DocumentUploadStatus)[keyof typeof DocumentUploadStatus];

export interface DocumentUploadItem {
  localId: string;
  filename: string;
  sizeBytes: number;
  status: DocumentUploadStatus;
  progress: number;
  isExisting: boolean;
  markedForRemoval?: boolean;
  file?: File;
  dto?: DataProductDocumentMetadataDto;
}
