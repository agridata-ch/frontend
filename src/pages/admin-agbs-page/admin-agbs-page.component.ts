import { Component, computed, inject, resource, signal } from '@angular/core';
import { faGavel } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AgbRevisionOverviewDto, ResourceQueryDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';

/**
 * Admin-only page listing all AGB revisions (previous and current).
 *
 * CommentLastReviewed: 2026-10-13
 */
@Component({
  selector: 'app-admin-agbs-page',
  templateUrl: './admin-agbs-page.component.html',
  imports: [AgridataTableComponent, ErrorOutletComponent, FaIconComponent, I18nDirective],
})
export class AdminAgbsPageComponent {
  // Injects
  private readonly agbService = inject(AgbService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly ENFORCE_CONSENT_FROM_HEADER = 'admin-agbs.table.enforceConsentFrom';
  protected readonly TITLE_HEADER = 'admin-agbs.table.title';
  protected readonly VALID_FROM_HEADER = 'admin-agbs.table.validFrom';
  protected readonly VALID_TO_HEADER = 'admin-agbs.table.validTo';
  protected readonly VERSION_HEADER = 'admin-agbs.table.version';
  protected readonly faGavel = faGavel;

  // Signals
  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  readonly fetchAgbRevisionsResource = resource({
    params: () => ({
      actingRole: this.stateService.actingRole(),
      query: this.resourceQueryDto() ?? {},
    }),
    loader: ({ params }) => this.agbService.fetchAllAgbRevisions(params.query),
  });

  private readonly titleValue = this.i18nService.translateSignal('admin-agbs.table.titleValue');

  // Computed
  protected readonly agbRevisionsTableMetaData = computed<TableMetadata<AgbRevisionOverviewDto>>(
    () => ({
      idColumn: 'id',
      columns: [
        {
          name: this.VERSION_HEADER,
          sortable: true,
          sortField: 'version',
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.version ?? '-',
          },
        },
        {
          name: this.TITLE_HEADER,
          sortable: false,
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: () => this.titleValue() ?? '',
          },
        },
        {
          name: this.VALID_FROM_HEADER,
          sortable: true,
          sortField: 'validFrom',
          initialSortDirection: SortDirections.DESC,
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.validFrom ?? '-',
          },
        },
        {
          name: this.VALID_TO_HEADER,
          sortable: true,
          sortField: 'validTo',
          renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.validTo ?? '-' },
        },
        {
          name: this.ENFORCE_CONSENT_FROM_HEADER,
          sortable: true,
          sortField: 'enforceConsentFrom',
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.enforceConsentFrom ?? '-',
          },
        },
      ],
    }),
  );

  // Effects
  protected readonly fetchAgbRevisionsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchAgbRevisionsResource,
    this.errorService,
  );
}
