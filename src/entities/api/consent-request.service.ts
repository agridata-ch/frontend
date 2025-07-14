import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);

  readonly fetchConsentRequests = resource({
    loader: () => firstValueFrom(this.apiService.getConsentRequests()),
    defaultValue: [],
  });

  updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
