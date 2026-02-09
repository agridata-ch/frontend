import { Component, computed, effect, inject, input } from '@angular/core';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProductDto, DataRequestDto } from '@/entities/openapi';
import { getFieldFromLang } from '@/shared/data-request';
import { I18nDirective } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { DataRequestContactComponent } from '@/widgets/data-request-contact/data-request-contact.component';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos/data-request-privacy-infos.component';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

import { availableLangs } from '../../../transloco.config';
import { AgridataContactCardComponent } from '../agridata-contact-card';

/**
 * Implements the preview logic. It integrates metadata services to fetch products, dynamically
 * resolves multilingual fields, and composes subcomponents for avatars, contact details, privacy
 * information, and purposes. It ensures users can validate all request details across supported
 * languages.
 *
 * CommentLastReviewed: 2026-02-09
 */
@Component({
  selector: 'app-data-request-preview',
  imports: [
    I18nDirective,
    DataRequestPurposeAccordionComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestContactComponent,
    AgridataContactCardComponent,
  ],
  templateUrl: './data-request-preview.component.html',
})
export class DataRequestPreviewComponent {
  // Injects
  private readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly availableLangs = availableLangs;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly getFieldFromLang = getFieldFromLang;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();

  // Computed Signals
  protected readonly productsList = computed(() => {
    const dataRequest = this.dataRequest();
    if (!dataRequest?.dataProviderId) {
      return [];
    }
    const products = this.metaDataService.getProductsForProvider(dataRequest.dataProviderId);
    return products.filter((product: DataProductDto) => dataRequest.products?.includes(product.id));
  });

  // Effects
  private readonly loadProductsEffect = effect(() => {
    const providerId = this.dataRequest()?.dataProviderId;
    if (providerId) {
      this.metaDataService.fetchProductsByProvider(providerId);
    }
  });
}
