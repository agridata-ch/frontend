import { ConsentRequestService } from '@/entities/api';
import {
  ConsentRequestAggregationProducerView,
  ConsentRequestAggregationStateEnum,
  ConsentRequestProducerViewDto,
  ConsentRequestStateEnum,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

export const mockConsentRequests: ConsentRequestProducerViewDto[] = [
  {
    id: '1',
    stateCode: ConsentRequestStateEnum.Opened,
    requestDate: '2025-05-01',
    dataRequest: {
      id: 'dr-1',
      title: { de: 'Antrag A' },
      dataConsumerDisplayName: 'Test AG',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
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
      dataConsumerDisplayName: 'Demo GmbH',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
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
      dataConsumerDisplayName: 'Open AG',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    },
    showStateAsMigrated: true,
  },
];

/**
 * Producer view aggregations, one per data request, covering every aggregation state the UI
 * distinguishes. Consent request ids are unique across the whole set so a spec can route to a
 * single child by id.
 */
export const mockConsentRequestAggregations: ConsentRequestAggregationProducerView[] = [
  {
    id: 'dr-1',
    stateCode: ConsentRequestAggregationStateEnum.Opened,
    requestDate: '2025-05-01',
    dataRequest: mockConsentRequests[0].dataRequest,
    showStateAsMigrated: true,
    consentRequests: [{ id: '1', stateCode: ConsentRequestStateEnum.Opened }],
  },
  {
    id: 'dr-2',
    stateCode: ConsentRequestAggregationStateEnum.Granted,
    requestDate: '2025-05-02',
    dataRequest: mockConsentRequests[1].dataRequest,
    showStateAsMigrated: false,
    // two consent requests, one UID based and one BUR based
    consentRequests: [
      { id: '2', stateCode: ConsentRequestStateEnum.Granted },
      { id: '3', stateCode: ConsentRequestStateEnum.Granted, dataProducerBur: '99910003' },
    ],
  },
  {
    id: 'dr-3',
    stateCode: ConsentRequestAggregationStateEnum.Opened,
    requestDate: '2025-05-03',
    dataRequest: mockConsentRequests[2].dataRequest,
    showStateAsMigrated: true,
    // every consent request of an OPENED aggregation is still awaiting a decision
    consentRequests: [
      { id: '4', stateCode: ConsentRequestStateEnum.Opened },
      { id: '5', stateCode: ConsentRequestStateEnum.Opened, dataProducerBur: '99910004' },
    ],
  },
  {
    id: 'dr-4',
    stateCode: ConsentRequestAggregationStateEnum.PartiallyOpened,
    requestDate: '2025-05-04',
    dataRequest: {
      id: 'dr-4',
      title: { de: 'Antrag D' },
      dataConsumerDisplayName: 'Partial AG',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    },
    showStateAsMigrated: false,
    // a newly added consent request without a decision next to already decided ones
    consentRequests: [
      { id: '6', stateCode: ConsentRequestStateEnum.Granted },
      { id: '7', stateCode: ConsentRequestStateEnum.Declined, dataProducerBur: '99910005' },
      { id: '8', stateCode: ConsentRequestStateEnum.Opened, dataProducerBur: '99910006' },
    ],
  },
];

export type MockConsentRequestService = Mockify<ConsentRequestService>;

/**
 * Factory that creates a fully-typed mock of `ConsentRequestService`.
 * Methods are jest mocks and default to resolving with `mockConsentRequestAggregations` where
 * appropriate.
 *
 * CommentLastReviewed: 2026-08-07
 */
export function createMockConsentRequestService(): MockConsentRequestService {
  return {
    fetchConsentRequests: jest.fn().mockResolvedValue(mockConsentRequestAggregations),
    fetchConsentRequest: jest.fn().mockResolvedValue(mockConsentRequests[0]),
    updateConsentRequestStatus: jest.fn().mockResolvedValue(undefined),
    updateConsentRequestStatuses: jest.fn().mockResolvedValue([]),
    createConsentRequests: jest.fn().mockResolvedValue(undefined),
  } satisfies MockConsentRequestService;
}
