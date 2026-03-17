/// <reference types="jest" />

import { ContractRevisionService } from '@/entities/api';
import { ContractRevisionDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks/test-model';

export const mockContractRevision: ContractRevisionDto = {
  id: 'cr-1',
  dataRequestId: 'dr-1',
  dataConsumerName: 'Consumer Corp',
  dataConsumerCity: 'Zurich',
  dataProviderName: 'Provider AG',
  dataRequestContext: {},
};

export type MockContractRevisionService = Mockify<ContractRevisionService>;

/**
 * Factory that creates a fully-typed mock of `ContractRevisionService`.
 * Methods are jest mocks and default to resolving with `mockContractRevision`.
 *
 * CommentLastReviewed: 2026-03-17
 */
export function createMockContractRevisionService(): MockContractRevisionService {
  return {
    fetchContract: jest.fn().mockResolvedValue(mockContractRevision),
  } satisfies MockContractRevisionService;
}
