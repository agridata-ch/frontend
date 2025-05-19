// consent-request.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ConsentRequestService } from './consent-request.service';
import { ConsentRequestControllerService } from '@shared/api/openapi/api/consentRequestController.service';
import { ConsentRequest } from '@shared/api/openapi/model/models';

function flushPromises(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

describe('ConsentRequestService', () => {
  let service: ConsentRequestService;
  let apiMock: Partial<ConsentRequestControllerService>;

  beforeEach(() => {
    apiMock = {
      agreementV1ConsentRequestsGet: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConsentRequestService,
        { provide: ConsentRequestControllerService, useValue: apiMock },
      ],
    });

    service = TestBed.inject(ConsentRequestService);
  });

  it('starts with empty value', () => {
    expect(service.consentRequests.value()).toEqual([]);
    expect(service.consentRequests.hasValue()).toBe(true);
    expect(service.consentRequests.isLoading()).toBe(true);
  });

  it('reload() loads data on success', async () => {
    const mockData: ConsentRequest[] = [
      {
        dataProducerUid: 'u1',
        dataRequest: { descriptionDe: 'D1' },
        requestDate: '2025-05-10',
        state: 'OPENED',
      },
      {
        dataProducerUid: 'u2',
        dataRequest: { descriptionDe: 'D2' },
        requestDate: '2025-05-11',
        state: 'DECLINED',
      },
    ];
    (apiMock.agreementV1ConsentRequestsGet as jest.Mock).mockReturnValue(of(mockData));

    service.reload();
    await flushPromises();

    expect(apiMock.agreementV1ConsentRequestsGet).toHaveBeenCalledTimes(1);
    expect(service.consentRequests.value()).toEqual(mockData);
    expect(service.consentRequests.error()).toBeUndefined();
    expect(service.consentRequests.isLoading()).toBe(false);
  });

  it('reload() surfaces API errors', async () => {
    const err = new Error('oops');
    (apiMock.agreementV1ConsentRequestsGet as jest.Mock).mockReturnValue(throwError(() => err));

    service.reload();
    await flushPromises();

    expect(apiMock.agreementV1ConsentRequestsGet).toHaveBeenCalledTimes(1);
    expect(service.consentRequests.error()).toBe(err);
    expect(service.consentRequests.value()).toEqual([]); // stays at defaultValue
  });
});
