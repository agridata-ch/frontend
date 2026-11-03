import { Component, computed, inject, input } from '@angular/core';
import { faCircleInfo, faCopy } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { PublicDataProductDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createCopyFeedback } from '@/shared/lib/copy-feedback.helper';
import { TooltipBubbleService, TooltipDirective } from '@/shared/tooltip';
import { formatTemplate } from '@/shared/utils';
import { ViewSectionDirective } from '@/shared/view-section';

interface TechnicalField {
  key: string;
  value: string;
  multiline: boolean;
}

/**
 * Technical tab of the data product detail: id, flow code and request templates, each with an
 * info tooltip and a copy-to-clipboard action. Optional fields the product doesn't set are hidden.
 *
 * CommentLastReviewed: 2026-11-02
 */
@Component({
  selector: 'app-data-product-detail-technical',
  imports: [FontAwesomeModule, I18nDirective, TooltipDirective, ViewSectionDirective],
  templateUrl: './data-product-detail-technical.component.html',
})
export class DataProductDetailTechnicalComponent {
  // Injects
  private readonly bubbleService = inject(TooltipBubbleService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly faCopy = faCopy;
  protected readonly infoIcon = faCircleInfo;

  // Input properties
  readonly product = input.required<PublicDataProductDto>();

  // Signals
  protected readonly copyFeedback = createCopyFeedback(
    this.bubbleService,
    this.i18nService,
    'data-catalog.product.technical',
  );

  // Computed signals
  protected readonly fields = computed<TechnicalField[]>(() => {
    const product = this.product();
    const fields: (Omit<TechnicalField, 'value'> & { value?: string })[] = [
      { key: 'productId', value: product.id, multiline: false },
      { key: 'flowCode', value: product.flowCode, multiline: false },
      { key: 'pathTemplate', value: product.restClientPathTemplate, multiline: true },
      {
        key: 'requestTemplate',
        value: formatTemplate(product.restClientRequestTemplate ?? ''),
        multiline: true,
      },
    ];
    return fields.filter((field): field is TechnicalField => !!field.value);
  });
}
