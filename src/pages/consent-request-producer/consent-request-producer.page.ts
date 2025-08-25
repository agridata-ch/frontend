import { Location } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
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
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly fileIcon = faFile;

  readonly consentRequests = this.consentRequestService.fetchConsentRequests;

  readonly selectedRequest = signal<ConsentRequestProducerViewDto | null>(null);

  readonly updateOpenedRequest = effect(() => {
    const id = this.consentRequestId();

    if (!id) {
      this.selectedRequest.set(null);
      return;
    }

    if (!id || this.consentRequests.isLoading()) return;

    const request = this.consentRequests.value().find((r) => r.id === id) ?? null;

    this.selectedRequest.set(request);
  });

  setSelectedRequest = (request?: ConsentRequestProducerViewDto | null) => {
    this.selectedRequest.set(request ?? null);

    const base =
      ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH + `/${this.agridataStateService.activeUid()}`;

    // use location.go if a request is selected to trigger animation correctly.
    // use router.navigate if no request is selected to also update the URL and router
    // location.go does not update the router state so the effect is not triggering again without a consentRequestId param set
    if (request?.id) {
      this.location.go(`${base}/${request.id}`);
    } else {
      this.router.navigate([base], { replaceUrl: true });
    }
  };

  reloadConsentRequests = () => {
    this.consentRequests.reload();
  };
}
