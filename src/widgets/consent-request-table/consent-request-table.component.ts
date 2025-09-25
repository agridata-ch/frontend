import {
  Component,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import {
  ConsentRequestProducerViewDto,
  ConsentRequestStateEnum,
  TranslationDto,
} from '@/entities/openapi';
import {
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
} from '@/shared/consent-request';
import { I18nService } from '@/shared/i18n/i18n.service';
import { ToastService, ToastType } from '@/shared/toast';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import { ActionDTO, CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';
import {
  AgridataClientTableComponent,
  ClientTableMetadata,
} from '@/shared/ui/agridata-table/client-table';
import { AgridataBadgeComponent, BadgeSize, BadgeVariant } from '@/shared/ui/badge';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { ConsentRequestFilterComponent } from '@/widgets/consent-request-table/consent-request-filter';
import { ConsentRequestListComponent } from '@/widgets/consent-request-table/consent-request-list';

import { ConsentRequestProducerViewDtoDirective } from './consent-request-producer-view-dto.directive';

/**
 * Implements the main table logic. It accepts a list of consent requests, transforms them into
 * table rows, and applies filters and sorting. The component provides row actions, state updates
 * with undo support, and toast notifications. It highlights open requests and integrates avatars
 * and badges for clear presentation.
 *
 * CommentLastReviewed: 2025-09-18
 */
@Component({
  selector: 'app-consent-request-table',
  imports: [
    ConsentRequestFilterComponent,
    AgridataBadgeComponent,
    ConsentRequestListComponent,
    AgridataClientTableComponent,
    ConsentRequestProducerViewDtoDirective,
    AgridataContactCardComponent,
  ],
  templateUrl: './consent-request-table.component.html',
})
export class ConsentRequestTableComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly i18nService = inject(I18nService);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly consentRequests = input.required<ConsentRequestProducerViewDto[]>();
  readonly tableRowAction = output<ConsentRequestProducerViewDto>();

  private readonly dataRequestConsumerTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestProducerViewDto }>>('dataRequestConsumer');
  private readonly dataRequestTitleTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestProducerViewDto }>>('dataRequestTitle');
  private readonly dataRequestStateTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestProducerViewDto }>>('dataRequestState');
  protected readonly checkIcon = faCheck;
  protected readonly BadgeSize = BadgeSize;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;

  protected readonly dataRequestTitleHeader = 'consent-request.dataRequest.title';
  protected readonly dataRequestStateHeader = 'consent-request.dataRequest.state';
  protected readonly dataRequestConsumerHeader = 'consent-request.dataRequest.consumerName';
  protected readonly dataRequestDateHeader = 'consent-request.dataRequest.date';
  protected readonly stateCodeFilter = signal<string | null>(null);
  readonly filteredConsentRequests = computed(() => {
    return this.consentRequests().filter(
      (request) => !this.stateCodeFilter() || request.stateCode === this.stateCodeFilter(),
    );
  });

  getFilteredActions = (request?: ConsentRequestProducerViewDto): ActionDTO[] => {
    if (!request) return [];
    const requestTitle = this.i18nService.useObjectTranslation(request.dataRequest?.title);

    const consent: ActionDTO = {
      icon: this.checkIcon,
      label: 'consent-request.table.tableActions.consent',
      callback: () => {
        void this.updateConsentRequestState(
          request.id,
          ConsentRequestStateEnum.Granted,
          requestTitle,
        );
      },
      isMainAction: true,
    };

    return request.stateCode === ConsentRequestStateEnum.Opened ? [consent] : [];
  };

  openDetails = (request?: ConsentRequestProducerViewDto | null) => {
    if (!request) return;
    this.tableRowAction.emit(request);
  };

  protected readonly consentRequestsTableMetaData = computed<
    ClientTableMetadata<ConsentRequestProducerViewDto>
  >(() => {
    return {
      idColumn: 'id',
      columns: [
        {
          name: this.dataRequestConsumerHeader,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.dataRequestConsumerTemplate(),
          },
          enableSort: true,
          sortValueFn: (item: ConsentRequestProducerViewDto) =>
            item.dataRequest?.dataConsumerDisplayName ?? '',
        },
        {
          name: this.dataRequestTitleHeader,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.dataRequestTitleTemplate(),
          },
          enableSort: true,
          sortValueFn: (item: ConsentRequestProducerViewDto) =>
            item.dataRequest?.title ? this.getTranslation(item.dataRequest.title) : '',
        },
        {
          name: this.dataRequestDateHeader,
          enableSort: true,
          initialSortDirection: SortDirections.DESC,
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) => row.requestDate ?? '',
          },
        },
        {
          name: this.dataRequestStateHeader,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.dataRequestStateTemplate(),
          },
          enableSort: true,
          sortValueFn: (item: ConsentRequestProducerViewDto) =>
            this.getTranslatedStateValue(item.stateCode),
        },
      ],
      actions: this.getFilteredActions,
      rowAction: this.openDetails,
      highlightFn: (item) => item.stateCode === ConsentRequestStateEnum.Opened,
      searchFn: (data, searchTerm) =>
        data.filter((item) => this.getTranslation(item.dataRequest?.title).includes(searchTerm)),
    };
  });

  getTranslatedStateValue(stateCode?: ConsentRequestStateEnum | undefined) {
    if (!stateCode) {
      return '';
    }
    return this.i18nService.translate(`consent-request.dataRequest.stateCode.${stateCode}`);
  }

  setStateCodeFilter(state: string | null) {
    this.stateCodeFilter.set(state);
  }

  updateConsentRequestState = async (id: string, stateCode: string, requestName?: string) => {
    this.consentRequestService
      .updateConsentRequestStatus(id, stateCode)
      .then(() => {
        const toastTitle = this.i18nService.translate(getToastTitle(stateCode), {
          name: requestName,
        });
        const toastMessage = this.i18nService.translate(getToastMessage(stateCode), {
          name: requestName,
        });
        const toastType = getToastType(stateCode);
        const undoAction = this.prepareUndoAction(id);
        this.toastService.show(toastTitle, toastMessage, toastType, undoAction);
        this.consentRequestService.fetchConsentRequests.reload();
      })
      .catch((error) => {
        const errorMessage = this.i18nService.translate('consent-request.table.error', {
          requestId: error.error?.requestId ?? '',
        });
        console.log(error.error);
        this.toastService.show(error.error.message, errorMessage, ToastType.Error);
      });
  };

  prepareUndoAction(id: string) {
    const previousStateCode = this.consentRequests().find(
      (request) => request.id === id,
    )?.stateCode;
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.consentRequestService.updateConsentRequestStatus(id, previousStateCode!).then(() => {
        this.consentRequestService.fetchConsentRequests.reload();
      });
    });
  }

  getBadgeVariant = (stateCode: ConsentRequestStateEnum | undefined) => {
    if (stateCode === ConsentRequestStateEnum.Opened) return BadgeVariant.INFO;
    if (stateCode === ConsentRequestStateEnum.Granted) return BadgeVariant.SUCCESS;
    if (stateCode === ConsentRequestStateEnum.Declined) return BadgeVariant.ERROR;
    return BadgeVariant.DEFAULT;
  };

  getTranslation(key: TranslationDto | undefined) {
    if (!key) return '';
    return this.i18nService.useObjectTranslation(key);
  }
}
