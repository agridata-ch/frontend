import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ContractRevisionsService,
  SignatureSlotCodeEnum,
  VerifyOtpRequestDto,
} from '@/entities/openapi';

/**
 * Service for managing contract revisions through the API. Provides methods to fetch contract
 *
 * CommentLastReviewed: 2026-03-17
 */
@Injectable({
  providedIn: 'root',
})
export class ContractRevisionService {
  private readonly apiService = inject(ContractRevisionsService);

  fetchContract(id: string) {
    return firstValueFrom(this.apiService.getContractRevision(id));
  }

  startSigningProcess(contractId: string, slotId: SignatureSlotCodeEnum) {
    return firstValueFrom(this.apiService.initiateConsumerSignatureChallenge(contractId, slotId));
  }

  verifySigningProcess(
    challengeId: string,
    contractId: string,
    slotId: SignatureSlotCodeEnum,
    verifyOtpRequestDto: VerifyOtpRequestDto,
  ) {
    return firstValueFrom(
      this.apiService.verifyConsumerSignature(challengeId, contractId, slotId, verifyOtpRequestDto),
    );
  }
}
