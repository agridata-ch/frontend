import { Component, effect, inject, input, resource, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { I18nDirective } from '@/shared/i18n';
import { ConsentRequestDetailsComponent } from '@/widgets/consent-request-details';
import { ConsentRequestTableComponent } from '@/widgets/consent-request-table';

@Component({
  selector: 'app-consent-request-producer-page',
  imports: [
    ConsentRequestTableComponent,
    FontAwesomeModule,
    ConsentRequestDetailsComponent,
    I18nDirective,
  ],
  templateUrl: './consent-request-producer.page.html',
})
export class ConsentRequestProducerPage {
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly router = inject(Router);

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

      this.showConsentRequestDetails(request);
    });
  }

  showConsentRequestDetails = (request?: ConsentRequestDto) => {
    this.selectedRequest.set(request ?? null);

    this.router.navigate([ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH, request?.id ?? '']);
  };

  reloadConsentRequests = () => {
    this.consentRequestResult.reload();
  };
}
