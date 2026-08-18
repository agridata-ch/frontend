import { Component, inject, input, output } from '@angular/core';
import { faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ConsentRequestAggregationSummaryDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { getAggregationBadgeVariant, isOpenAggregationState } from '@/shared/consent-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { ConsentRequestEmptyStateComponent } from '@/widgets/consent-request-empty-state/consent-request-empty-state.component';

/**
 * Component to display a list of consent requests in a mobile-friendly format.
 *
 * CommentLastReviewed: 2025-10-15
 */
@Component({
  selector: 'app-consent-request-list',
  imports: [
    FontAwesomeModule,
    ButtonComponent,
    AgridataBadgeComponent,
    I18nDirective,
    AgridataContactCardComponent,
    ConsentRequestEmptyStateComponent,
  ],
  templateUrl: './consent-request-list.component.html',
})
export class ConsentRequestListComponent {
  protected readonly i18nService = inject(I18nService);
  readonly consentRequests = input<ConsentRequestAggregationSummaryDto[]>();
  readonly openDetails = output<ConsentRequestAggregationSummaryDto>();
  readonly updateConsentRequestStatus = output<{
    aggregation: ConsentRequestAggregationSummaryDto;
    newState: ConsentRequestStateEnum;
    title?: string;
  }>();

  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faChevronRight = faChevronRight;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly BadgeSize = BadgeSize;
  protected readonly isOpenAggregationState = isOpenAggregationState;

  handleClick(request: ConsentRequestAggregationSummaryDto) {
    this.openDetails.emit(request);
  }

  getTranslatedTitle(request: ConsentRequestAggregationSummaryDto) {
    return this.i18nService.useObjectTranslation(request.dataRequest?.title);
  }

  formatRequestDate(request: ConsentRequestAggregationSummaryDto) {
    return formatDate(request?.requestDate);
  }

  getBadgeVariant(request: ConsentRequestAggregationSummaryDto) {
    return getAggregationBadgeVariant(request?.stateCode);
  }

  acceptRequest(event: Event, request: ConsentRequestAggregationSummaryDto) {
    event.stopPropagation();
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);
    this.updateConsentRequestStatus.emit({
      aggregation: request,
      newState: ConsentRequestStateEnum.Granted,
      title: requestTitle,
    });
  }
}
