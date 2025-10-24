import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { DataProductDto } from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';

/**
 * Implements the logic for rendering the purpose section. It accepts a purpose string and a list
 * of products, computes the current language, and extracts localized fields from each product. It
 * integrates with the accordion component to toggle visibility of detailed product information.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-purpose-accordion',
  imports: [I18nPipe, AgridataAccordionComponent, CommonModule],
  templateUrl: './data-request-purpose-accordion.component.html',
})
export class DataRequestPurposeAccordionComponent {
  readonly i18nService = inject(I18nService);
  readonly purpose = input<string>();
  readonly products = input<DataProductDto[]>();
  readonly currentLanguage = computed(() => this.i18nService.lang());

  readonly productsList = computed<DataProductDto[]>(() => {
    const productsValue = this.products();
    if (!productsValue) return [];
    return Array.isArray(productsValue) ? productsValue : [];
  });

  readonly productDataLink = `${environment.appBaseUrl}/cms/data-consumer#data-products`;

  getFieldFromLang = (product: DataProductDto, field: keyof DataProductDto) => {
    const fieldValue = product?.[field];
    return (fieldValue as Record<string, string>)?.[this.currentLanguage()] ?? '';
  };
}
