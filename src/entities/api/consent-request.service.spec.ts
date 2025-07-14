import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConsentRequestDto } from '@/entities/openapi';
import { ConsentRequestsService } from '@/entities/openapi/api/consentRequests.service';

import { ConsentRequestService } from './consent-request.service';

describe('ConsentRequestService', () => {
  let service: ConsentRequestService;
  let mockConsentRequestsService: {
    getConsentRequests: jest.Mock;
    updateConsentRequestStatus: jest.Mock;
  };

  beforeEach(() => {
    mockConsentRequestsService = {
      getConsentRequests: jest.fn(),
      updateConsentRequestStatus: jest.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ConsentRequestService,
        { provide: ConsentRequestsService, useValue: mockConsentRequestsService },
      ],
    });

    service = TestBed.inject(ConsentRequestService);
  });

  it('fetchConsentRequests resource loads data on success', (done) => {
    const mockData: ConsentRequestDto[] = [
      { id: 'r1' } as ConsentRequestDto,
      { id: 'r2' } as ConsentRequestDto,
    ];
    mockConsentRequestsService.getConsentRequests.mockReturnValue(of(mockData));

    // Initially loading
    expect(service.fetchConsentRequests.isLoading()).toBe(true);

    // Wait for the resource to resolve
    setTimeout(() => {
      expect(service.fetchConsentRequests.value()).toEqual(mockData);
      expect(service.fetchConsentRequests.isLoading()).toBe(false);
      done();
    }, 0);
  });

  it('updateConsentRequestStatus calls API with quoted stateCode and returns response', async () => {
    const updateResp = { success: true };
    mockConsentRequestsService.updateConsentRequestStatus.mockReturnValue(of(updateResp));

    const promise = service.updateConsentRequestStatus('123', 'APPROVED');
    const result = await promise;

    expect(mockConsentRequestsService.updateConsentRequestStatus).toHaveBeenCalledWith(
      '123',
      '"APPROVED"',
    );
    expect(result).toEqual(updateResp);
  });
});
