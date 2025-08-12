import { Location } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
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

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly buttonIcon = faPlus;
  protected readonly icon = faDatabase;

  protected readonly dataRequests = this.dataRequestService.fetchDataRequests;

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
    this.handleOpen();
  };
}
