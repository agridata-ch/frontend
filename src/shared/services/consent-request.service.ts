import { inject, Injectable } from '@angular/core';
import { DataConsentResourceService } from '@shared/api/openapi/api/dataConsentResource.service';
import { ConsentRequestDto } from '@shared/api/openapi/model/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(DataConsentResourceService);

  async fetchConsentRequests(): Promise<ConsentRequestDto[]> {
    return await firstValueFrom(this.apiService.getConsentRequests());
  }

  updateConsentRequestStatus(
    consentRequestId: string,
    stateCode: string,
  ): Promise<ConsentRequestDto> {
    return firstValueFrom(
      this.apiService.updateConsentRequestStatus(consentRequestId, `"${stateCode}"`),
    );
  }
}
