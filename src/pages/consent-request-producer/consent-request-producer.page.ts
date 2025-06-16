import { Location } from '@angular/common';
import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { TranslocoDirective } from '@jsverse/transloco';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto } from '@/entities/openapi';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';
import { ConsentRequestTableComponent } from '@/widgets/consent-request-table';

@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    ConsentRequestTableComponent,
    FontAwesomeModule,
    ConsentRequestDetailsComponent,
    TranslocoDirective,
  ],
  templateUrl: './consent-request-producer.page.html',
})
export class ConsentRequestProducerPage {
  private readonly browserLocation = inject(Location);
  private readonly consentRequestService = inject(ConsentRequestService);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly fileIcon = faFile;

  readonly consentRequestResult = resource<ConsentRequestDto[], unknown>({
    loader: async () => this.consentRequestService.fetchConsentRequests(),
    defaultValue: [],
  });

  readonly selectedRequest = signal<ConsentRequestDto | null>(null);

  constructor() {
    // effect to open the details view if we visit the page with a consentRequestId in the URL directly
    effect(() => {
      if (this.consentRequestResult.isLoading() || !this.consentRequestId()) return;
      const request = this.consentRequestResult
        .value()
        .find((request) => request.id === this.consentRequestId());

      this.showConsentRequestDetails(request, false);
    });
  }

  showConsentRequestDetails = (request?: ConsentRequestDto, pushUrl: boolean = true) => {
    this.selectedRequest.set(request ?? null);

    // update the URL without triggering the router so the transition animation works
    if (pushUrl) {
      this.browserLocation.go(`/consent-requests/${request?.id ?? ''}`);
    }
  };

  reloadConsentRequests = () => {
    this.consentRequestResult.reload();
  };
}
