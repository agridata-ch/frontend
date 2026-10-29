import {
  Component,
  computed,
  inject,
  resource,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { faFileSignature } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { UserService } from '@/entities/api/user.service';
import {
  AgbAcceptanceOverviewDto,
  AgbAcceptanceStatusEnum,
  PageResponseDto,
  ResourceQueryDto,
} from '@/entities/openapi';
import { AgbAcceptanceOverviewDtoDirective } from '@/pages/agb-acceptances-page/agb-acceptance-overview-dto.directive';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import {
  AgridataTableComponent,
  CellRendererTypes,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { EmptyStateComponent } from '@/shared/ui/empty-state';
import { FilterButtonsComponent, FilterOption } from '@/shared/ui/filter-buttons';
import { formatFullName, normalizeUid } from '@/shared/utils';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card/';

const STATUS_BADGE_VARIANTS: Record<AgbAcceptanceStatusEnum, BadgeVariant> = {
  [AgbAcceptanceStatusEnum.Accepted]: BadgeVariant.SUCCESS,
  [AgbAcceptanceStatusEnum.TransitionPeriod]: BadgeVariant.WARNING,
  [AgbAcceptanceStatusEnum.Pending]: BadgeVariant.INFO,
};

const STATUS_FILTER_OPTIONS: FilterOption[] = [
  { label: 'agb-acceptances.filter.all', value: null },
  ...Object.values(AgbAcceptanceStatusEnum).map((status) => ({
    label: `agb-acceptances.state.${status}`,
    value: status,
  })),
];

/**
 * Shows admins and supporters which users accepted the current AGB, with UID search and a status
 * filter.
 *
 * CommentLastReviewed: 2026-10-29
 */
@Component({
  selector: 'app-agb-acceptances-page',
  imports: [
    AgbAcceptanceOverviewDtoDirective,
    AgridataBadgeComponent,
    AgridataContactCardComponent,
    AgridataTableComponent,
    EmptyStateComponent,
    ErrorOutletComponent,
    FaIconComponent,
    FilterButtonsComponent,
    I18nDirective,
  ],
  templateUrl: './agb-acceptances-page.component.html',
})
export class AgbAcceptancesPageComponent {
  // Injects
  private readonly errorService = inject(ErrorHandlerService);
  private readonly userService = inject(UserService);

  // Constants
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly BadgeSize = BadgeSize;
  protected readonly STATUS_BADGE_VARIANTS = STATUS_BADGE_VARIANTS;
  protected readonly STATUS_FILTER_OPTIONS = STATUS_FILTER_OPTIONS;
  protected readonly faFileSignature = faFileSignature;
  protected readonly formatFullName = formatFullName;

  // Signals
  protected readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);
  protected readonly statusFilter = signal<string | null>(null);
  private readonly nameTemplate =
    viewChild<TemplateRef<{ $implicit: AgbAcceptanceOverviewDto }>>('nameTemplate');
  private readonly statusTemplate =
    viewChild<TemplateRef<{ $implicit: AgbAcceptanceOverviewDto }>>('statusTemplate');

  // Computed Signals
  protected readonly columnFilters = computed(() => {
    const status = this.statusFilter();
    return status ? [`status:${status}`] : undefined;
  });
  protected readonly tableMetadata = computed<TableMetadata<AgbAcceptanceOverviewDto>>(() => ({
    idColumn: 'userId',
    columns: [
      {
        name: 'agb-acceptances.table.name',
        sortable: true,
        sortField: 'givenName',
        renderer: { type: CellRendererTypes.TEMPLATE, template: this.nameTemplate() },
      },
      {
        name: 'agb-acceptances.table.email',
        sortable: true,
        sortField: 'email',
        renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.email ?? '' },
      },
      {
        name: 'agb-acceptances.table.uid',
        sortable: true,
        sortField: 'uid',
        renderer: { type: CellRendererTypes.FUNCTION, cellRenderFn: (row) => row.uid ?? '' },
      },
      {
        name: 'agb-acceptances.table.lastAccepted',
        headerCssClasses: 'w-0',
        cellCssClasses: 'w-0 whitespace-nowrap',
        sortable: true,
        sortField: 'lastAcceptedAgbDate',
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.lastAcceptedAgbDate ?? '',
        },
      },
      {
        name: 'agb-acceptances.table.acceptedVersion',
        headerCssClasses: 'w-0',
        cellCssClasses: 'w-0 whitespace-nowrap',
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.lastAcceptedAgbVersion ?? '',
        },
      },
      {
        name: 'agb-acceptances.table.state',
        renderer: { type: CellRendererTypes.TEMPLATE, template: this.statusTemplate() },
      },
    ],
  }));

  // Resources
  protected readonly agbAcceptancesResource = resource({
    params: () => this.resourceQueryDto(),
    loader: ({ params }) =>
      this.userService.getAgbAcceptances({
        ...params,
        searchTerm: params.searchTerm && normalizeUid(params.searchTerm),
      }),
    defaultValue: {} as PageResponseDto,
  });

  // Effects
  private readonly _errorHandlerEffect = createResourceErrorHandlerEffect(
    this.agbAcceptancesResource,
    this.errorService,
  );
}
