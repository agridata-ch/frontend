import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

import { AgridataStateService } from './agridata-state.service';

/**
 * Service for managing consent requests through the API. Provides methods to fetch, retrieve, and
 * update consent requests, while integrating with the application state to scope operations to the
 * currently active UID.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);
  private readonly agridataStateService = inject(AgridataStateService);

  readonly fetchConsentRequests = resource({
    params: () => ({ uid: this.agridataStateService.activeUid() }),
    loader: ({ params }) => {
      if (!params?.uid) {
        return Promise.resolve([]);
      }
      return firstValueFrom(this.apiService.getConsentRequests(params.uid));
    },
    defaultValue: [],
  });

  async getConsentRequest(consentRequestId: string) {
    return firstValueFrom(this.apiService.getConsentRequest(consentRequestId));
  }

  updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
