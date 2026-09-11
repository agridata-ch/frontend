import { Component, computed, inject, input } from '@angular/core';

import { DataProductDto } from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';

/**
 * Implements the logic for rendering the list of products a data-request transmits. It accepts the
 * products, computes the current language, and extracts localized fields from each product. It
 * integrates with the accordion component to toggle visibility of detailed product information.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Component({
  selector: 'app-data-request-products-accordion',
  imports: [AgridataAccordionComponent, I18nDirective],
  templateUrl: './data-request-products-accordion.component.html',
})
export class DataRequestProductsAccordionComponent {
  readonly i18nService = inject(I18nService);
  readonly products = input<DataProductDto[]>();
  readonly consumerName = input<string>();
  readonly providerName = input<string>();
  readonly lang = input<string>();

  readonly currentLanguage = computed(() => this.lang() ?? this.i18nService.lang());
  readonly productsList = computed<DataProductDto[]>(() => this.products() ?? []);

  getFieldFromLang = (product: DataProductDto, field: keyof DataProductDto) => {
    const fieldValue = product?.[field];
    return (fieldValue as Record<string, string>)?.[this.currentLanguage()] ?? '';
  };

  getProductDataLink = (productId: string) =>
    `${environment.appBaseUrl}/cms/data-catalog/${productId}`;
}
