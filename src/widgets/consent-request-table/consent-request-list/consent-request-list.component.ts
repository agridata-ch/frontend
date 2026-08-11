import { Component, inject, input, output } from '@angular/core';
import { faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ConsentRequestAggregationProducerView, ConsentRequestStateEnum } from '@/entities/openapi';
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
  readonly consentRequests = input<ConsentRequestAggregationProducerView[]>();
  readonly openDetails = output<ConsentRequestAggregationProducerView>();
  readonly updateConsentRequestStatus = output<{
    aggregation: ConsentRequestAggregationProducerView;
    newState: ConsentRequestStateEnum;
    title?: string;
  }>();

  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faChevronRight = faChevronRight;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly BadgeSize = BadgeSize;
  protected readonly isOpenAggregationState = isOpenAggregationState;

  handleClick(request: ConsentRequestAggregationProducerView) {
    this.openDetails.emit(request);
  }

  getTranslatedTitle(request: ConsentRequestAggregationProducerView) {
    return this.i18nService.useObjectTranslation(request.dataRequest?.title);
  }

  formatRequestDate(request: ConsentRequestAggregationProducerView) {
    return formatDate(request?.requestDate);
  }

  getBadgeVariant(request: ConsentRequestAggregationProducerView) {
    return getAggregationBadgeVariant(request?.stateCode);
  }

  acceptRequest(event: Event, request: ConsentRequestAggregationProducerView) {
    event.stopPropagation();
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);
    this.updateConsentRequestStatus.emit({
      aggregation: request,
      newState: ConsentRequestStateEnum.Granted,
      title: requestTitle,
    });
  }
}
