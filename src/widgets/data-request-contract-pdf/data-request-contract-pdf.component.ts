import { Component, computed, inject, input } from '@angular/core';
import { faFilePdf } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ContractRevisionService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';

/**
 * Component for displaying and handling interactions with a contract PDF related to a data request.
 * It provides functionality to open the PDF in a new tab or download it directly.
 * The component fetches the PDF blob from the ContractRevisionService using the provided contract revision ID and creates a URL for viewing or downloading the PDF.
 *
 * CommentLastReviewed: 2026-04-20
 */
@Component({
  selector: 'app-data-request-contract-pdf',
  imports: [ButtonComponent, I18nDirective, FaIconComponent],
  templateUrl: './data-request-contract-pdf.component.html',
})
export class DataRequestContractPdfComponent {
  // Injects
  private readonly contractRevisionService = inject(ContractRevisionService);
  private readonly errorHandler = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Inputs
  readonly dataRequest = input.required<DataRequestDto>();

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faPdf = faFilePdf;

  // Computed
  protected readonly fileName = computed(() => {
    const translation = this.i18nService.translate('data-request.contractPdf.fileName', {
      humanFriendlyId: this.dataRequest().humanFriendlyId,
    });
    return `${translation}.pdf`;
  });

  protected readonly contractRevisionId = computed(
    () => this.dataRequest().currentContractRevisionId ?? '',
  );

  // Methods
  protected handleOpenPdf(): void {
    this.contractRevisionService
      .getContractRevisionPdf(this.contractRevisionId())
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        window.open(url, '_blank');
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        this.errorHandler.handleError(error);
      });
  }

  protected handleDownloadPdf(): void {
    this.contractRevisionService
      .getContractRevisionPdf(this.contractRevisionId())
      .then((pdfBlob) => {
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileName();
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      })
      .catch((error) => {
        this.errorHandler.handleError(error);
      });
  }
}
