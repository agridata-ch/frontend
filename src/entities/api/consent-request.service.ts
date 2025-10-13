import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

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

  fetchConsentRequests(uid?: string) {
    return firstValueFrom(this.apiService.getConsentRequests(uid));
  }

  async updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }

  async createConsentRequests(dataRequestUid: string) {
    return firstValueFrom(this.apiService.createConsentRequests(dataRequestUid));
  }
}
