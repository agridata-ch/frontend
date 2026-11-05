import { Component, computed, inject, input } from '@angular/core';

import { DataProductSource } from '@/entities/api';
import { DataProductDocumentMetadataDto, PublicDataProductDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createDocumentDownloadHandler } from '@/shared/lib/document-download.helper';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';
import { AgridataLinksListComponent } from '@/shared/ui/links-list';

/**
 * General tab of the data product detail: description, links, documents, extended description
 * and costs. Documents are downloaded or opened through the `source` the host hands over.
 *
 * CommentLastReviewed: 2026-11-02
 */
@Component({
  selector: 'app-data-product-detail-general',
  imports: [AgridataFileDownloadComponent, AgridataLinksListComponent, I18nDirective],
  templateUrl: './data-product-detail-general.component.html',
})
export class DataProductDetailGeneralComponent {
  // Injects
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Input properties
  readonly documents = input<DataProductDocumentMetadataDto[]>([]);
  readonly product = input.required<PublicDataProductDto>();
  readonly source = input.required<DataProductSource>();

  // Signals
  protected readonly downloads = createDocumentDownloadHandler(this.errorService);

  // Computed signals
  protected readonly description = computed(() =>
    this.i18nService.useObjectTranslation(this.product().description),
  );
  protected readonly extendedDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.product().extendedDescription),
  );
  protected readonly hasLinks = computed(() => !!this.product().links?.length);
  protected readonly pricingBasis = computed(() =>
    this.product().paymentRequired
      ? this.i18nService.useObjectTranslation(this.product().pricingBasis)
      : '',
  );

  protected handleDownload(doc: DataProductDocumentMetadataDto): void {
    const id = this.product().id;
    this.downloads.download(doc.id, doc.fileName, () => this.source().downloadDocument(id, doc.id));
  }

  protected handleOpen(doc: DataProductDocumentMetadataDto): void {
    const id = this.product().id;
    this.downloads.open(doc.id, () => this.source().downloadDocument(id, doc.id));
  }
}
