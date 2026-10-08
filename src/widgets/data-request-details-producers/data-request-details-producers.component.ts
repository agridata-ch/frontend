import {
  Component,
  computed,
  inject,
  input,
  resource,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { faPlus } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';

import { DataRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  ConsentRequestFundamentalViewDto,
  ConsentRequestStateEnum,
  DataRequestDto,
  PageResponseDto,
  ResourceQueryDto,
} from '@/entities/openapi';
import { DataRequestAddProducersComponent } from '@/features/data-request-add-producers';
import { getConsentRequestBadgeVariant } from '@/shared/consent-request';
import { UID_REGEX } from '@/shared/constants/constants';
import { formatDate } from '@/shared/date';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  ActionDTO,
  AgridataTableComponent,
  CellRendererTypes,
  ColumnDefinition,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { EmptyStateComponent } from '@/shared/ui/empty-state';

import { ConsentRequestFundamentalViewDtoDirective } from './consent-request-fundamental-view-dto.directive';
import { DataRequestDetailsProducersMetadataComponent } from './data-request-details-producers-metadata';

/**
 * Shows the producers (consent requests) of a data request in the "Producer" tab of the Data
 * Request Details sidepanel. Fetches server-side paginated data with search and sorting; the BUR
 * column is only shown when the data request has BUR products.
 *
 * CommentLastReviewed: 2026-09-11
 */
@Component({
  selector: 'app-data-request-details-producers',
  imports: [
    AgridataTableComponent,
    AgridataBadgeComponent,
    ButtonComponent,
    ConsentRequestFundamentalViewDtoDirective,
    DataRequestAddProducersComponent,
    I18nDirective,
    EmptyStateComponent,
    DataRequestDetailsProducersMetadataComponent,
  ],
  templateUrl: './data-request-details-producers.component.html',
})
export class DataRequestDetailsProducersComponent {
  // Injects
  protected readonly i18nService = inject(I18nService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly stateService = inject(AgridataStateService);

  // Constants
  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly addIcon = faPlus;
  protected readonly getConsentRequestBadgeVariant = getConsentRequestBadgeVariant;
  private readonly ADD_BURS_ACTION = 'data-request.details.producer.addBurs';
  private readonly UID_HEADER = 'data-request.uid';
  private readonly BUR_HEADER = 'data-request.bur';
  private readonly LAST_CHANGED_HEADER = 'data-request.lastChanged';
  private readonly STATE_HEADER = 'data-request.state';

  // Input properties
  readonly dataRequest = input.required<DataRequestDto>();

  // Signals
  protected readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);
  protected readonly addProducersOpen = signal(false);
  protected readonly prefillUid = signal<string | undefined>(undefined);
  private readonly stateTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestFundamentalViewDto }>>('stateTemplate');

  // Computed signals
  private readonly hasBurProducts = computed(() => this.dataRequest().burPresent);

  protected readonly producersResource = resource({
    params: () => ({
      actingRole: this.stateService.actingRole(),
      id: this.dataRequest().id,
      query: this.resourceQueryDto() ?? {},
    }),
    loader: ({ params }) =>
      this.dataRequestService.getConsentRequestsOfDataRequest(
        params.id,
        params.query,
        params.actingRole,
      ),
    defaultValue: {} as PageResponseDto,
  });

  protected readonly tableMetadata = computed<TableMetadata<ConsentRequestFundamentalViewDto>>(
    () => {
      const burColumn: ColumnDefinition<ConsentRequestFundamentalViewDto>[] = this.hasBurProducts()
        ? [
            {
              name: this.BUR_HEADER,
              sortable: true,
              sortField: 'dataProducerBur',
              renderer: {
                type: CellRendererTypes.FUNCTION,
                cellRenderFn: (row) => row.dataProducerBur ?? '',
              },
            },
          ]
        : [];

      return {
        idColumn: 'id',
        columns: [
          {
            name: this.UID_HEADER,
            sortable: true,
            sortField: 'dataProducerUid',
            initialSortDirection: SortDirections.ASC,
            renderer: {
              type: CellRendererTypes.FUNCTION,
              cellRenderFn: (row) => row.dataProducerUid ?? '',
            },
          },
          ...burColumn,
          {
            name: this.LAST_CHANGED_HEADER,
            sortable: true,
            sortField: 'lastModifiedDateTime',
            renderer: {
              type: CellRendererTypes.FUNCTION,
              cellRenderFn: (row) => formatDate(row.lastModifiedDateTime) ?? '',
            },
          },
          {
            name: this.STATE_HEADER,
            sortable: true,
            sortField: 'stateCode',
            cellCssClasses: 'whitespace-nowrap',
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.stateTemplate(),
            },
          },
        ],
        // Adding more BURs for a UID only makes sense when the data request has BUR products.
        rowMenuActions: this.hasBurProducts() ? this.getRowActions : undefined,
      };
    },
  );

  // Effects
  private readonly errorHandler = createResourceErrorHandlerEffect(
    this.producersResource,
    this.errorService,
  );

  protected openAddModal(): void {
    // Seed the modal from the table search when the term is a UID, so a "not found" search flows
    // straight into adding that producer.
    const searchTerm = this.resourceQueryDto()?.searchTerm ?? '';
    this.prefillUid.set(UID_REGEX.test(searchTerm) ? searchTerm : undefined);
    this.addProducersOpen.set(true);
  }

  protected getStateTranslation(stateCode?: ConsentRequestStateEnum): string {
    return stateCode
      ? this.i18nService.translate(`consent-request.dataRequest.stateCode.${stateCode}`)
      : '';
  }

  private readonly getRowActions = (item?: ConsentRequestFundamentalViewDto): ActionDTO[] => {
    if (!item?.dataProducerUid) return [];
    return [
      {
        icon: this.addIcon,
        label: this.ADD_BURS_ACTION,
        callback: () => {
          this.prefillUid.set(item.dataProducerUid);
          this.addProducersOpen.set(true);
        },
      },
    ];
  };
}
