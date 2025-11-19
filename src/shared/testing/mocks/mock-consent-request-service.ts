import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestProducerViewDto, ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';
import { Mockify } from '@/shared/testing/mocks/test-model';

export const mockConsentRequests: ConsentRequestProducerViewDto[] = [
  {
    id: '1',
    stateCode: ConsentRequestStateEnum.Opened,
    requestDate: '2025-05-01',
    dataRequest: {
      id: 'dr-1',
      title: { de: 'Antrag A' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
    showStateAsMigrated: true,
  },
  {
    id: '2',
    stateCode: ConsentRequestStateEnum.Granted,
    requestDate: '2025-05-02',
    dataRequest: {
      id: 'dr-2',
      title: { de: 'Antrag B' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
    showStateAsMigrated: false,
  },
  {
    id: '3',
    stateCode: ConsentRequestStateEnum.Declined,
    requestDate: '2025-05-03',
    dataRequest: {
      id: 'dr-3',
      title: { de: 'Antrag C' },
      stateCode: ConsentRequestDetailViewDtoDataRequestStateCode.Draft,
    },
    showStateAsMigrated: true,
  },
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
    fetchConsentRequest: jest.fn().mockResolvedValue(mockConsentRequests[0]),
    updateConsentRequestStatus: jest.fn().mockResolvedValue(undefined),
    createConsentRequests: jest.fn().mockResolvedValue(undefined),
  } satisfies MockConsentRequestService;
}
