import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestStateEnum } from '@/entities/openapi';
import { ConsentRequestDetailViewDto } from '@/entities/openapi/model/consentRequestDetailViewDto';
import { ConsentRequestDetailViewDtoDataRequestStateCode } from '@/entities/openapi/model/consentRequestDetailViewDtoDataRequestStateCode';

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

export const mockConsentRequestService = {
  updateConsentRequestStatus: jest.fn().mockResolvedValue(undefined),
  createConsentRequests: jest.fn().mockReturnValue({}),
  apiService: { uid: 'test-uid' },
  fetchConsentRequests: jest.fn().mockReturnValue(mockConsentRequests),
} as unknown as ConsentRequestService;
