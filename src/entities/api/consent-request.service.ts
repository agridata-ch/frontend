import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { CreateConsentRequestDto } from '@/entities/openapi';
import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

/**
 * Service for managing consent requests through the API. Provides methods to fetch, retrieve, and
 * update consent requests, while integrating with the application state to scope operations to the
 * currently active UID.
 *
 * CommentLastReviewed: 2025-10-23
 */
@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);

  fetchConsentRequests(uid?: string) {
    return firstValueFrom(this.apiService.getConsentRequests(uid));
  }

  fetchConsentRequest(id: string) {
    return firstValueFrom(this.apiService.getConsentRequest(id));
  }

  async updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }

  async createConsentRequests(createConsentRequestDto: Array<CreateConsentRequestDto>) {
    return firstValueFrom(this.apiService.createConsentRequests(createConsentRequestDto));
  }
}
