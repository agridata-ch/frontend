import { Component, inject, input, output, signal } from '@angular/core';

import { DataProductSourcesService } from '@/entities/api';
import { ModalComponent } from '@/shared/ui/modal';
import { DataProductDetailComponent } from '@/widgets/data-product-detail';

/**
 * Modal around the data product details for the public data catalog. The block only tells it which
 * id is selected; loading and rendering live in `app-data-product-detail`.
 *
 * CommentLastReviewed: 2026-10-12
 */
@Component({
  selector: 'app-public-data-product-detail',
  imports: [DataProductDetailComponent, ModalComponent],
  templateUrl: './public-data-product-detail.component.html',
})
export class PublicDataProductDetailComponent {
  protected readonly sources = inject(DataProductSourcesService);

  readonly productId = input<string | undefined>(undefined);

  readonly handleClose = output<void>();

  protected readonly title = signal('');
}
