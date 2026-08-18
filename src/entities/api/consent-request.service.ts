import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ConsentRequestAggregationsService,
  ConsentRequestStateEnum,
  CreateConsentRequestDto,
} from '@/entities/openapi';
import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

/**
 * Service for managing consent requests through the API. Provides methods to fetch, retrieve, and
 * update consent requests, while integrating with the application state to scope operations to the
 * currently active UID.
 *
 * CommentLastReviewed: 2026-08-07
 */
@Service()
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);
  private readonly consentRequestAggregationService = inject(ConsentRequestAggregationsService);

  createConsentRequests(createConsentRequestDto: Array<CreateConsentRequestDto>) {
    return this.apiService.createConsentRequests(createConsentRequestDto);
  }

  fetchConsentRequestAggregation(id: string, uid: string) {
    return firstValueFrom(
      this.consentRequestAggregationService.getConsentRequestAggregation(id, uid),
    );
  }

  /** Returns the consent requests of the producer, grouped by their data request. */
  fetchConsentRequests(uid: string) {
    return firstValueFrom(this.consentRequestAggregationService.getConsentRequestAggregations(uid));
  }

  async updateConsentRequestStatus(consentRequestId: string, stateCode: ConsentRequestStateEnum) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }

  updateConsentRequestStatuses(consentRequestIds: string[], stateCode: ConsentRequestStateEnum) {
    return Promise.all(
      consentRequestIds.map((id) => this.updateConsentRequestStatus(id, stateCode)),
    );
  }
}
