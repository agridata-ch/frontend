import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks/test-model';

export const mockDataRequests: DataRequestDto[] = [
  {
    id: '1',
    stateCode: DataRequestStateEnum.Draft,
    submissionDate: '2025-01-01',
    humanFriendlyId: 'REQ-001',
    title: { de: 'Request A' },
  } as DataRequestDto,
  {
    id: '2',
    stateCode: DataRequestStateEnum.InReview,
    submissionDate: '2025-01-02',
    humanFriendlyId: 'REQ-002',
    title: { de: 'Request B' },
  } as DataRequestDto,
  {
    id: '3',
    stateCode: DataRequestStateEnum.ToBeSigned,
    submissionDate: '2025-01-03',
    humanFriendlyId: 'REQ-003',
    title: { de: 'Request C' },
  } as DataRequestDto,
];

export type MockDataRequestService = Mockify<DataRequestService>;

/**
 * Factory that creates a strict mock implementation of DataRequestService for tests.
 * All methods are jest.fn mocks returning the same default values as the standalone mock above.
 *
 * CommentLastReviewed: 2025-11-04
 */
export function createMockDataRequestService(): MockDataRequestService {
  return {
    fetchDataRequests: jest.fn().mockResolvedValue(mockDataRequests),
    retreatDataRequest: jest.fn().mockResolvedValue(undefined),
    createDataRequest: jest.fn().mockResolvedValue(mockDataRequests[0]),
    updateDataRequestDetails: jest.fn().mockResolvedValue(undefined),
    uploadLogo: jest.fn().mockResolvedValue(undefined),
    submitDataRequest: jest.fn().mockResolvedValue(undefined),
    fetchDataRequest: jest.fn(),
  } satisfies MockDataRequestService;
}
