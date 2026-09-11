import { DataRequestService } from '@/entities/api';
import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export const mockDataRequests: DataRequestDto[] = [
  {
    id: '1',
    stateCode: DataRequestStateEnum.Draft,
    submissionDate: '2025-01-01',
    humanFriendlyId: 'REQ-001',
    title: { de: 'Request A' },
    advantages: [],
    dataSourceSystem: {
      dataProvider: {
        name: { de: 'Provider A' },
      },
    },
  } as DataRequestDto,
  {
    id: '2',
    stateCode: DataRequestStateEnum.InReview,
    submissionDate: '2025-01-02',
    humanFriendlyId: 'REQ-002',
    title: { de: 'Request B' },
    advantages: [],
    dataSourceSystem: {
      dataProvider: {
        name: { de: 'Provider B' },
      },
    },
  } as DataRequestDto,
  {
    id: '3',
    stateCode: DataRequestStateEnum.ToBeSignedByConsumer,
    submissionDate: '2025-01-03',
    humanFriendlyId: 'REQ-003',
    title: { de: 'Request C' },
    advantages: [],
  } as DataRequestDto,
];

export type MockDataRequestService = Mockify<DataRequestService>;

/**
 * Factory that creates a strict mock implementation of DataRequestService for tests.
 * All methods are vi.fn mocks returning the same default values as the standalone mock above.
 *
 * CommentLastReviewed: 2025-11-04
 */
export function createMockDataRequestService(): MockDataRequestService {
  return {
    approveDataRequest: vi.fn().mockResolvedValue(mockDataRequests[0]),
    createDataRequest: vi.fn().mockResolvedValue(mockDataRequests[0]),
    deleteDataRequest: vi.fn().mockResolvedValue(undefined),
    fetchDataRequest: vi.fn(),
    fetchDataRequests: vi.fn().mockResolvedValue(mockDataRequests),
    retreatDataRequest: vi.fn().mockResolvedValue(mockDataRequests[0]),
    activateDataRequest: vi.fn().mockResolvedValue(mockDataRequests[0]),
    submitDataRequest: vi.fn().mockResolvedValue(undefined),
    updateDataRequestDetails: vi.fn().mockResolvedValue(undefined),
    updateDataRequestValidRedirectUriRegex: vi.fn().mockResolvedValue(undefined),
    uploadLogo: vi.fn().mockResolvedValue(undefined),
    releaseDataRequestToBeActivated: vi.fn().mockResolvedValue(mockDataRequests[0]),
    releaseDataRequestToProvider: vi.fn().mockResolvedValue(mockDataRequests[0]),
    setSignatureType: vi.fn().mockResolvedValue(mockDataRequests[0]),
  } satisfies MockDataRequestService;
}
