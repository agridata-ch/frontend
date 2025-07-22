import { CommonModule } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';

import { ConsentRequestDetailViewDtoDataRequestProducts } from '@/entities/openapi';
import { I18nPipe, I18nService } from '@/shared/i18n';
import { AgridataAccordionComponent } from '@/widgets/agridata-accordion';

@Component({
  selector: 'app-data-request-purpose-accordion',
  imports: [I18nPipe, AgridataAccordionComponent, CommonModule],
  templateUrl: './data-request-purpose-accordion.component.html',
})
export class DataRequestPurposeAccordionComponent {
  readonly i18nService = inject(I18nService);
  readonly purpose = input<string>();
  readonly products = input<ConsentRequestDetailViewDtoDataRequestProducts>();
  readonly currentLanguage = computed(() => this.i18nService.lang());

  readonly productsList = computed<ConsentRequestDetailViewDtoDataRequestProducts[]>(() => {
    const productsValue = this.products();
    if (!productsValue) return [];
    return Array.isArray(productsValue) ? productsValue : [];
  });

  getFieldFromLang = (
    product: ConsentRequestDetailViewDtoDataRequestProducts,
    field: keyof ConsentRequestDetailViewDtoDataRequestProducts,
  ) => {
    const fieldValue = product?.[field];
    return (fieldValue as Record<string, string>)?.[this.currentLanguage()] ?? '';
  };
}
