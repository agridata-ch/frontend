import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { faCopy } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataProductDto,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM } from '@/pages/admin-page';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { getBadgeVariant, getFieldFromLang } from '@/shared/data-request';
import { formatDate } from '@/shared/date';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { copyToClipboard } from '@/shared/utils';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { DataRequestContactComponent } from '@/widgets/data-request-contact';
import { DataRequestPurposeAccordionComponent } from '@/widgets/data-request-purpose-accordion';

/**
 * Displays detailed information about a data request in a sidepanel
 *
 * CommentLastReviewed: 2026-01-09
 */
@Component({
  selector: 'app-data-request-details',
  imports: [
    I18nDirective,
    CommonModule,
    ErrorOutletComponent,
    SidepanelComponent,
    AgridataContactCardComponent,
    DataRequestPurposeAccordionComponent,
    DataRequestContactComponent,
    AgridataBadgeComponent,
    FontAwesomeModule,
    ButtonComponent,
  ],
  templateUrl: './data-request-details.component.html',
})
export class DataRequestDetailsComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  private readonly i18nService = inject(I18nService);
  private readonly metaDataService = inject(MasterDataService);

  // Input properties
  readonly dataRequestId = input.required<string>();

  // Constants
  protected readonly locale = this.i18nService.lang();
  protected readonly products = this.metaDataService.dataProducts;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly DataRequestStateEnum = DataRequestStateEnum;
  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly getFieldFromLang = getFieldFromLang;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly copyToClipboard = copyToClipboard;
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly faCopy = faCopy;
  // Signals
  protected readonly refreshListNeeded = signal(false);
  protected readonly invitationLink = computed(() => {
    return `${globalThis.location.origin}/consent-requests/create/${this.dataRequestId()}`;
  });

  // Computed Signals
  protected dataRequest = computed(() => {
    if (this.dataRequestResource.isLoading()) {
      return null;
    }
    return this.dataRequestResource.value();
  });
  protected readonly formattedSubmissionDate = computed(() =>
    formatDate(this.dataRequest()?.submissionDate),
  );
  readonly productsList = computed(() =>
    this.products()?.filter((product: DataProductDto) =>
      this.dataRequest()?.products?.includes(product.id),
    ),
  );

  protected readonly dataRequestResource = resource({
    params: () => ({ id: this.dataRequestId() }),
    loader: ({ params }) => {
      return this.dataRequestService.fetchDataRequest(params.id);
    },
  });

  // Effects
  private readonly errorHandlerEffect = effect(() => {
    const error = this.dataRequestResource.error();
    if (error) {
      this.errorService.handleError(error);
    }
  });

  protected handleClose() {
    this.router.navigate([ROUTE_PATHS.ADMIN_PATH], {
      state: { [FORCE_RELOAD_DATA_REQUESTS_STATE_PARAM]: this.refreshListNeeded() },
    });
  }

  protected getStatusTranslation(
    value: ConsentRequestProducerViewDtoDataRequestStateCode | undefined,
  ) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }

  protected acceptRequest() {
    this.dataRequestService
      .approveDataRequest(this.dataRequestId())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error));
  }

  protected rejectRequest() {
    this.dataRequestService
      .retreatDataRequest(this.dataRequestId())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.handleClose();
      })
      .catch((error) => this.errorService.handleError(error));
  }

  protected activateRequest() {
    this.dataRequestService
      .activateDataRequest(this.dataRequestId())
      .then(() => {
        this.refreshListNeeded.set(true);
        this.dataRequestResource.reload();
      })
      .catch((error) => this.errorService.handleError(error));
  }
}
