import { Component, computed, inject, input, signal } from '@angular/core';
import { faCopy } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { getBadgeVariant } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AnchorRect, TooltipBubbleService, TooltipDirective } from '@/shared/tooltip';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { copyToClipboard } from '@/shared/utils';
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
    AgridataBadgeComponent,
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
  protected readonly getBadgeVariant = getBadgeVariant;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly isRedirectUriRegexEditable = input(false);

  // Signals
  /** Translation key of the copy result, mirrored into the live region while the bubble is up. */
  protected readonly copyFeedbackKey = signal('');

  // Computed signals
  protected readonly formattedSubmissionDate = computed(() =>
    formatDate(this.dataRequest().submissionDate),
  );
  protected readonly invitationLink = computed(() => {
    return `${globalThis.location.origin}/consent-requests/create/${this.dataRequest().id}`;
  });

  protected getStatusTranslation(value?: string) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }

  protected async handleCopy(event: MouseEvent, trigger: HTMLElement): Promise<void> {
    let key = 'invitationLink.copied';
    try {
      await copyToClipboard(this.invitationLink());
    } catch {
      key = 'invitationLink.copyFailed';
    }

    // Keyboard activation reports no pointer position (detail === 0) - anchor to the button instead.
    const anchor: AnchorRect =
      event.detail === 0
        ? trigger.getBoundingClientRect()
        : { top: event.clientY, bottom: event.clientY, left: event.clientX, width: 0, height: 0 };

    this.copyFeedbackKey.set(key);
    this.bubbleService.showTransient(
      this.i18nService.translate(`data-request.${key}`),
      () => anchor,
      1500,
      () => this.copyFeedbackKey.set(''),
    );
  }
}
