import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  resource,
  signal,
} from '@angular/core';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataRequestService } from '@/entities/api';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { AgridataTabsComponent, Tab } from '@/shared/ui/agridata-tabs';

import { DataRequestDetailsRequestComponent } from './data-request-details-request';
import { DETAILS_TABS_ID } from './data-request-details.model';
import { DataRequestDetailsContractComponent } from '../data-request-details-contract/data-request-details-contract.component';

/**
 * Displays detailed information about a data request in a sidepanel with tabs.
 * Footer content is projected from the parent via ng-content.
 *
 * CommentLastReviewed: 2026-04-23
 */
@Component({
  selector: 'app-data-request-details',
  imports: [
    I18nDirective,
    CommonModule,
    ErrorOutletComponent,
    SidepanelComponent,
    AgridataTabsComponent,
    FontAwesomeModule,
    DataRequestDetailsRequestComponent,
    DataRequestDetailsContractComponent,
  ],
  templateUrl: './data-request-details.component.html',
})
export class DataRequestDetailsComponent {
  // Injects
  private readonly dataRequestService = inject(DataRequestService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);

  // Constants
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly DETAILS_TABS_ID = DETAILS_TABS_ID;

  // Input properties
  readonly dataRequestId = input.required<string>();
  readonly isRedirectUriRegexEditable = input(false);

  // Output properties
  readonly closeSidepanel = output<void>();

  // Signals
  protected readonly activeTabId = signal(DETAILS_TABS_ID.REQUEST);
  protected readonly requestTabLabel = this.i18nService.translateSignal(
    'data-request.details.tabs.request',
  );
  protected readonly producerTabLabel = this.i18nService.translateSignal(
    'data-request.details.tabs.producer',
  );
  protected readonly contractTabLabel = this.i18nService.translateSignal(
    'data-request.details.tabs.contract',
  );
  protected readonly emailTabLabel = this.i18nService.translateSignal(
    'data-request.details.tabs.email',
  );

  // Computed Signals
  readonly dataRequestResource = resource({
    params: () => {
      const id = this.dataRequestId();
      return id ? { id } : undefined;
    },
    loader: ({ params }) => {
      return this.dataRequestService.fetchDataRequest(params.id);
    },
  });

  readonly dataRequest = computed(() => {
    if (this.dataRequestResource.isLoading() || this.dataRequestResource.error()) {
      return null;
    }
    return this.dataRequestResource.value();
  });

  protected readonly tabs = computed<Tab[]>(() => [
    { id: DETAILS_TABS_ID.REQUEST, label: this.requestTabLabel() },
    // Other tabs will be added when the corresponding components are implemented.
    // { id: DETAILS_TABS_ID.PRODUCER, label: this.producerTabLabel() },
    ...(this.dataRequest()?.currentContractRevisionId
      ? [{ id: DETAILS_TABS_ID.CONTRACT, label: this.contractTabLabel() }]
      : []),
    // { id: DETAILS_TABS_ID.EMAIL, label: this.emailTabLabel() },
  ]);

  private readonly errorHandlerEffect = effect(() => {
    const error = this.dataRequestResource.error();
    if (error) {
      this.errorService.handleError(error);
    }
  });

  protected handleSidepanelClose(): void {
    this.closeSidepanel.emit();
  }
}
