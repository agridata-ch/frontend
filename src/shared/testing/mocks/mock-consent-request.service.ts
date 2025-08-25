import {
  ConsentRequestDetailViewDto,
  ConsentRequestDetailViewDtoDataRequestStateCode,
  ConsentRequestStateEnum,
} from '@/entities/openapi';

export class MockConsentRequestService {
  fetchConsentRequests = {
    value: jest.fn().mockReturnValue(mockConsentRequests),
    isLoading: jest.fn(),
    reload: jest.fn(),
  };
  getConsentRequest = jest.fn().mockResolvedValue(mockConsentRequests[0]);
  updateConsentRequestStatus = jest.fn().mockResolvedValue(undefined);
}

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
