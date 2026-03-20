/// <reference types="jest" />

import { ContractRevisionService } from '@/entities/api';
import { ContractRevisionDto, OtpChallengeDto, SignatureSlotCodeEnum } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks/test-model';

export const mockOtpChallenge: OtpChallengeDto = {
  challengeId: 'challenge-1',
  expiresAt: '2026-03-30T12:00:00Z',
  maskedPhoneNumber: '+41 79 *** ** 89',
};

export const mockContractRevision: ContractRevisionDto = {
  id: 'cr-1',
  dataRequestId: 'dr-1',
  dataConsumerName: 'Consumer Corp',
  dataConsumerCity: 'Zurich',
  dataProviderName: 'Provider AG',
  dataRequestContext: {},
  consumerSignatures: [
    {
      name: 'Test Consumer',
      signatureSlotCode: SignatureSlotCodeEnum.DataConsumer01,
      timestamp: '2026-03-20T10:00:00Z',
      userId: 'user-123',
    },
    {
      name: 'Test Provider',
      signatureSlotCode: SignatureSlotCodeEnum.DataProvider01,
      timestamp: '2026-03-20T11:00:00Z',
      userId: 'user-456',
    },
  ],
};

export type MockContractRevisionService = Mockify<ContractRevisionService>;

/**
 * Factory that creates a fully-typed mock of `ContractRevisionService`.
 * Methods are jest mocks and default to resolving with `mockContractRevision`.
 *
 * CommentLastReviewed: 2026-03-23
 */
export function createMockContractRevisionService(): MockContractRevisionService {
  return {
    fetchContract: jest.fn().mockResolvedValue(mockContractRevision),
    startSigningProcess: jest.fn().mockResolvedValue(mockOtpChallenge),
    verifySigningProcess: jest.fn().mockResolvedValue(mockContractRevision),
  } satisfies MockContractRevisionService;
}
