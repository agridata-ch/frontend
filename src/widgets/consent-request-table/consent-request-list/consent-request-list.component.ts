import { Component, inject, input, output } from '@angular/core';
import { faChevronRight } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ConsentRequestProducerViewDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

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
    EmptyStateComponent,
  ],
  templateUrl: './consent-request-list.component.html',
})
export class ConsentRequestListComponent {
  protected readonly i18nService = inject(I18nService);
  readonly consentRequests = input<ConsentRequestProducerViewDto[]>();
  readonly openDetails = output<ConsentRequestProducerViewDto>();
  readonly updateConsentRequestStatus = output<{ id: string; newState: string; title?: string }>();

  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly ConsentRequestStateEnum = ConsentRequestStateEnum;
  protected readonly faChevronRight = faChevronRight;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly BadgeSize = BadgeSize;

  handleClick(request: ConsentRequestProducerViewDto) {
    this.openDetails.emit(request);
  }

  getTranslatedTitle(request: ConsentRequestProducerViewDto) {
    return this.i18nService.useObjectTranslation(request.dataRequest?.title);
  }

  formatRequestDate(request: ConsentRequestProducerViewDto) {
    return formatDate(request?.requestDate);
  }

  getBadgeVariant(request: ConsentRequestProducerViewDto) {
    const stateCode = request?.stateCode;
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  }

  acceptRequest(event: Event, request: ConsentRequestProducerViewDto) {
    event.stopPropagation();
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);
    this.updateConsentRequestStatus.emit({
      id: request.id,
      newState: ConsentRequestStateEnum.Granted,
      title: requestTitle,
    });
  }
}
