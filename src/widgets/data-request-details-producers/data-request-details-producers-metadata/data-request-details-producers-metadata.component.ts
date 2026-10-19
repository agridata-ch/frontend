import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, resource, signal } from '@angular/core';
import { faDownload } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataRequestDto, ExceptionEnum } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { getBackendErrorType } from '@/shared/error/http-error-method';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { ToastService, ToastType } from '@/shared/toast';
import { ButtonComponent, ButtonVariants, IconPosition } from '@/shared/ui/button';
import { downloadBlob } from '@/shared/utils';

const EXPORT_I18N_PREFIX = 'data-request.details.producer.metadata.export';

interface MetadataColumn {
  labelKey: string;
  uid: string;
  bur: string;
}

/**
 * Shows an aggregate status summary ("Status der Datenanfragen") of a data request's producers
 * (consent requests) above the producers table, split by legal-entity identifier type (UID and
 * BUR). The BUR line is only shown when the data request has BUR-based consent requests. Offers a
 * CSV export of the consent requests, failures are shown as error toast.
 *
 * CommentLastReviewed: 2026-10-19
 */
@Component({
  imports: [ButtonComponent, I18nDirective],
  selector: 'app-data-request-details-producers-metadata',
  templateUrl: './data-request-details-producers-metadata.component.html',
})
export class DataRequestDetailsProducersMetadataComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);
  private readonly toastService = inject(ToastService);

  // Constants
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faDownload = faDownload;
  protected readonly IconPosition = IconPosition;

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();

  // Signals
  protected readonly isExporting = signal(false);

  // Computed signals
  protected readonly metadataResource = resource({
    params: () => ({ id: this.dataRequest().id }),
    loader: ({ params }) => this.dataRequestService.fetchProducersMetadata(params.id),
  });

  protected readonly hasBur = computed(() => !!this.metadataResource.value()?.bur);

  protected readonly columns = computed<MetadataColumn[]>(() => {
    const summary = this.metadataResource.value();
    const states = ['total', 'open', 'granted', 'declined', 'withdrawn'] as const;
    return states.map((state) => ({
      labelKey: state,
      uid: this.format(summary?.uid?.[state]),
      bur: this.format(summary?.bur?.[state]),
    }));
  });

  // Effects
  private readonly errorHandler = createResourceErrorHandlerEffect(
    this.metadataResource,
    this.errorService,
  );

  reload(): void {
    this.metadataResource.reload();
  }

  protected handleExport(): void {
    const { id, humanFriendlyId } = this.dataRequest();
    this.isExporting.set(true);
    this.dataRequestService
      .exportConsentRequests(id, this.stateService.actingRole())
      .then((csv) => {
        const fileName = this.i18nService.translate(`${EXPORT_I18N_PREFIX}.fileName`, {
          humanFriendlyId,
        });
        downloadBlob(csv, `${fileName}.csv`);
      })
      .catch((error: unknown) => {
        this.toastService.show(
          this.i18nService.translate(`${EXPORT_I18N_PREFIX}.error.title`),
          this.exportErrorMessage(error),
          ToastType.Error,
        );
      })
      .finally(() => {
        this.isExporting.set(false);
      });
  }

  private exportErrorMessage(error: unknown): string {
    switch (getBackendErrorType(error)) {
      case ExceptionEnum.ExportLimitExceeded:
        return this.i18nService.translate(`${EXPORT_I18N_PREFIX}.error.limitExceeded`);
      case ExceptionEnum.ExportCapacityExhausted:
        return this.i18nService.translate(`${EXPORT_I18N_PREFIX}.error.capacityExhausted`);
      default:
        return this.i18nService.translate(`${EXPORT_I18N_PREFIX}.error.generic`, {
          // HttpErrorResponse does not extend Error but carries a message too.
          error:
            error instanceof Error || error instanceof HttpErrorResponse
              ? error.message
              : String(error),
        });
    }
  }

  private format(value?: number): string {
    return (value ?? 0).toLocaleString('de-CH');
  }
}
