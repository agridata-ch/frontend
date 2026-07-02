import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { DataProductLinksComponent } from '@/widgets/data-product-links';

import { DataProductDetailDocumentsComponent } from './data-product-detail-documents/data-product-detail-documents.component';

/**
 * Tab component for the links and documents of a data product. Renders a PDF dropzone plus two
 * lists: newly staged files (with upload progress) and previously uploaded documents (with open /
 * download / remove actions). Upload itself is triggered from the parent form's save flow via the
 * shared DocumentUploadStore.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Component({
  selector: 'app-data-product-detail-links-documents',
  imports: [DataProductLinksComponent, DataProductDetailDocumentsComponent],
  templateUrl: './data-product-detail-links-documents.component.html',
  host: { class: 'contents' },
})
export class DataProductDetailLinksDocumentsComponent {
  // Input properties
  readonly form = input.required<FormGroup>();
  readonly isViewMode = input<boolean>(false);
}
