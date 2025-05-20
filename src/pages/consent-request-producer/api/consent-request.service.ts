import { inject, Injectable, resource, Resource } from '@angular/core';
import { DataConsentResourceService } from '@shared/api/openapi/api/dataConsentResource.service';
import { ConsentRequestDto } from '@shared/api/openapi/model/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(DataConsentResourceService);

  readonly consentRequests: Resource<ConsentRequestDto[]> = resource<ConsentRequestDto[], unknown>({
    request: () => true,
    loader: async () => {
      const data = await firstValueFrom(this.apiService.getConsentRequests());
      return data;
    },
    defaultValue: [],
  });

  reload() {
    this.consentRequests.reload();
  }
}
