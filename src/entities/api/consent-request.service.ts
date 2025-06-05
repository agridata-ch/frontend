import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);

  async fetchConsentRequests() {
    return await firstValueFrom(this.apiService.getConsentRequests());
  }

  updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
