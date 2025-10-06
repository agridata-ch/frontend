import {
  Component,
  ResourceRef,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { faEye, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { DataRequestService } from '@/entities/api';
import {
  ConsentRequestProducerViewDtoDataRequestStateCode,
  DataRequestDto,
  DataRequestStateEnum,
  TranslationDto,
} from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { AgridataClientTableComponent } from '@/shared/ui/agridata-client-table/agridata-client-table.component';
import { ClientTableMetadata } from '@/shared/ui/agridata-client-table/client-table-model';
import { ActionDTO, CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { DataRequestDtoDirective } from '@/widgets/data-request-table/data-request-dto.directive';

/**
 * Implements the main table logic. It fetches data requests, maps them into table rows, and
 * defines actions such as viewing details or retreating requests. It applies translations to
 * state values, assigns badge variants for visual state indicators, and emits events when a
 * row or action is triggered.
 *
 * CommentLastReviewed: 2025-09-18
 */
@Component({
  selector: 'app-data-request-table',
  templateUrl: './data-request-table.component.html',
  imports: [AgridataClientTableComponent, AgridataBadgeComponent, DataRequestDtoDirective],
})
export class DataRequestTableComponent {
  private readonly i18nService = inject(I18nService);
  private readonly dataRequestService = inject(DataRequestService);

  readonly dataRequestsResource = input.required<ResourceRef<DataRequestDto[] | undefined>>();
  readonly dataRequests = input.required<DataRequestDto[]>();
  readonly tableRowAction = output<DataRequestDto>();

  protected readonly dataRequestHumanFriendlyIdHeader = 'data-request.humanFriendlyId';
  protected readonly dataRequestTitleHeader = 'data-request.title';
  protected readonly dataRequestSubmissionDateHeader = 'data-request.submissionDate';
  protected readonly dataRequestStateHeader = 'data-request.state';
  protected readonly dataRequestProviderHeader = 'data-request.provider';

  protected readonly eyeIcon = faEye;
  protected readonly retreatIcon = faRotateLeft;
  protected readonly BadgeSize = BadgeSize;

  private readonly humanFriendlyIdTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('humanFriendlyId');
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
            name: this.dataRequestHumanFriendlyIdHeader,
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.humanFriendlyIdTemplate(),
            },
            sortable: true,
            sortValueFn: (item) => item.humanFriendlyId ?? '',
          },
          {
            name: this.dataRequestTitleHeader,
            renderer: {
              type: CellRendererTypes.TEMPLATE,
              template: this.dataRequestTitleTemplate(),
            },
            sortable: true,
            sortValueFn: (item) => this.getObjTranslation(item?.title),
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
            sortable: true,
            sortValueFn: (item) => this.getStatusTranslation(item?.stateCode),
          },
        ],
        actions: this.getFilteredActions,
        rowAction: (item) => this.tableRowAction.emit(item),
      };
    },
  );

  getFilteredActions = (request?: DataRequestDto): ActionDTO[] => {
    if (!request) return [];

    const details = {
      icon: this.eyeIcon,
      label: 'data-request.table.tableActions.details',
      callback: () => this.tableRowAction.emit(request),
    };
    const retreat = {
      icon: this.retreatIcon,
      label: 'data-request.table.tableActions.retreat',
      callback: () => {
        this.dataRequestService.retreatDataRequest(request.id!).then(() => {
          this.dataRequestsResource().reload();
        });
      },
    };

    if (request.stateCode === DataRequestStateEnum.InReview) {
      return [details, retreat];
    }

    return [details];
  };

  protected getStatusTranslation(
    value: ConsentRequestProducerViewDtoDataRequestStateCode | undefined,
  ) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }

  protected getBadgeVariant = (
    stateCode: ConsentRequestProducerViewDtoDataRequestStateCode | undefined,
  ) => {
    if (stateCode === DataRequestStateEnum.Draft) return BadgeVariant.INFO;
    if (stateCode === DataRequestStateEnum.InReview) return BadgeVariant.INFO;
    if (stateCode === DataRequestStateEnum.ToBeSigned) return BadgeVariant.WARNING;
    if (stateCode === DataRequestStateEnum.Active) return BadgeVariant.SUCCESS;
    return BadgeVariant.DEFAULT;
  };

  getObjTranslation(key: TranslationDto | undefined) {
    if (!key) return '';
    return this.i18nService.useObjectTranslation(key);
  }
}
