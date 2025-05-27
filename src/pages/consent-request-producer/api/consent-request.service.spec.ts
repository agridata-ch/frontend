// consent-request.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ConsentRequestService } from './consent-request.service';
import { DataConsentResourceService } from '@shared/api/openapi/api/dataConsentResource.service';
import { ConsentRequestDto } from '@shared/api/openapi/model/models';

function flushPromises(): Promise<void> {
  return new Promise((r) => setTimeout(r, 0));
}

describe('ConsentRequestService', () => {
  let service: ConsentRequestService;
  let apiMock: Partial<DataConsentResourceService>;

  beforeEach(() => {
    apiMock = {
      getConsentRequests: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConsentRequestService,
        { provide: DataConsentResourceService, useValue: apiMock },
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
    const mockData: ConsentRequestDto[] = [
      {
        dataProducerId: 'u1',
        dataRequest: { id: '0', descriptionDe: 'D1' },
        requestDate: '2025-05-10',
        stateCode: 'OPENED',
      },
      {
        dataProducerId: 'u2',
        dataRequest: { id: '1', descriptionDe: 'D2' },
        requestDate: '2025-05-11',
        stateCode: 'DECLINED',
      },
    ];
    (apiMock.getConsentRequests as jest.Mock).mockReturnValue(of(mockData));

    service.reload();
    await flushPromises();

    expect(apiMock.getConsentRequests).toHaveBeenCalledTimes(1);
    expect(service.consentRequests.value()).toEqual(mockData);
    expect(service.consentRequests.error()).toBeUndefined();
    expect(service.consentRequests.isLoading()).toBe(false);
  });

  it('reload() surfaces API errors', async () => {
    const err = new Error('oops');
    (apiMock.getConsentRequests as jest.Mock).mockReturnValue(throwError(() => err));

    service.reload();
    await flushPromises();

    expect(apiMock.getConsentRequests).toHaveBeenCalledTimes(1);
    expect(service.consentRequests.error()).toBe(err);
    expect(service.consentRequests.value()).toEqual([]); // stays at defaultValue
  });
});
