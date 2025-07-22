import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UidRegisterService } from '@/entities/api';
import { UIDRegisterSearchService, UidRegisterOrganisationDto } from '@/entities/openapi';

describe('DataRequestService', () => {
  let service: UidRegisterService;
  let mockUidRegisterService: {
    getByUidOfCurrentUser: jest.Mock;
    getByUid: jest.Mock;
  };

  beforeEach(() => {
    mockUidRegisterService = {
      getByUidOfCurrentUser: jest.fn(),
      getByUid: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        UidRegisterService,
        { provide: UIDRegisterSearchService, useValue: mockUidRegisterService },
      ],
    });
    service = TestBed.inject(UidRegisterService);
  });

  it('fetchDataRequests resource loads data on success', () => {
    const mockData: UidRegisterOrganisationDto[] = [
      {
        name: 'Test Org',
        uid: 123,
        legalName: 'Test Legal Name',
        address: { city: 'Test City', country: 'Test Country' },
      },
    ];
    mockUidRegisterService.getByUidOfCurrentUser.mockReturnValue(of(mockData));

    expect(service.uidInfosOfCurrentUser.isLoading()).toBe(true);

    setTimeout(() => {
      expect(service.uidInfosOfCurrentUser.value()).toEqual(mockData);
      expect(service.uidInfosOfCurrentUser.isLoading()).toBe(false);
    }, 0);
  });

  it('searchByUidResource resource loads data on success', () => {
    const mockData: UidRegisterOrganisationDto = {
      name: 'Test Org',
      uid: 123,
      legalName: 'Test Legal Name',
      address: { city: 'Test City', country: 'Test Country' },
    };
    mockUidRegisterService.getByUid.mockReturnValue(of(mockData));

    setTimeout(() => {
      expect(service.searchByUidResource(123).value()).toEqual(mockData);
    }, 0);
  });
});
