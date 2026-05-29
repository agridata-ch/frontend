import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ContractRevisionsService,
  SignatureSlotCodeEnum,
  VerifyOtpRequestDto,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';

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

  fetchContract(id: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.getContractRevision(
        id,
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  startSigningProcess(contractId: string, slotId: SignatureSlotCodeEnum, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.initiateSignatureChallenge(
        contractId,
        slotId,
        actingRole as 'CONSUMER' | 'PROVIDER' | undefined,
      ),
    );
  }

  verifySigningProcess(
    challengeId: string,
    contractId: string,
    slotId: SignatureSlotCodeEnum,
    verifyOtpRequestDto: VerifyOtpRequestDto,
    actingRole?: ActingRole,
  ) {
    return firstValueFrom(
      this.apiService.verifySignature(
        challengeId,
        contractId,
        slotId,
        verifyOtpRequestDto,
        actingRole as 'CONSUMER' | 'PROVIDER' | undefined,
      ),
    );
  }

  getContractRevisionPdf(contractRevisionId: string, actingRole?: ActingRole): Promise<Blob> {
    return firstValueFrom(
      this.apiService.getContractRevisionPdf(
        contractRevisionId,
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
        undefined,
        undefined,
        {
          httpHeaderAccept: 'application/pdf',
        },
      ),
    );
  }
}
