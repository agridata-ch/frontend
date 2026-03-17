import { CommonModule } from '@angular/common';
import { Component, computed, inject, input, resource } from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ContractRevisionService } from '@/entities/api';
import { I18nDirective } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

import { ContractSignatureInputComponent } from './contract-signature-input/contract-signature-input.component';

/**
 * Component for signing the data request contract.
 *
 * CommentLastReviewed: 2026-03-17
 */
@Component({
  selector: 'app-data-request-contract-signing',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    CommonModule,
    AgridataContactCardComponent,
    ContractSignatureInputComponent,
  ],
  templateUrl: './data-request-contract-signing.component.html',
})
export class DataRequestContractSigningComponent {
  protected readonly contractRevisionService = inject(ContractRevisionService);
  protected readonly authService = inject(AuthService);

  readonly contractId = input<string>();

  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly isDataConsumer = this.authService.isConsumer();

  readonly contractResource = resource({
    params: () => ({ id: this.contractId() }),
    loader: ({ params }) => {
      if (!params?.id) {
        return Promise.resolve(null);
      }
      return this.contractRevisionService.fetchContract(params.id);
    },
    defaultValue: null,
  });

  protected readonly contract = createResourceValueComputed(this.contractResource);

  readonly companyName = computed(() =>
    this.isDataConsumer ? this.contract()?.dataConsumerName : this.contract()?.dataProviderName,
  );
}
