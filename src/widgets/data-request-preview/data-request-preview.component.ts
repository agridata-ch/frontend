import { Component, computed, inject, input } from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto } from '@/entities/openapi';
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
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-preview',
  imports: [
    I18nDirective,
    DataRequestPurposeAccordionComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestContactComponent,
    AgridataContactCardComponent,
    FontAwesomeModule,
  ],
  templateUrl: './data-request-preview.component.html',
})
export class DataRequestPreviewComponent {
  protected readonly dataRequest = input.required<DataRequestDto>();
  protected readonly metaDataService = inject(MasterDataService);

  protected readonly availableLangs = availableLangs;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly getFieldFromLang = getFieldFromLang;
  protected readonly faSpinnerThird = faSpinnerThird;

  protected readonly dataProvider = computed(() => {
    return this.metaDataService
      .dataProviders()
      .find((provider) => provider.id === this.dataRequest().dataProviderId);
  });

  readonly productsList = computed(() => {
    if (!this.dataRequest()?.dataProviderId) return [];
    return this.metaDataService
      .getProductsForProvider(this.dataRequest().dataProviderId!)
      ?.filter((product) => this.dataRequest()?.products?.includes(product.id));
  });
}
