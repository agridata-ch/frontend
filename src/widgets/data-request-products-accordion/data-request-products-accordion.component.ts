import { Component, computed, inject, input, signal } from '@angular/core';

import { DataProductSourcesService } from '@/entities/api';
import { DataProductDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ModalComponent } from '@/shared/ui/modal';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';
import { DataProductDetailComponent } from '@/widgets/data-product-detail';

/**
 * Implements the logic for rendering the list of products a data-request transmits. It accepts the
 * products, computes the current language, and extracts localized fields from each product. It
 * integrates with the accordion component to toggle visibility of detailed product information.
 *
 * CommentLastReviewed: 2026-10-12
 */
@Component({
  selector: 'app-data-request-products-accordion',
  imports: [AgridataAccordionComponent, I18nDirective, DataProductDetailComponent, ModalComponent],
  templateUrl: './data-request-products-accordion.component.html',
})
export class DataRequestProductsAccordionComponent {
  readonly i18nService = inject(I18nService);
  protected readonly sources = inject(DataProductSourcesService);
  readonly products = input<DataProductDto[]>();
  readonly consumerName = input<string>();
  readonly providerName = input<string>();
  readonly lang = input<string>();

  readonly currentLanguage = computed(() => this.lang() ?? this.i18nService.lang());
  readonly productsList = computed<DataProductDto[]>(() => this.products() ?? []);

  protected readonly detailTitle = signal('');
  protected readonly selectedProductId = signal<string | undefined>(undefined);

  getFieldFromLang = (product: DataProductDto, field: keyof DataProductDto) => {
    const fieldValue = product?.[field];
    return (fieldValue as Record<string, string>)?.[this.currentLanguage()] ?? '';
  };
}
