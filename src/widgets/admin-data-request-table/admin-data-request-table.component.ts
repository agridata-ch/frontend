import {
  Component,
  computed,
  inject,
  input,
  output,
  ResourceRef,
  TemplateRef,
  viewChild,
} from '@angular/core';

import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataRequestDto,
} from '@/entities/openapi';
import { DataRequestDtoDirective, getBadgeVariant } from '@/shared/data-request';
import { I18nService } from '@/shared/i18n';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { AgridataClientTableComponent } from '@/shared/ui/agridata-client-table/agridata-client-table.component';
import { ClientTableMetadata } from '@/shared/ui/agridata-client-table/client-table-model';
import { CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';

/**
 * Implements the main table logic. It fetches data requests, maps them into table rows.
 * It applies translations to state values, assigns badge variants for visual state indicators,
 * and emits events when a row or action is triggered.
 *
 * CommentLastReviewed: 2026-01-06
 */
@Component({
  selector: 'app-admin-data-request-table',
  templateUrl: './admin-data-request-table.component.html',
  imports: [
    AgridataClientTableComponent,
    AgridataBadgeComponent,
    DataRequestDtoDirective,
    AgridataContactCardComponent,
  ],
})
export class AdminDataRequestTableComponent {
  protected readonly i18nService = inject(I18nService);

  readonly dataRequestsResource = input.required<ResourceRef<DataRequestDto[] | undefined>>();
  readonly dataRequests = input.required<DataRequestDto[]>();
  readonly tableRowAction = output<DataRequestDto>();

  protected readonly dataRequestConsumerHeader = 'admin.data-request.consumer';
  protected readonly dataRequestTitleHeader = 'admin.data-request.title';
  protected readonly dataRequestSubmissionDateHeader = 'admin.data-request.submissionDate';
  protected readonly dataRequestProviderHeader = 'admin.data-request.provider';
  protected readonly dataRequestStateHeader = 'admin.data-request.state';
  protected readonly BadgeSize = BadgeSize;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly getBadgeVariant = getBadgeVariant;

  private readonly dataRequestConsumerTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('dataRequestConsumer');
  private readonly dataRequestTitleTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('dataRequestTitle');
  private readonly dataRequestStateTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('dataRequestState');

  protected readonly dataRequestsTableMetaData = computed<ClientTableMetadata<DataRequestDto>>(
    () => {
      return {
        idColumn: 'id',
        columns: [
          {
            name: this.dataRequestConsumerHeader,
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.dataRequestConsumerTemplate(),
            },
            sortable: true,
            sortValueFn: (item) => item?.dataConsumerDisplayName ?? '',
          },
          {
            name: this.dataRequestTitleHeader,
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.dataRequestTitleTemplate(),
            },
            sortable: true,
            sortValueFn: (item) => this.i18nService.useObjectTranslation(item?.title),
          },
          {
            name: this.dataRequestSubmissionDateHeader,
            renderer: {
              type: CellRendererTypes.FUNCTION,
              cellRenderFn: (item) => item?.submissionDate ?? '',
            },
            sortable: true,
            initialSortDirection: SortDirections.DESC,
            sortValueFn: (item) => item.submissionDate ?? '',
          },
          {
            name: this.dataRequestProviderHeader,
            renderer: {
              type: CellRendererTypes.FUNCTION,
              cellRenderFn: () => 'Agis',
            },
          },
          {
            name: this.dataRequestStateHeader,
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.dataRequestStateTemplate(),
            },
            cellCssClasses: 'whitespace-nowrap',
            sortable: true,
            sortValueFn: (item) => this.getStatusTranslation(item?.stateCode),
          },
        ],
        showRowActionButton: true,
        rowAction: (item) => this.tableRowAction.emit(item),
      };
    },
  );

  protected getStatusTranslation(
    value: ConsentRequestProducerViewDtoDataRequestStateCode | undefined,
  ) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }
}
