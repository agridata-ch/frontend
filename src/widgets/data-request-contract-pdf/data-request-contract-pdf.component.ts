import { Component, computed, inject, input, signal } from '@angular/core';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';
import { downloadBlob, openBlobInNewTab } from '@/shared/utils';

/**
 * Component for displaying and handling interactions with a contract PDF related to a data request.
 * It provides functionality to open the PDF in a new tab or download it directly.
 * The component fetches the PDF blob from the ContractRevisionService using
 * the provided contract revision ID and creates a URL for viewing or downloading the PDF.
 *
 * CommentLastReviewed: 2026-04-20
 */
@Component({
  selector: 'app-data-request-contract-pdf',
  imports: [AgridataFileDownloadComponent, I18nDirective],
  templateUrl: './data-request-contract-pdf.component.html',
})
export class DataRequestContractPdfComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);

  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();
  readonly contractRevisionId = input.required<string>();

  // Signals
  protected readonly isLoadingOpen = signal(false);
  protected readonly isLoadingDownload = signal(false);

  // Computed
  protected readonly fileName = computed(() => {
    const translation = this.i18nService.translate('data-request.contractPdf.fileName', {
      humanFriendlyId: this.dataRequest().humanFriendlyId,
    });
    return `${translation}.pdf`;
  });

  // Methods
  protected handleOpenPdf(): void {
    if (this.isLoadingOpen()) {
      return;
    }

    this.isLoadingOpen.set(true);
    this.contractRevisionService
      .getContractRevisionPdf(this.contractRevisionId(), this.stateService.actingRole())
      .then((pdfBlob) => {
        openBlobInNewTab(pdfBlob);
      })
      .catch((error) => {
        this.errorHandler.handleError(error);
      })
      .finally(() => {
        this.isLoadingOpen.set(false);
      });
  }

  protected handleDownloadPdf(): void {
    if (this.isLoadingDownload()) {
      return;
    }

    this.isLoadingDownload.set(true);
    this.contractRevisionService
      .getContractRevisionPdf(this.contractRevisionId(), this.stateService.actingRole())
      .then((pdfBlob) => {
        downloadBlob(pdfBlob, this.fileName());
      })
      .catch((error) => {
        this.errorHandler.handleError(error);
      })
      .finally(() => {
        this.isLoadingDownload.set(false);
      });
  }
}
