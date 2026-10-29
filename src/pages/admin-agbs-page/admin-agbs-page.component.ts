import { Component, computed, inject, resource, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { faGavel, faPlus } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AgbService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { AgbRevisionSummaryDto, ResourceQueryDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
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
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AGB_NEW_ID } from '@/widgets/admin-agb-form';

/**
 * Admin-only page listing all AGB revisions (previous and current). Row arrows navigate to a child
 * route rendering the AGB sidepanel, the top-right button opens the same sidepanel in create mode.
 *
 * CommentLastReviewed: 2026-10-28
 */
@Component({
  selector: 'app-admin-agbs-page',
  templateUrl: './admin-agbs-page.component.html',
  imports: [
    AgridataTableComponent,
    ButtonComponent,
    ErrorOutletComponent,
    FaIconComponent,
    I18nDirective,
    RouterOutlet,
  ],
})
export class AdminAgbsPageComponent {
  // Injects
  private readonly agbService = inject(AgbService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly ENFORCE_CONSENT_FROM_HEADER = 'admin-agbs.table.enforceConsentFrom';
  protected readonly TITLE_HEADER = 'admin-agbs.table.title';
  protected readonly VALID_FROM_HEADER = 'admin-agbs.table.validFrom';
  protected readonly VALID_TO_HEADER = 'admin-agbs.table.validTo';
  protected readonly VERSION_HEADER = 'admin-agbs.table.version';
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly faGavel = faGavel;
  protected readonly faPlus = faPlus;

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
  protected readonly agbRevisionsTableMetaData = computed<TableMetadata<AgbRevisionSummaryDto>>(
    () => ({
      idColumn: 'id',
      showRowActionButton: true,
      rowAction: (row) => this.openDetails(row),
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

  protected openCreate(): void {
    void this.router.navigate([ROUTE_PATHS.ADMIN_AGBS_PATH, AGB_NEW_ID]);
  }

  private openDetails(row: AgbRevisionSummaryDto): void {
    void this.router.navigate([ROUTE_PATHS.ADMIN_AGBS_PATH, row.id]);
  }
}
