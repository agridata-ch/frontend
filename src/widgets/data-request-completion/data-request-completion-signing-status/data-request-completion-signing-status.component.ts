import { Component, computed, inject, input } from '@angular/core';

import { ContractRevisionDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nDirective } from '@/shared/i18n';
import { AuthService } from '@/shared/lib/auth';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

import { DataRequestCompletionSignatureComponent } from '../data-request-completion-signature';

/**
 * Component to display the signing status of a data request completion.
 * It shows the contact card and renders the signatures of the contract
 *
 * CommentLastReviewed: 2026-04-14
 */
@Component({
  selector: 'app-data-request-completion-signing-status',
  imports: [AgridataContactCardComponent, DataRequestCompletionSignatureComponent, I18nDirective],
  templateUrl: './data-request-completion-signing-status.component.html',
})
export class DataRequestCompletionSigningStatusComponent {
  protected readonly authService = inject(AuthService);

  readonly contract = input.required<ContractRevisionDto>();
  readonly dataRequestStateCode = input.required<string>();

  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;

  protected readonly showProviderSignatureWaitingState = computed(() => {
    return (
      this.authService.isConsumer() &&
      this.dataRequestStateCode() !== DataRequestStateEnum.ToBeActivated &&
      this.dataRequestStateCode() !== DataRequestStateEnum.ToBeReleasedByProvider
    );
  });
}
