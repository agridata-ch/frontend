import { Component, computed, inject, resource, signal } from '@angular/core';
import { faFiles } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ContractTemplateService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ContractTemplateVersionDto, ResourceQueryDto } from '@/entities/openapi';
import { formatDate } from '@/shared/date';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  AgridataTableComponent,
  CellRendererTypes,
  TableMetadata,
} from '@/shared/ui/agridata-table';

/**
 * Admin-only page listing all contract template versions.
 *
 * CommentLastReviewed: 2026-11-26
 */
@Component({
  selector: 'app-admin-contract-templates-page',
  templateUrl: './admin-contract-templates-page.component.html',
  imports: [AgridataTableComponent, ErrorOutletComponent, FaIconComponent, I18nDirective],
})
export class AdminContractTemplatesPageComponent {
  // Injects
  private readonly contractTemplateService = inject(ContractTemplateService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly VALID_FROM_HEADER = 'admin-contract-templates.table.validFrom';
  protected readonly VALID_TO_HEADER = 'admin-contract-templates.table.validTo';
  protected readonly VERSION_HEADER = 'admin-contract-templates.table.version';
  protected readonly faFiles = faFiles;

  // Signals
  protected readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  protected readonly fetchContractTemplateVersionsResource = resource({
    params: () => ({ actingRole: this.stateService.actingRole() }),
    loader: () => this.contractTemplateService.fetchAllContractTemplateVersions(),
  });

  // Computed
  protected readonly tableMetaData = computed<TableMetadata<ContractTemplateVersionDto>>(() => ({
    idColumn: 'version',
    columns: [
      {
        name: this.VERSION_HEADER,
        sortable: false,
        renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.version ?? '-' },
      },
      {
        name: this.VALID_FROM_HEADER,
        sortable: false,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => formatDate(row.validFrom) ?? '-',
        },
      },
      {
        name: this.VALID_TO_HEADER,
        sortable: false,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => formatDate(row.validTo) ?? '-',
        },
      },
    ],
  }));

  // Effects
  protected readonly fetchContractTemplateVersionsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchContractTemplateVersionsResource,
    this.errorService,
  );
}
