import { Component, computed, inject, input } from '@angular/core';
import { faExternalLink } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nFormatDirective, I18nService } from '@/shared/i18n';
import { createDocumentDownloadHandler } from '@/shared/lib/document-download.helper';
import { AlertComponent, AlertType } from '@/shared/ui/alert';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';

/**
 * Displays the privacy information of a data-request. It renders a static title and a description
 * in which the data consumer and the data provider are interpolated into the translated text.
 *
 * CommentLastReviewed: 2026-10-19
 */
@Component({
  selector: 'app-data-request-privacy-infos',
  imports: [AlertComponent, I18nDirective, I18nFormatDirective, ButtonComponent],
  templateUrl: './data-request-privacy-infos.component.html',
})
export class DataRequestPrivacyInfosComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);
  private readonly errorHandler = inject(ErrorHandlerService);

  // Constants
  protected readonly AlertType = AlertType;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faExternalLink = faExternalLink;
  protected readonly IconPosition = IconPosition;
  protected readonly downloads = createDocumentDownloadHandler(this.errorHandler);

  // Input properties
  readonly consumerName = input<string>();
  readonly providerName = input<string>();
  readonly lang = input<string>();
  readonly dataConsumerCity = input<string>();
  readonly dataConsumerCountry = input<string>();
  readonly isForeignConsumer = input<boolean>(false);
  readonly contractRevisionId = input<string>();

  // Computed Signals
  protected readonly countryDisplayName = computed(() => {
    const country = this.dataConsumerCountry();
    if (!country) return '';
    const lang = this.lang() ?? this.i18nService.lang();
    return new Intl.DisplayNames([lang], { type: 'region' }).of(country) ?? country;
  });

  protected handleOpenPdf(contractRevisionId: string): void {
    this.downloads.open(contractRevisionId, () =>
      this.contractRevisionService.getContractRevisionPdf(
        contractRevisionId,
        this.stateService.actingRole(),
      ),
    );
  }
}
