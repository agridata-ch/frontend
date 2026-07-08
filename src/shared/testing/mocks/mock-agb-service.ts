/// <reference types="jest" />

import { AgbService } from '@/entities/api';
import { AgbRevisionDto } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export const mockAgbRevision: AgbRevisionDto = {
  id: 'agb-1',
  version: '1.0.0',
  validFrom: '2026-01-01T00:00:00Z',
  agbText: {
    de: 'AGB Text (de)',
    fr: 'AGB Text (fr)',
    it: 'AGB Text (it)',
  },
};

export type MockAgbService = Mockify<AgbService>;

/**
 * Factory that creates a fully-typed mock of `AgbService`.
 * Methods are jest mocks and default to resolving with `mockAgbRevision`.
 *
 * CommentLastReviewed: 2026-07-16
 */
export function createMockAgbService(): MockAgbService {
  return {
    acceptAgbs: jest.fn().mockResolvedValue(undefined),
    fetchAgbs: jest.fn().mockResolvedValue(mockAgbRevision),
  } satisfies MockAgbService;
}
