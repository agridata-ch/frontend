import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestDetailViewDto } from '@/entities/openapi/model/consentRequestDetailViewDto';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { Mockify } from '@/shared/testing/mocks/test-model';

export const mockConsentRequests: ConsentRequestDetailViewDto[] = [
  {
    id: '1',
    stateCode: ConsentRequestStateEnum.Opened,
    requestDate: '2025-05-01',
    dataRequest: {
      dataConsumer: { name: 'Alice' },
      title: { de: 'Antrag A' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
  } as ConsentRequestDetailViewDto,
  {
    id: '2',
    stateCode: ConsentRequestStateEnum.Granted,
    requestDate: '2025-05-02',
    dataRequest: {
      dataConsumer: { name: 'Bob' },
      title: { de: 'Antrag B' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
  } as ConsentRequestDetailViewDto,
  {
    id: '3',
    stateCode: ConsentRequestStateEnum.Declined,
    requestDate: '2025-05-03',
    dataRequest: {
      dataConsumer: { name: 'Charlie' },
      title: { de: 'Antrag C' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
  } as ConsentRequestDetailViewDto,
];

export type MockConsentRequestService = Mockify<ConsentRequestService>;

/**
 * Factory that creates a fully-typed mock of `ConsentRequestService`.
 * Methods are jest mocks and default to resolving with `mockConsentRequests` where appropriate.
 *
 * CommentLastReviewed: 2025-11-04
 */
export function createMockConsentRequestService(): MockConsentRequestService {
  return {
    fetchConsentRequests: jest.fn().mockResolvedValue(mockConsentRequests),
    updateConsentRequestStatus: jest.fn().mockResolvedValue(undefined),
    createConsentRequests: jest.fn().mockResolvedValue(undefined),
  } satisfies MockConsentRequestService;
}
