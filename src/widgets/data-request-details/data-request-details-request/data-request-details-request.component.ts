import { Component, computed, inject, input } from '@angular/core';
import { faCopy } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { DataRequestStateBadgeComponent } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createCopyFeedback } from '@/shared/lib/copy-feedback.helper';
import { TooltipBubbleService, TooltipDirective } from '@/shared/tooltip';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { BadgeSize } from '@/shared/ui/badge';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { DataRequestContactComponent } from '@/widgets/data-request-contact';
import { DataRequestRedirectUriComponent } from '@/widgets/data-request-redirect-uri';

/**
 * Component for displaying the details of a data request in the "Request" tab of the Data Request Details sidepanel.
 *
 * CommentLastReviewed: 2026-08-04
 */
@Component({
  selector: 'app-data-request-details-request',
  imports: [
    DataRequestStateBadgeComponent,
    DataRequestContactComponent,
    FontAwesomeModule,
    I18nDirective,
    DataRequestRedirectUriComponent,
    AgridataContactCardComponent,
    TooltipDirective,
  ],
  templateUrl: './data-request-details-request.component.html',
})
export class DataRequestDetailsRequestComponent {
  // Injects
  protected readonly i18nService = inject(I18nService);
  private readonly bubbleService = inject(TooltipBubbleService);

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly BadgeSize = BadgeSize;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
  protected readonly faCopy = faCopy;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly isRedirectUriRegexEditable = input(false);

  // Signals
  protected readonly copyFeedback = createCopyFeedback(
    this.bubbleService,
    this.i18nService,
    'data-request.invitationLink',
  );

  // Computed signals
  protected readonly consumerDisplayName = computed(() =>
    this.i18nService.useObjectTranslation(this.dataRequest().dataConsumerDisplayName),
  );
  protected readonly formattedSubmissionDate = computed(() =>
    formatDate(this.dataRequest().submissionDate),
  );
  protected readonly invitationLink = computed(() => {
    return `${globalThis.location.origin}/consent-requests/create/${this.dataRequest().id}`;
  });
}
