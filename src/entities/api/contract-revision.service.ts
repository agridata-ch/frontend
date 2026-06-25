import { inject, Service } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ContractRevisionsService,
  SealAttemptStateEnum,
  SignatureSlotCodeEnum,
  VerifyOtpRequestDto,
} from '@/entities/openapi';
import { ActingRole } from '@/shared/constants/constants';

/**
 * Service for managing contract revisions through the API. Provides methods to fetch contract
 * revisions, drive the signing process and seal a contract revision (triggering the seal and
 * awaiting its completion via backend long-polling).
 *
 * CommentLastReviewed: 2026-06-25
 */
@Service()
export class ContractRevisionService {
  private readonly apiService = inject(ContractRevisionsService);

  private readonly sealPollIntervalMs = 1000;
  private readonly maxSealPollDurationMs = 5 * 60 * 1000;
  private readonly useSealStatusLongPolling = true;

  fetchContract(id: string, actingRole?: ActingRole) {
    return firstValueFrom(
      this.apiService.getContractRevision(
        id,
        actingRole as 'CONSUMER' | 'PROVIDER' | 'ADMIN' | undefined,
      ),
    );
  }

  async sealContract(contractRevisionId: string): Promise<void> {
    await firstValueFrom(this.apiService.sealContractRevision(contractRevisionId));
    await this.awaitSealCompletion(contractRevisionId);
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

  private async awaitSealCompletion(contractRevisionId: string): Promise<void> {
    const deadline = Date.now() + this.maxSealPollDurationMs;
    while (Date.now() < deadline) {
      const state = await firstValueFrom(
        this.apiService.getContractRevisionSealStatus(
          contractRevisionId,
          this.useSealStatusLongPolling,
        ),
      );
      if (state === SealAttemptStateEnum.Completed) return;
      if (state === SealAttemptStateEnum.Failed) {
        throw new Error(`Sealing the contract revision ${contractRevisionId} failed.`);
      }
      await this.delay(this.sealPollIntervalMs);
    }
    throw new Error(`Sealing the contract revision ${contractRevisionId} timed out.`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
