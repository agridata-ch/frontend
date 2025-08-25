import { Location } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase, faPlus } from '@fortawesome/free-solid-svg-icons';

import { DataRequestService } from '@/entities/api';
import { DataRequestDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { SidepanelComponent } from '@/shared/sidepanel';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import { DataRequestNewComponent } from '@/widgets/data-request-new';
import { DataRequestTableComponent } from '@/widgets/data-request-table';

/**
 * Displays a table of existing data requests and integrates a side panel for creating or editing
 * requests. It synchronizes the selected request with the URL, automatically opens details for
 * linked requests, and reloads data when changes occur.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-data-requests-consumer-page',
  imports: [
    FontAwesomeModule,
    I18nDirective,
    DataRequestNewComponent,
    ButtonComponent,
    SidepanelComponent,
    DataRequestTableComponent,
  ],
  templateUrl: './data-requests-consumer.page.html',
})
export class DataRequestsConsumerPage {
  private readonly dataRequestService = inject(DataRequestService);
  private readonly location = inject(Location);

  // binds to the route parameter :dataRequestId
  readonly dataRequestId = input<string>();

  protected readonly showPanel = signal<boolean>(false);
  protected readonly selectedRequest = signal<DataRequestDto | null>(null);
  protected readonly panelOpenedAutomatically = signal<boolean>(false);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly buttonIcon = faPlus;
  protected readonly icon = faDatabase;

  protected readonly dataRequests = this.dataRequestService.fetchDataRequests;

  private readonly initialOpenEffect = effect(() => {
    const requestId = this.dataRequestId();
    if (requestId && !this.panelOpenedAutomatically()) {
      const request = this.dataRequests.value()?.find((r) => r.id === requestId);
      if (request) {
        this.setSelectedRequest(request);
        this.panelOpenedAutomatically.set(true);
      }
    }
  });

  private readonly openPanelEffect = effect(() => {
    const request = this.selectedRequest();
    if (request) {
      this.showPanel.set(true);
    }
  });

  protected handleOpen() {
    this.showPanel.set(true);
  }

  protected handleClose() {
    this.dataRequests.reload();
    this.setSelectedRequest(null);
    this.showPanel.set(false);
  }

  protected setSelectedRequest = (request?: DataRequestDto | null) => {
    this.selectedRequest.set(request ?? null);

    const base = ROUTE_PATHS.DATA_REQUESTS_CONSUMER_PATH;
    const newUrl = request?.id ? `${base}/${request.id}` : base;
    this.location.go(newUrl);
  };
}
