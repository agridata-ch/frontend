import { Component, computed, inject, input, resource } from '@angular/core';

import { DataRequestService } from '@/entities/api';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';

interface MetadataColumn {
  labelKey: string;
  uid: string;
  bur: string;
}

/**
 * Shows an aggregate status summary ("Status der Datenanfragen") of a data request's producers
 * (consent requests) above the producers table, split by legal-entity identifier type (UID and
 * BUR). The BUR line is only shown when the data request has BUR-based consent requests.
 *
 * CommentLastReviewed: 2026-09-22
 */
@Component({
  imports: [I18nDirective],
  selector: 'app-data-request-details-producers-metadata',
  templateUrl: './data-request-details-producers-metadata.component.html',
})
export class DataRequestDetailsProducersMetadataComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);

  // Input properties
  readonly dataRequestId = input<string>('');

  // Computed signals
  protected readonly metadataResource = resource({
    params: () => {
      const id = this.dataRequestId();
      return id ? { id } : undefined;
    },
    loader: ({ params }) => this.dataRequestService.fetchProducersMetadata(params.id),
  });

  protected readonly hasBur = computed(() => !!this.metadataResource.value()?.bur);

  protected readonly columns = computed<MetadataColumn[]>(() => {
    const summary = this.metadataResource.value();
    const states = ['total', 'open', 'granted', 'declined'] as const;
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

  private format(value?: number): string {
    return (value ?? 0).toLocaleString('de-CH');
  }
}
