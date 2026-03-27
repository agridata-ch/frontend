import { Component, computed, inject, input, resource, signal } from '@angular/core';

import { ContractRevisionService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto } from '@/entities/openapi';
import { getBadgeVariant } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { AgridataDatePipe } from '@/shared/date/agridata-date.pipe';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

import { AlertComponent, AlertType } from '../alert';

/**
 * Component to display the completion of a data request.
 * It shows the details of the completed data request, including the request ID, status, and any relevant information.
 * It also allows the consumer to submit the request for the provider
 *
 *  CommentLastReviewed: 2026-03-27
 */
@Component({
  selector: 'app-data-request-completion',
  imports: [
    I18nDirective,
    AgridataBadgeComponent,
    AgridataContactCardComponent,
    AlertComponent,
    AgridataDatePipe,
  ],
  templateUrl: './data-request-completion.component.html',
})
export class DataRequestCompletionComponent {
  // Injects
  protected readonly contractRevisionService = inject(ContractRevisionService);
  protected readonly i18nService = inject(I18nService);
  protected readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly BadgeSize = BadgeSize;
  protected readonly getBadgeVariant = getBadgeVariant;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();

  // Signals
  protected readonly productsLoading = signal<boolean>(false);

  // Resources
  readonly contractResource = resource({
    params: () => ({ id: this.dataRequest().currentContractRevisionId }),
    loader: ({ params }) => {
      if (!params?.id) {
        return Promise.resolve(null);
      }
      return this.contractRevisionService.fetchContract(params.id);
    },
    defaultValue: null,
  });

  // Computed Signals
  protected readonly allDataProducts = computed(() => {
    const providerId = this.dataRequest()?.dataProviderId;
    if (!providerId) {
      return [];
    }
    return this.metaDataService.getProductsForProvider(providerId);
  });

  protected readonly contract = createResourceValueComputed(this.contractResource);

  protected readonly dataRequestProducts = computed(() => {
    const productIds = this.dataRequest()?.products || [];
    const allProducts = this.allDataProducts();
    return allProducts
      .map((product) => ({
        name: this.i18nService.useObjectTranslation(product.name),
        id: product.id,
      }))
      .filter((product) => productIds.includes(product.id));
  });

  protected readonly formattedSubmissionDate = computed(() =>
    formatDate(this.dataRequest().submissionDate),
  );

  // Methods
  protected getStatusTranslation(value?: string) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }
}
