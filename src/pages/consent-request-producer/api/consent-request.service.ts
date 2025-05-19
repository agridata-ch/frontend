import { inject, Injectable, resource, Resource } from '@angular/core';
import { ConsentRequestControllerService } from '@shared/api/openapi/api/consentRequestController.service';
import { ConsentRequest } from '@shared/api/openapi/model/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestControllerService);

  readonly consentRequests: Resource<ConsentRequest[]> = resource<ConsentRequest[], unknown>({
    request: () => true,
    loader: async () => {
      const data = await firstValueFrom(this.apiService.agreementV1ConsentRequestsGet());
      return data;
    },
    defaultValue: [],
  });

  reload() {
    this.consentRequests.reload();
  }
}
