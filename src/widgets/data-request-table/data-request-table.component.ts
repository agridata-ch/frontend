import { Component, Signal, computed, inject, output } from '@angular/core';
import { faEye, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import {
  ActionDTO,
  AgridataTableComponent,
  AgridataTableData,
  AgridataTableUtils,
  CellTemplateDirective,
  SortDirections,
} from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';

/**
 * Implements the main table logic. It fetches data requests, maps them into table rows, and
 * defines actions such as viewing details or retreating requests. It applies translations to
 * state values, assigns badge variants for visual state indicators, and emits events when a
 * row or action is triggered.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-request-table',
  imports: [AgridataTableComponent, AgridataBadgeComponent, CellTemplateDirective],
  templateUrl: './data-request-table.component.html',
})
export class DataRequestTableComponent {
  private readonly i18nService = inject(I18nService);
  private readonly dataRequestService = inject(DataRequestService);

  readonly tableRowAction = output<DataRequestDto>();
  readonly realoadDataRequests = output();

  protected readonly dataRequestHumanFriendlyIdHeader = 'data-request.humanFriendlyId';
  protected readonly dataRequestTitleHeader = 'data-request.title';
  protected readonly dataRequestSubmissionDateHeader = 'data-request.submissionDate';
  protected readonly dataRequestStateHeader = 'data-request.state';
  protected readonly dataRequestProviderHeader = 'data-request.provider';

  protected readonly dataRequests = this.dataRequestService.fetchDataRequests;
  protected readonly eyeIcon = faEye;
  protected readonly retreatIcon = faRotateLeft;
  protected readonly SortDirections = SortDirections;
  protected readonly BadgeSize = BadgeSize;
  protected readonly getCellValue = AgridataTableUtils.getCellValue;

  protected readonly requests: Signal<AgridataTableData[]> = computed(() => {
    return (
      this.dataRequests.value()?.map((request: DataRequestDto) => ({
        id: request.id ?? '',
        data: [
          {
            header: this.dataRequestHumanFriendlyIdHeader,
            value: request.humanFriendlyId ?? '',
          },
          {
            header: this.dataRequestTitleHeader,
            value: this.i18nService.useObjectTranslation(request?.title),
          },
          {
            header: this.dataRequestSubmissionDateHeader,
            value: request?.submissionDate ?? '',
          },
          {
            header: this.dataRequestProviderHeader,
            value: 'Agis',
          },
          { header: this.dataRequestStateHeader, value: request.stateCode ?? '' },
        ],
        actions: this.getFilteredActions(request),
        rowAction: () => this.tableRowAction.emit(request),
      })) || []
    );
  });

  protected getFilteredActions = (request?: DataRequestDto): ActionDTO[] => {
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
          this.dataRequestService.fetchDataRequests.reload();
        });
      },
    };

    if (request.stateCode === DataRequestStateEnum.InReview) {
      return [details, retreat];
    }

    return [details];
  };

  protected getTranslatedStateValue(row: AgridataTableData, header: string) {
    const value = this.getCellValue(row, header);
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }

  protected getBadgeVariant = (stateCode: string) => {
    if (stateCode === DataRequestStateEnum.Draft) return BadgeVariant.INFO;
    if (stateCode === DataRequestStateEnum.InReview) return BadgeVariant.INFO;
    if (stateCode === DataRequestStateEnum.ToBeSigned) return BadgeVariant.WARNING;
    if (stateCode === DataRequestStateEnum.Active) return BadgeVariant.SUCCESS;
    return BadgeVariant.DEFAULT;
  };
}
