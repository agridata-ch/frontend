import { inject, Injectable, resource, Resource, signal } from '@angular/core';
import { ConsentRequestControllerService } from '@/app/shared/openapi/api/consentRequestController.service';
import { ConsentRequest } from '@/app/shared/openapi/model/models';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConsentRequestService {
  private readonly apiService = inject(ConsentRequestControllerService);
  private readonly trigger = signal<null>(null);

  readonly consentRequests: Resource<ConsentRequest[]> = resource<ConsentRequest[], null>({
    request: () => this.trigger(),
    loader: async () => {
      const data = await firstValueFrom(this.apiService.agreementV1ConsentRequestsGet());
      return data;
    },
    defaultValue: [],
  });

  reload() {
    this.trigger.set(null);
  }
}
