import { Component, computed, inject, input } from '@angular/core';

import { MetaDataService } from '@/entities/api/meta-data-service';
import { DataProductDto, DataRequestDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AgridataAvatarComponent, AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { DataRequestContactComponent } from '@/widgets/data-request-contact/data-request-contact.component';
import { DataRequestPrivacyInfosComponent } from '@/widgets/data-request-privacy-infos/data-request-privacy-infos.component';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

import { availableLangs } from '../../../transloco.config';

@Component({
  selector: 'app-data-request-preview',
  imports: [
    I18nDirective,
    DataRequestPurposeAccordionComponent,
    DataRequestPrivacyInfosComponent,
    DataRequestContactComponent,
    AgridataAvatarComponent,
  ],
  templateUrl: './data-request-preview.component.html',
})
export class DataRequestPreviewComponent {
  readonly i18nService = inject(I18nService);
  readonly dataRequest = input<DataRequestDto>();
  readonly metaDataService = inject(MetaDataService);

  readonly products = this.metaDataService.fetchDataProducts;

  readonly availableLangs = availableLangs;
  readonly AvatarSize = AvatarSize;
  readonly AvatarSkin = AvatarSkin;

  readonly productsList = computed(() =>
    this.products
      .value()
      ?.filter((product: DataProductDto) => this.dataRequest()?.products?.includes(product.id)),
  );

  getFieldFromLang = <K extends keyof DataRequestDto>(field: K, lang: string) => {
    const dataRequest = this.dataRequest();
    const fieldValue = dataRequest?.[field];
    return (fieldValue as Record<string, string>)?.[lang] ?? '';
  };
}
