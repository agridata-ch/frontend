import { ContractTemplateService } from '@/entities/api';
import { ContractTemplateVersionDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export const mockContractTemplateVersion: ContractTemplateVersionDto = {
  version: '1.0.0',
  validFrom: '2026-01-01T00:00:00Z',
};

export type MockContractTemplateService = Mockify<ContractTemplateService>;

/**
 * Factory that creates a fully-typed mock of `ContractTemplateService`.
 *
 * CommentLastReviewed: 2026-11-26
 */
export function createMockContractTemplateService(): MockContractTemplateService {
  return {
    fetchAllContractTemplateVersions: vi.fn().mockResolvedValue({
      items: [mockContractTemplateVersion],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 1,
    }),
  } satisfies MockContractTemplateService;
}
