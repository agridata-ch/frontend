import { Component, computed, inject, input } from '@angular/core';

import { ContractRevisionService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createDocumentDownloadHandler } from '@/shared/lib/document-download.helper';
import { AgridataFileDownloadComponent } from '@/shared/ui/file-download';

/**
 * Component for displaying and handling interactions with a contract PDF related to a data request.
 * It provides functionality to open the PDF in a new tab or download it directly.
 * The component fetches the PDF blob from the ContractRevisionService using
 * the provided contract revision ID and creates a URL for viewing or downloading the PDF.
 *
 * CommentLastReviewed: 2026-10-19
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

  // Constants
  protected readonly downloads = createDocumentDownloadHandler(this.errorHandler);

  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();
  readonly contractRevisionId = input.required<string>();

  // Computed
  protected readonly fileName = computed(() => {
    const translation = this.i18nService.translate('data-request.contractPdf.fileName', {
      humanFriendlyId: this.dataRequest().humanFriendlyId,
    });
    return `${translation}.pdf`;
  });

  // Methods
  protected handleDownloadPdf(): void {
    this.downloads.download(this.contractRevisionId(), this.fileName(), () => this.fetchPdf());
  }

  protected handleOpenPdf(): void {
    this.downloads.open(this.contractRevisionId(), () => this.fetchPdf());
  }

  private fetchPdf(): Promise<Blob> {
    return this.contractRevisionService.getContractRevisionPdf(
      this.contractRevisionId(),
      this.stateService.actingRole(),
    );
  }
}
