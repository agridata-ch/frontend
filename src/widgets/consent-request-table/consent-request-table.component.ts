import {
  Component,
  ResourceRef,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';

import { AnalyticsService } from '@/app/analytics.service';
import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import {
  ConsentRequestAggregationProducerView,
  ConsentRequestAggregationStateEnum,
  ConsentRequestStateEnum,
  TranslationDto,
} from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { ClickStopPropagationDirective } from '@/shared/click-stop-propagation';
import {
  getAggregationBadgeVariant,
  getToastMessage,
  getToastTitle,
  getToastType,
  getUndoAction,
  isOpenAggregationState,
  matchesAggregationStateFilter,
} from '@/shared/consent-request';
import { I18nPipe } from '@/shared/i18n';
import { I18nService } from '@/shared/i18n/i18n.service';
import { ToastService } from '@/shared/toast';
import { AvatarSize, AvatarSkin } from '@/shared/ui/agridata-avatar';
import {
  AgridataClientTableComponent,
  ClientTableMetadata,
} from '@/shared/ui/agridata-client-table';
import { CellRendererTypes, SortDirections } from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { AgridataContactCardComponent } from '@/widgets/agridata-contact-card';
import { ConsentRequestEmptyStateComponent } from '@/widgets/consent-request-empty-state';
import { ConsentRequestFilterComponent } from '@/widgets/consent-request-table/consent-request-filter';
import { ConsentRequestListComponent } from '@/widgets/consent-request-table/consent-request-list';

import { ConsentRequestProducerViewDtoDirective } from './consent-request-producer-view-dto.directive';

/**
 * Implements the main table logic. It accepts a list of consent requests, transforms them into
 * table rows, and applies filters and sorting. The component provides row actions, state updates
 * with undo support, and toast notifications. It highlights open requests and integrates avatars
 * and badges for clear presentation.
 *
 * CommentLastReviewed: 2026-05-21
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
    ButtonComponent,
    ClickStopPropagationDirective,
    I18nPipe,
    ConsentRequestEmptyStateComponent,
  ],
  templateUrl: './consent-request-table.component.html',
})
export class ConsentRequestTableComponent {
  private readonly toastService = inject(ToastService);
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly i18nService = inject(I18nService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly analyticsService = inject(AnalyticsService);
  // binds to the route parameter :consentRequestId, which is a consent request of an aggregation
  readonly consentRequestId = input<string>();
  readonly consentRequestAggregations = input.required<ConsentRequestAggregationProducerView[]>();

  readonly tableRowAction = output<ConsentRequestAggregationProducerView>();
  readonly consentRequestAggregationsResource =
    input<ResourceRef<ConsentRequestAggregationProducerView[]>>();

  private readonly dataRequestConsumerTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestAggregationProducerView }>>(
      'dataRequestConsumer',
    );
  private readonly dataRequestTitleTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestAggregationProducerView }>>(
      'dataRequestTitle',
    );
  private readonly consentRequestStateTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestAggregationProducerView }>>(
      'consentRequestState',
    );
  private readonly consentRequestActionTemplate =
    viewChild<TemplateRef<{ $implicit: ConsentRequestAggregationProducerView }>>(
      'consentRequestAction',
    );
  protected readonly emptyStateTemplate = viewChild<TemplateRef<unknown>>('emptyStateTemplate');

  protected readonly BadgeSize = BadgeSize;
  protected readonly AvatarSize = AvatarSize;
  protected readonly AvatarSkin = AvatarSkin;
  protected readonly appBaseUrl = environment.appBaseUrl;

  protected readonly dataRequestTitleHeader = 'consent-request.dataRequest.title';
  protected readonly dataRequestStateHeader = 'consent-request.dataRequest.state';
  protected readonly dataRequestConsumerHeader = 'consent-request.dataRequest.consumerName';
  protected readonly dataRequestDateHeader = 'consent-request.dataRequest.date';

  protected readonly stateCodeFilter = signal<string | null>(null);
  protected readonly showAcceptedLoading = signal(false);
  private readonly elementLoadingSignals = new Map<string, WritableSignal<boolean>>();

  protected readonly acceptConsentActionDisabled = computed(() =>
    this.agridataStateService.isImpersonating(),
  );
  readonly filteredConsentRequestAggregations = computed(() => {
    return this.consentRequestAggregations().filter((request) =>
      matchesAggregationStateFilter(request.stateCode, this.stateCodeFilter()),
    );
  });

  openDetails = (request?: ConsentRequestAggregationProducerView | null) => {
    if (!request) return;
    this.tableRowAction.emit(request);
  };

  protected readonly consentRequestsTableMetaData = computed<
    ClientTableMetadata<ConsentRequestAggregationProducerView>
  >(() => {
    return {
      tableId: 'consent-requests-table',
      idColumn: 'id',
      columns: [
        {
          name: this.dataRequestConsumerHeader,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.dataRequestConsumerTemplate(),
          },
          sortable: true,
          sortValueFn: (item: ConsentRequestAggregationProducerView) =>
            item.dataRequest?.dataConsumerDisplayName ?? '',
        },
        {
          name: this.dataRequestTitleHeader,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.dataRequestTitleTemplate(),
          },
          sortable: true,
          sortValueFn: (item: ConsentRequestAggregationProducerView) =>
            item.dataRequest?.title ? this.getTranslation(item.dataRequest.title) : '',
        },
        {
          name: this.dataRequestDateHeader,
          sortable: true,
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
            template: this.consentRequestStateTemplate(),
          },
          sortable: true,
          sortValueFn: (item: ConsentRequestAggregationProducerView) =>
            this.getTranslatedStateValue(item.stateCode),
        },
        {
          name: '',
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.consentRequestActionTemplate(),
          },
          headerCssClasses: 'w-0',
          cellCssClasses: 'w-0',
          sortable: false,
        },
      ],
      rowAction: this.openDetails,
      showRowActionButton: true,
      highlightFn: (item) => isOpenAggregationState(item.stateCode),
      highlightClickedRowFn: (item) =>
        !!item.consentRequests?.some((request) => request.id === this.consentRequestId()),
      searchFn: (data, searchTerm) =>
        data.filter((item) => this.getTranslation(item.dataRequest?.title).includes(searchTerm)),
    };
  });

  getTranslatedStateValue(stateCode?: ConsentRequestAggregationStateEnum) {
    if (!stateCode) {
      return '';
    }
    return this.i18nService.translate(`consent-request.dataRequest.stateCode.${stateCode}`);
  }

  setStateCodeFilter(state: string | null) {
    this.stateCodeFilter.set(state);
  }

  updateConsentRequestState = async (
    aggregation: ConsentRequestAggregationProducerView,
    stateCode: ConsentRequestStateEnum,
    requestName?: string,
  ) => {
    // capture the children before the reload replaces the input array, the undo needs their ids.
    // PARTIALLY_OPENED aggregations still hold children that already carry a decision, only the
    // undecided ones may be decided here. For OPENED every child is open, so all are kept.
    const openConsentRequestIds = (aggregation.consentRequests ?? [])
      .filter((request) => request.stateCode === ConsentRequestStateEnum.Opened)
      .map((request) => request.id);
    this.analyticsService.logEvent('consent_request_state_changed', {
      id: aggregation.id,
      state: stateCode,
      component: 'table',
    });
    this.getElementLoadingSignal(aggregation.id).set(true);
    await this.consentRequestService
      .updateConsentRequestStatuses(openConsentRequestIds, stateCode)
      .then(() => {
        const toastTitle = this.i18nService.translate(getToastTitle(stateCode), {
          name: requestName,
        });
        const toastMessage = this.i18nService.translate(getToastMessage(stateCode), {
          name: requestName,
        });
        const toastType = getToastType(stateCode);
        const undoAction = this.prepareUndoAction(openConsentRequestIds);
        this.toastService.show(toastTitle, toastMessage, toastType, undoAction);
        this.consentRequestAggregationsResource()?.reload();
      })
      .catch((error) => {
        this.errorService.handleError(error, { i18n: 'consent-request.table.error' });
        // a rejected Promise.all can still have updated some of the children, so pull the
        // authoritative states instead of leaving those rows stale
        this.consentRequestAggregationsResource()?.reload();
      });
    this.getElementLoadingSignal(aggregation.id).set(false);
  };

  /** Undo only reverts the children this component decided, and those were all OPENED before. */
  prepareUndoAction(consentRequestIds: string[]) {
    return getUndoAction(() => {
      this.toastService.show(this.i18nService.translate(getToastTitle('')), '');
      this.consentRequestService
        .updateConsentRequestStatuses(consentRequestIds, ConsentRequestStateEnum.Opened)
        .then(() => {
          this.consentRequestAggregationsResource()?.reload();
        });
    });
  }

  getBadgeVariant = getAggregationBadgeVariant;

  getTranslation(key: TranslationDto | undefined) {
    if (!key) return '';
    return this.i18nService.useObjectTranslation(key);
  }

  getElementLoadingSignal(id: string): WritableSignal<boolean> {
    let elementSignal = this.elementLoadingSignals.get(id);
    if (!elementSignal) {
      elementSignal = signal(false);
      this.elementLoadingSignals.set(id, elementSignal);
    }
    return elementSignal;
  }

  getI18nTranslation(key: string | undefined) {
    if (!key) return '';
    return this.i18nService.translate(key);
  }

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly ConsentRequestStateEnum = ConsentRequestStateEnum;
  protected readonly isOpenAggregationState = isOpenAggregationState;
}
