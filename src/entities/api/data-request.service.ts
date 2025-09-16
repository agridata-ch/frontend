import { Injectable, inject, resource } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataRequestsService } from '@/entities/openapi/api/dataRequests.service';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';

import { DataRequestDto, DataRequestUpdateDto } from '../openapi';

/**
 * Service for managing data requests through the API. Provides methods to create, update, submit,
 * and retreat data requests, as well as upload logos. It integrates with the backend service to
 * maintain the lifecycle and details of data requests.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Injectable({
  providedIn: 'root',
})
export class DataRequestService {
  private readonly apiService = inject(DataRequestsService);

  readonly fetchDataRequests = resource({
    loader: () => firstValueFrom(this.apiService.getDataRequests()),
  });

  async createDataRequest(dataRequest: DataRequestUpdateDto): Promise<DataRequestDto> {
    return firstValueFrom(this.apiService.createDataRequestDraft(dataRequest));
  }

  async updateDataRequestDetails(dataRequestId: string, dataRequest: DataRequestUpdateDto) {
    return firstValueFrom(this.apiService.updateDataRequestDetails(dataRequestId, dataRequest));
  }

  async uploadLogo(dataRequestId: string, logo: File) {
    const logoBlob = new Blob([logo], { type: logo.type });
    return firstValueFrom(this.apiService.updateDataRequestLogo(dataRequestId, logoBlob));
  }

  async submitDataRequest(dataRequestId: string) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(ConsentRequestDetailViewDtoDataRequestStateCode.InReview),
      ),
    );
  }

  async retreatDataRequest(dataRequestId: string) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(ConsentRequestDetailViewDtoDataRequestStateCode.Draft),
      ),
    );
  }
}
