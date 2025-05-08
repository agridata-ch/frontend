import { inject, Injectable } from '@angular/core';
import { DefaultService } from '@/app/shared/openapi/api/exampleResource.service';

@Injectable({
  providedIn: 'root',
})
export class DataRequestService {
  private readonly apiService = inject(DefaultService);

  getRequests() {
    return this.apiService.apiDataRequestsGet();
  }
}
