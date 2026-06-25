import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { DataRequestsService } from '@/entities/openapi/api/dataRequests.service';
import { ActingRole } from '@/shared/constants/constants';

import {
  DataRequestDto,
  DataRequestStateEnum,
  DataRequestUpdateDto,
  DataRequestValidRedirectUriRegexUpdateDto,
  SignatureTypeEnum,
} from '../openapi';

/**
 * Service for managing data requests through the API. Provides methods to create, update, submit,
 * and retreat data requests, as well as upload logos. It integrates with the backend service to
 * maintain the lifecycle and details of data requests.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Service()
export class DataRequestService {
  private readonly apiService = inject(DataRequestsService);

  fetchDataRequests(actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.getDataRequests(actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined),
    );
  }

  fetchDataRequest(id: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.getDataRequest(
        id,
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async createDataRequest(dataRequest: DataRequestUpdateDto): Promise<DataRequestDto> {
    return firstValueFrom(this.apiService.createDataRequestDraft(dataRequest));
  }

  async updateDataRequestDetails(dataRequestId: string, dataRequest: DataRequestUpdateDto) {
    return firstValueFrom(this.apiService.updateDataRequestDetails(dataRequestId, dataRequest));
  }

  async updateDataRequestValidRedirectUriRegex(
    dataRequestId: string,
    validRedirectUriRegex: DataRequestValidRedirectUriRegexUpdateDto,
  ): Promise<DataRequestDto> {
    return firstValueFrom(
      this.apiService.updateDataRequestValidRedirectUriRegex(dataRequestId, validRedirectUriRegex),
    );
  }

  async deleteDataRequest(dataRequestId: string) {
    return firstValueFrom(this.apiService.deleteDataRequest(dataRequestId));
  }

  async uploadLogo(dataRequestId: string, logo: File) {
    const logoBlob = new Blob([logo], { type: logo.type });
    return firstValueFrom(this.apiService.updateDataRequestLogo(dataRequestId, logoBlob));
  }

  async submitDataRequest(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.InReview),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async retreatDataRequest(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.Draft),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async approveDataRequest(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.ToBeSignedByConsumer),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async activateDataRequest(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.Active),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async releaseDataRequestToProvider(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.ToBeSignedByProvider),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async releaseDataRequestToBeActivated(dataRequestId: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.setDataRequestStatus(
        dataRequestId,
        JSON.stringify(DataRequestStateEnum.ToBeActivated),
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async setSignatureType(
    dataRequestId: string,
    signatureType: SignatureTypeEnum,
    actingRole?: ActingRole,
  ) {
    return firstValueFrom(
      this.apiService.setSignatureType(
        dataRequestId,
        JSON.stringify(signatureType),
        actingRole as 'CONSUMER' | 'PROVIDER' | undefined,
      ),
    );
  }
}
