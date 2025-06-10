import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);

  async fetchConsentRequests() {
    return (await firstValueFrom(this.apiService.getConsentRequests())).slice().sort((a, b) => {
      const aDate = new Date(a.lastStateChangeDate ?? 0).getTime();
      const bDate = new Date(b.lastStateChangeDate ?? 0).getTime();
      return bDate - aDate;
    });
  }

  updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
