import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ConsentRequestService } from './consent-request.service';
import { ConsentRequestControllerService } from '@/app/shared/openapi/api/consentRequestController.service';
import type { ConsentRequest } from '@/app/shared/openapi/model/models';

// Stub implementation of the generated API service
class StubConsentRequestControllerService {
  agreementV1ConsentRequestsGet = jest.fn<import('rxjs').Observable<ConsentRequest[]>, []>();
}

describe('ConsentRequestService', () => {
  let service: ConsentRequestService;
  let apiStub: StubConsentRequestControllerService;

  beforeEach(() => {
    apiStub = new StubConsentRequestControllerService();

    TestBed.configureTestingModule({
      providers: [
        ConsentRequestService,
        { provide: ConsentRequestControllerService, useValue: apiStub },
      ],
    });

    service = TestBed.inject(ConsentRequestService);
  });

  it('should have an empty default value', () => {
    expect(service.consentRequests.value()).toEqual([]);
  });

  it('reload() should fetch data once and update resource', async () => {
    const mockData: ConsentRequest[] = [
      {
        dataProducerUid: 'P1',
        dataRequest: { descriptionDe: 'D1' },
        requestDate: '2025-01-01',
        state: 'OPENED',
      } as ConsentRequest,
    ];
    apiStub.agreementV1ConsentRequestsGet.mockReturnValue(of(mockData));

    service.reload();
    expect(service.consentRequests.value()).toEqual([]);

    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    expect(service.consentRequests.value()).toEqual(mockData);
    expect(apiStub.agreementV1ConsentRequestsGet).toHaveBeenCalledTimes(1);
  });
});
