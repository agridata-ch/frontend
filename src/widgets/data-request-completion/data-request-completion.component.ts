import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { faArrowUpRightFromSquare } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ContractRevisionService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { getBadgeVariant } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceValueComputed } from '@/shared/lib/api.helper';
import { AuthService } from '@/shared/lib/auth';
import { contractAgbUrl } from '@/shared/lib/cms';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants, HrefTarget } from '@/shared/ui/button';
import { AlertComponent, AlertType } from '@/widgets/alert';

import { DataRequestCompletionSigningStatusComponent } from './data-request-completion-signing-status';

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
    AlertComponent,
    ButtonComponent,
    FontAwesomeModule,
    DataRequestCompletionSigningStatusComponent,
  ],
  templateUrl: './data-request-completion.component.html',
})
export class DataRequestCompletionComponent {
  // Injects
  protected readonly authService = inject(AuthService);
  protected readonly contractRevisionService = inject(ContractRevisionService);
  protected readonly i18nService = inject(I18nService);
  protected readonly metaDataService = inject(MasterDataService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly HrefTarget = HrefTarget;
  protected readonly agbButtonIcon = faArrowUpRightFromSquare;
  protected readonly contractAgbUrl = contractAgbUrl;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly releaseContractTranslation = this.i18nService.translateSignal(
    'data-request.wizard.releaseContract',
  );

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();
  readonly hasReleasedToProvider = input<boolean>();

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

  protected readonly dataProvider = computed(() => {
    const providerId = this.dataRequest()?.dataProviderId;
    if (!providerId) {
      return null;
    }
    return this.metaDataService.dataProviders().find((provider) => provider.id === providerId);
  });

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

  protected readonly shouldBeSignedByProvider = computed(
    () => this.dataRequest().stateCode === DataRequestStateEnum.ToBeSignedByProvider,
  );

  protected readonly showFreshSavedAlert = computed(
    () => this.shouldBeSignedByProvider() && !!this.hasReleasedToProvider(),
  );

  protected readonly shouldBeReleasedByProvider = computed(
    () => this.dataRequest().stateCode === DataRequestStateEnum.ToBeReleasedByProvider,
  );

  // Methods
  protected getStatusTranslation(value?: string) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }
}
