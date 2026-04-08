import {
  Component,
  computed,
  inject,
  input,
  output,
  ResourceRef,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { faFolderOpen } from '@awesome.me/kit-0b6d1ed528/icons/classic/light';
import {
  faAdd,
  faEye,
  faRotateLeft,
  faTrashCan,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { DataRequestDtoDirective, getBadgeVariant } from '@/shared/data-request';
import { I18nService, I18nPipe, I18nDirective } from '@/shared/i18n';
import { ToastService, ToastType } from '@/shared/toast';
import { AgridataClientTableComponent } from '@/shared/ui/agridata-client-table/agridata-client-table.component';
import { ClientTableMetadata } from '@/shared/ui/agridata-client-table/client-table-model';
import { ActionDTO, CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { EmptyStateComponent } from '@/shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '@/shared/ui/modal/modal.component';
import { DATA_REQUEST_NEW_ID } from '@/widgets/data-request-wizard';

/**
 * Implements the main table logic. It fetches data requests, maps them into table rows, and
 * defines actions such as viewing details or retreating requests. It applies translations to
 * state values, assigns badge variants for visual state indicators, and emits events when a
 * row or action is triggered.
 *
 * CommentLastReviewed: 2026-03-09
 */
@Component({
  selector: 'app-data-request-table',
  templateUrl: './data-request-table.component.html',
  imports: [
    AgridataClientTableComponent,
    AgridataBadgeComponent,
    ButtonComponent,
    DataRequestDtoDirective,
    EmptyStateComponent,
    FontAwesomeModule,
    ButtonComponent,
    ModalComponent,
    I18nPipe,
    I18nDirective,
  ],
})
export class DataRequestTableComponent {
  protected readonly i18nService = inject(I18nService);
  private readonly dataRequestService = inject(DataRequestService);
  private readonly router = inject(Router);
  private readonly toastService = inject(ToastService);

  readonly dataRequestsResource = input.required<ResourceRef<DataRequestDto[] | undefined>>();
  readonly dataRequests = input.required<DataRequestDto[]>();
  readonly tableRowAction = output<DataRequestDto>();

  protected readonly dataRequestHumanFriendlyIdHeader = 'data-request.humanFriendlyId';
  protected readonly dataRequestTitleHeader = 'data-request.title';
  protected readonly dataRequestSubmissionDateHeader = 'data-request.submissionDate';
  protected readonly dataRequestStateHeader = 'data-request.state';
  protected readonly dataRequestProviderHeader = 'data-request.provider';

  protected readonly BadgeSize = BadgeSize;
  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ToastType = ToastType;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly addIcon = faAdd;
  protected readonly deleteIcon = faTrashCan;
  protected readonly eyeIcon = faEye;
  protected readonly folderIcon = faFolderOpen;
  protected readonly retreatIcon = faRotateLeft;

  private readonly humanFriendlyIdTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('humanFriendlyId');
  private readonly dataRequestTitleTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('dataRequestTitle');
  private readonly dataRequestStateTemplate =
    viewChild<TemplateRef<{ $implicit: DataRequestDto }>>('dataRequestState');
  protected readonly emptyStateTemplate = viewChild<TemplateRef<unknown>>('emptyStateTemplate');

  protected readonly showDeleteModal = signal(false);
  protected readonly requestToDelete = signal<DataRequestDto | null>(null);

  protected readonly requestToDeleteTitle = computed(() => {
    const request = this.requestToDelete();
    if (!request) return '';
    return this.i18nService.useObjectTranslation(request.title);
  });

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
              //TODO: use real provider name when available
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
            sortValueFn: (item) => (item ? this.getStatusTranslation(item?.stateCode) : ''),
          },
        ],
        rowMenuActions: this.getFilteredActions,
        rowAction: (item) => this.tableRowAction.emit(item),
      };
    },
  );

  getFilteredActions = (request?: DataRequestDto): ActionDTO[] => {
    if (!request) return [];

    const details = {
      icon: this.eyeIcon,
      label: 'data-request.table.tableActions.details',
      callback: async () => this.tableRowAction.emit(request),
    };
    const retreat = {
      icon: this.retreatIcon,
      label: 'data-request.table.tableActions.retreat',
      callback: async () => {
        await this.dataRequestService.retreatDataRequest(request.id);
        this.dataRequestsResource().reload();
      },
    };
    const deleteAction = {
      icon: this.deleteIcon,
      label: 'data-request.table.tableActions.delete',
      callback: async () => {
        this.requestToDelete.set(request);
        this.showDeleteModal.set(true);
      },
    };

    if (request.stateCode === DataRequestStateEnum.InReview) {
      return [details, retreat];
    }
    if (request.stateCode === DataRequestStateEnum.Draft) {
      return [details, deleteAction];
    }

    return [details];
  };

  protected getStatusTranslation(value?: string) {
    if (!value) return '';
    return this.i18nService.translate(`data-request.stateCode.${value}`);
  }

  protected newRequest = () => {
    this.router.navigate([ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH, DATA_REQUEST_NEW_ID]).then();
  };

  protected deleteRequest = async () => {
    const request = this.requestToDelete();
    if (!request) return;

    await this.dataRequestService
      .deleteDataRequest(request.id)
      .then(() => {
        const toastTitle = this.i18nService.translate(
          'data-request.table.deleteRequest.success.title',
        );
        const toastMessage = this.i18nService.translate(
          'data-request.table.deleteRequest.success.message',
          {
            title: this.i18nService.useObjectTranslation(request.title),
          },
        );
        this.toastService.show(toastTitle, toastMessage, ToastType.Success);
        this.dataRequestsResource().reload();
      })
      .catch((error) => {
        const toastTitle = this.i18nService.translate(
          'data-request.table.deleteRequest.error.title',
        );
        const toastMessage = this.i18nService.translate(
          'data-request.table.deleteRequest.error.message',
          {
            title: this.i18nService.useObjectTranslation(request.title),
            error: error.message,
          },
        );
        this.toastService.show(toastTitle, toastMessage, ToastType.Error);
      })
      .finally(() => {
        this.requestToDelete.set(null);
        this.showDeleteModal.set(false);
      });
  };

  protected cancelDelete = () => {
    this.requestToDelete.set(null);
    this.showDeleteModal.set(false);
  };
}
