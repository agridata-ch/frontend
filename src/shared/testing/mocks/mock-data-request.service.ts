import { DataRequestDto, DataRequestStateEnum } from '@/entities/openapi';

export class MockDataRequestService {
  fetchDataRequests = {
    value: jest.fn().mockReturnValue(mockDataRequests),
    isLoading: jest.fn(),
    reload: jest.fn(),
  };
  retreatDataRequest = jest.fn().mockResolvedValue(undefined);
  createDataRequest = jest.fn().mockResolvedValue(mockDataRequests[0]);
  updateDataRequestDetails = jest.fn().mockResolvedValue(undefined);
  uploadLogo = jest.fn().mockResolvedValue(undefined);
  submitDataRequest = jest.fn().mockResolvedValue(undefined);
}

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
