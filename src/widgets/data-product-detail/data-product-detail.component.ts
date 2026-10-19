import { Component, computed, effect, inject, input, output, resource } from '@angular/core';
import { faCircleChf, faShieldCheck } from '@awesome.me/kit-0b6d1ed528/icons/classic/solid';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataProductSource } from '@/entities/api';
import { DataProductDocumentMetadataDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { createDocumentDownloadHandler } from '@/shared/lib/document-download.helper';
import { TooltipDirective } from '@/shared/tooltip';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';
import { AgridataLinksListComponent } from '@/shared/ui/links-list';

/**
 * Read-only details of a single data product (badges, description, links, documents, costs). Given
 * a product id it loads the product and its documents through the `source` the host hands over
 * (public or authenticated). Hosts wrap it (modal, page) and own the open/close state.
 * `handleNameLoaded` hands the product name to the host for its title and `handleLoadFailed` lets
 * the host close on error. Translations come from the `data-catalog` keys.
 *
 * CommentLastReviewed: 2026-10-13
 */
@Component({
  selector: 'app-data-product-detail',
  imports: [
    AgridataBadgeComponent,
    AgridataFileDownloadComponent,
    AgridataLinksListComponent,
    FontAwesomeModule,
    I18nDirective,
    TooltipDirective,
  ],
  templateUrl: './data-product-detail.component.html',
})
export class DataProductDetailComponent {
  // Injects
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly BadgeVariant = BadgeVariant;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly publicSectorIcon = faShieldCheck;
  protected readonly chfCircleIcon = faCircleChf;

  // Input properties
  readonly productId = input<string | undefined>(undefined);
  readonly source = input.required<DataProductSource>();

  // Output properties
  readonly handleLoadFailed = output<void>();
  readonly handleNameLoaded = output<string>();

  // Resources
  // Params stay undefined (resource idle) until a product is selected, so the required `source`
  // is only read once the host has bound it.
  private readonly requestParams = computed(() => {
    const id = this.productId();
    return id ? { id, source: this.source() } : undefined;
  });

  protected readonly productResource = resource({
    params: () => this.requestParams(),
    loader: ({ params }) => params.source.getProduct(params.id),
  });

  protected readonly documentsResource = resource({
    params: () => this.requestParams(),
    loader: ({ params }) => params.source.listDocuments(params.id),
  });

  // Signals
  protected readonly downloads = createDocumentDownloadHandler(this.errorService);

  // Computed signals
  protected readonly loading = computed(() => this.productResource.isLoading());
  protected readonly product = computed(() => this.productResource.value());
  protected readonly name = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.name),
  );
  protected readonly description = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.description),
  );
  protected readonly extendedDescription = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.extendedDescription),
  );
  protected readonly paymentRequired = computed(() => this.product()?.paymentRequired ?? false);
  protected readonly pricingBasis = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.pricingBasis),
  );
  protected readonly providerName = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.dataSourceSystem?.dataProvider.name),
  );
  protected readonly sourceSystemName = computed(() =>
    this.i18nService.useObjectTranslation(this.product()?.dataSourceSystem?.name),
  );

  // Effects
  private readonly productErrorEffect = createResourceErrorHandlerEffect(
    this.productResource,
    this.errorService,
  );
  // A failed load surfaces a global error toast (above); let the host close itself so it doesn't linger empty.
  // Hands the (translated) name to the host, which shows it as its title; empty until loaded.
  private readonly nameEffect = effect(() => this.handleNameLoaded.emit(this.name()));
  private readonly closeOnErrorEffect = effect(() => {
    if (this.productResource.error()) this.handleLoadFailed.emit();
  });

  // Computed
  protected readonly hasLinks = computed(() => !!this.product()?.links?.length);
  protected readonly documents = computed(() => this.documentsResource.value() ?? []);

  // Methods
  protected handleDownload(doc: DataProductDocumentMetadataDto): void {
    const id = this.productId();
    if (!id) return;
    this.downloads.download(doc.id, doc.fileName, () => this.source().downloadDocument(id, doc.id));
  }

  protected handleOpen(doc: DataProductDocumentMetadataDto): void {
    const id = this.productId();
    if (!id) return;
    this.downloads.open(doc.id, () => this.source().downloadDocument(id, doc.id));
  }
}
