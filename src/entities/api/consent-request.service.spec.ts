import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConsentRequestService } from '@/entities/api';
import { ConsentRequestDto, ConsentRequestsService } from '@/entities/openapi';

describe('ConsentRequestService', () => {
  let service: ConsentRequestService;
  let apiMock: Pick<ConsentRequestsService, 'getConsentRequests' | 'updateConsentRequestStatus'>;

  beforeEach(() => {
    apiMock = {
      getConsentRequests: jest.fn(),
      updateConsentRequestStatus: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [ConsentRequestService, { provide: ConsentRequestsService, useValue: apiMock }],
    });
    service = TestBed.inject(ConsentRequestService);
  });

  it('fetchConsentRequests() loads data on success', async () => {
    const mockData: ConsentRequestDto[] = [
      {
        id: '1',
        dataProducerId: 'u1',
        dataRequest: {
          id: '0',
          description: { de: 'D1' },
          stateCode: 'DRAFT',
        },
        requestDate: '2025-05-10',
        stateCode: 'OPENED',
      },
      {
        id: '2',
        dataProducerId: 'u2',
        dataRequest: {
          id: '1',
          description: { de: 'D2' },
          stateCode: 'DRAFT',
        },
        requestDate: '2025-05-11',
        stateCode: 'DECLINED',
      },
    ];
    (apiMock.getConsentRequests as jest.Mock).mockReturnValue(of(mockData));

    const result = await service.fetchConsentRequests();

    expect(apiMock.getConsentRequests).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockData);
  });

  it('updateConsentRequestStatus() calls API with quoted stateCode and resolves to DTO', async () => {
    const updatedDto: ConsentRequestDto = { id: '1' } as ConsentRequestDto;
    (apiMock.updateConsentRequestStatus as jest.Mock).mockReturnValue(of(updatedDto));

    const promise = service.updateConsentRequestStatus('abc-123', 'GRANTED');

    expect(apiMock.updateConsentRequestStatus).toHaveBeenCalledWith('abc-123', '"GRANTED"');

    const result = await promise;
    expect(result).toEqual(updatedDto);
  });
});
