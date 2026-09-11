import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TestDataService } from '@/entities/openapi/api/testData.service';

import { TestDataApiService } from './test-data.service';

describe('TestDataApiService', () => {
  let service: TestDataApiService;
  let apiService: { resetTestData: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    apiService = { resetTestData: vi.fn().mockReturnValue(of({})) };

    TestBed.configureTestingModule({
      providers: [TestDataApiService, { provide: TestDataService, useValue: apiService }],
    });
    service = TestBed.inject(TestDataApiService);
  });

  it('resets test data through the openapi service', async () => {
    await service.resetTestData();

    expect(apiService.resetTestData).toHaveBeenCalledTimes(1);
  });
});
