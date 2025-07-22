import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

import { AgridataStateService } from './agridata-state.service';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestsService);
  private readonly agridataStateService = inject(AgridataStateService);

  readonly fetchConsentRequests = resource({
    params: () => ({ uid: this.agridataStateService.uidSignal() }),
    loader: ({ params }) => {
      if (!params?.uid) {
        return Promise.resolve([]);
      }
      return firstValueFrom(this.apiService.getConsentRequests(params.uid));
    },
    defaultValue: [],
  });

  updateConsentRequestStatus(consentRequestId: string, stateCode: string) {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
