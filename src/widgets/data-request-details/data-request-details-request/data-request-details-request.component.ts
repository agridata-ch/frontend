import { Component, computed, inject, input } from '@angular/core';
import { faCopy } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { getBadgeVariant, getFieldFromLang } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { copyToClipboard } from '@/shared/utils';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { DataRequestContactComponent } from '@/widgets/data-request-contact';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';
import { DataRequestRedirectUriComponent } from '@/widgets/data-request-redirect-uri';

/**
 * Component for displaying the details of a data request in the "Request" tab of the Data Request Details sidepanel.
 *
 * CommentLastReviewed: 2026-02-12
 */
@Component({
  selector: 'app-data-request-details-request',
  imports: [
    AgridataBadgeComponent,
    AgridataContactCardComponent,
    DataRequestContactComponent,
    DataRequestPurposeAccordionComponent,
    FontAwesomeModule,
    I18nDirective,
    DataRequestRedirectUriComponent,
  ],
  templateUrl: './data-request-details-request.component.html',
})
export class DataRequestDetailsRequestComponent {
  // Injects
  protected readonly i18nService = inject(I18nService);
  protected readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly BadgeSize = BadgeSize;
  protected readonly copyToClipboard = copyToClipboard;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
  protected readonly faCopy = faCopy;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly getFieldFromLang = getFieldFromLang;
  protected readonly locale = this.i18nService.lang();

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly isRedirectUriRegexEditable = input(false);

  // Computed signals
  protected readonly formattedSubmissionDate = computed(() =>
    formatDate(this.dataRequest().submissionDate),
  );
  protected readonly invitationLink = computed(() => {
    return `${globalThis.location.origin}/consent-requests/create/${this.dataRequest().id}`;
  });
  readonly productsList = computed(() => {
    if (!this.dataRequest()?.dataProviderId) return [];
    return (
      this.metaDataService
        .getProductsForProvider(this.dataRequest().dataProviderId!)
        ?.filter((product) => this.dataRequest().products?.includes(product.id)) || []
    );
  });

  protected getStatusTranslation(value?: string) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }
}
