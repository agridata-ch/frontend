import { Component, computed, inject, input } from '@angular/core';

import { DataRequestAdvantagesComponent } from '@/data-request-advantages';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { DataRequestContactComponent } from '@/widgets/data-request-contact';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos';
import { DataRequestProductsAccordionComponent } from '@/widgets/data-request-products-accordion';
import { DataRequestPurposeComponent } from '@/widgets/data-request-purpose';

/**
 * Renders the producer facing body of a data request: data consumer, title, description, products,
 * advantages, purpose, privacy infos and contact. The surrounding chrome (sidepanel, footer,
 * per language heading) belongs to the parent.
 *
 * CommentLastReviewed: 2026-08-04
 */
@Component({
  selector: 'app-data-request-content',
  imports: [
    AgridataContactCardComponent,
    DataRequestAdvantagesComponent,
    DataRequestContactComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestProductsAccordionComponent,
    DataRequestPurposeComponent,
  ],
  templateUrl: './data-request-content.component.html',
})
export class DataRequestContentComponent {
  // Injects
  private readonly i18nService = inject(I18nService);
  private readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly lang = input<string>();

  // Computed Signals
  protected readonly description = computed(() =>
    this.i18nService.useObjectTranslation(this.dataRequest().description, this.lang()),
  );
  protected readonly products = computed(() =>
    this.metaDataService
      .getProductsForProvider(this.dataRequest().dataProviderId ?? '')
      .filter((product) => this.dataRequest().products?.includes(product.id)),
  );
  protected readonly providerName = computed(() =>
    this.metaDataService.providerName(this.dataRequest().dataProviderId, this.lang()),
  );
  protected readonly title = computed(() =>
    this.i18nService.useObjectTranslation(this.dataRequest().title, this.lang()),
  );
}
