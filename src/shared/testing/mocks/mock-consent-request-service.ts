import { ConsentRequestService } from '@/entities/api';
import {
  ConsentRequestAggregationDto,
  ConsentRequestAggregationStateEnum,
  ConsentRequestStateEnum,
  DataRequestStateEnum,
} from '@/entities/openapi';
import { Mockify } from '@/shared/testing/mocks';

/**
 * Full consent-request aggregations, one per data request, covering every aggregation state the UI
 * distinguishes. Consent-request ids are unique across the whole set so a spec can assert on a
 * single child by id. Typed as the full ConsentRequestAggregationDto; structurally assignable
 * wherever a ConsentRequestAggregationSummaryDto is expected (list / table).
 */
export const mockConsentRequestAggregations: ConsentRequestAggregationDto[] = [
  {
    id: 'dr-1',
    stateCode: ConsentRequestAggregationStateEnum.Opened,
    requestDate: '2025-05-01',
    dataRequest: {
      id: 'dr-1',
      title: { de: 'Antrag A' },
      dataConsumerDisplayName: 'Test AG',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    },
    showStateAsMigrated: true,
    consentRequests: [{ id: '1', stateCode: ConsentRequestStateEnum.Opened }],
  },
  {
    id: 'dr-2',
    stateCode: ConsentRequestAggregationStateEnum.Granted,
    requestDate: '2025-05-02',
    dataRequest: {
      id: 'dr-2',
      title: { de: 'Antrag B' },
      dataConsumerDisplayName: 'Demo GmbH',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    },
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
    dataRequest: {
      id: 'dr-3',
      title: { de: 'Antrag C' },
      dataConsumerDisplayName: 'Open AG',
      stateCode: DataRequestStateEnum.Draft,
      advantages: [],
    },
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
 * CommentLastReviewed: 2026-08-17
 */
export function createMockConsentRequestService(): MockConsentRequestService {
  return {
    fetchConsentRequests: vi.fn().mockResolvedValue(mockConsentRequestAggregations),
    fetchConsentRequestAggregation: vi.fn().mockResolvedValue(mockConsentRequestAggregations[0]),
    updateConsentRequestStatus: vi.fn().mockResolvedValue(undefined),
    updateConsentRequestStatuses: vi.fn().mockResolvedValue([]),
    createConsentRequests: vi.fn().mockResolvedValue(undefined),
  } satisfies MockConsentRequestService;
}
