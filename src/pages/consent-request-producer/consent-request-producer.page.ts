import { Location } from '@angular/common';
import { Component, OnDestroy, effect, inject, input, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';

import { ConsentRequestService } from '@/entities/api';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { ConsentRequestProducerViewDto } from '@/entities/openapi';
import { ACTIVE_UID_FIELD, ROUTE_PATHS } from '@/shared/constants/constants';
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
export class ConsentRequestProducerPage implements OnDestroy {
  private readonly consentRequestService = inject(ConsentRequestService);
  private readonly agridataStateService = inject(AgridataStateService);
  private readonly location = inject(Location);

  // binds to the route parameter :consentRequestId
  readonly consentRequestId = input<string>();
  readonly fileIcon = faFile;

  readonly consentRequests = this.consentRequestService.fetchConsentRequests;

  readonly selectedRequest = signal<ConsentRequestProducerViewDto | null>(null);

  private readonly storageEventListener = (event: StorageEvent) => {
    if (event.key === ACTIVE_UID_FIELD) {
      this.agridataStateService.uidSignal.set(event.newValue);
    }
  };

  constructor() {
    effect(() => {
      const id = this.consentRequestId();
      if (!id || this.consentRequests.isLoading()) return;

      const request = this.consentRequests.value().find((r) => r.id === id) ?? null;

      this.selectedRequest.set(request);
    });

    window.addEventListener('storage', this.storageEventListener);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.storageEventListener);
  }

  setSelectedRequest = (request?: ConsentRequestProducerViewDto | null) => {
    this.selectedRequest.set(request ?? null);

    const base = ROUTE_PATHS.CONSENT_REQUEST_PRODUCER_PATH;
    const newUrl = request?.id ? `${base}/${request.id}` : base;
    this.location.go(newUrl);
  };

  reloadConsentRequests = () => {
    this.consentRequests.reload();
  };
}
