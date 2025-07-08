import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DataRequestService } from '@/entities/api';
import {
  DataProductsService,
  DataRequestDto,
  DataRequestUpdateDto,
  DataRequestsService,
} from '@/entities/openapi';

describe('DataRequestService', () => {
  let service: DataRequestService;
  let mockDataRequestService: {
    getDataRequests: jest.Mock;
    createDataRequestDraft: jest.Mock;
    updateDataRequestDetails: jest.Mock;
  };

  beforeEach(() => {
    mockDataRequestService = {
      getDataRequests: jest.fn(),
      createDataRequestDraft: jest.fn(),
      updateDataRequestDetails: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [
        DataRequestService,
        { provide: DataRequestsService, useValue: mockDataRequestService },
        { provide: DataProductsService, useValue: {} },
      ],
    });
    service = TestBed.inject(DataRequestService);
  });

  it('fetchDataRequests() loads data on success', async () => {
    const mockData: DataRequestDto[] = [
      {
        id: '1',
        stateCode: 'DRAFT',
      },
      {
        id: '2',
        stateCode: 'DRAFT',
      },
    ];
    mockDataRequestService.getDataRequests.mockReturnValue(of(mockData));

    const result = await service.fetchDataRequests();

    expect(mockDataRequestService.getDataRequests).toHaveBeenCalledTimes(1);
    expect(result).toEqual(mockData);
  });

  it('createDataRequest() calls API with quoted stateCode and resolves to DTO', async () => {
    const createDto: DataRequestUpdateDto = {
      stateCode: 'DRAFT',
    } as DataRequestUpdateDto;
    mockDataRequestService.createDataRequestDraft.mockReturnValue(of(createDto));

    const promise = service.createDataRequest(createDto);

    expect(mockDataRequestService.createDataRequestDraft).toHaveBeenCalledWith(createDto);

    const result = await promise;
    expect(result).toEqual(createDto);
  });

  it('updateDataRequest() calls API with quoted stateCode and resolves to DTO', async () => {
    const updatedDto: DataRequestUpdateDto = {
      id: 'abc-123',
      stateCode: 'DRAFT',
    } as DataRequestUpdateDto;
    mockDataRequestService.updateDataRequestDetails.mockReturnValue(of(updatedDto));

    const promise = service.updateDataRequestDetails('abc-123', updatedDto);

    expect(mockDataRequestService.updateDataRequestDetails).toHaveBeenCalledWith(
      'abc-123',
      updatedDto,
    );

    const result = await promise;
    expect(result).toEqual(updatedDto);
  });
});
