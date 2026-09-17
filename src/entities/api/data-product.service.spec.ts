import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DataProductDto, DataProductsService, PublicDataProductsService } from '@/entities/openapi';
import { PageResponseDtoDataProductDto } from '@/entities/openapi/model/pageResponseDtoDataProductDto';
import { PageResponseDto } from '@/shared/lib/api.helper';

import { DataProductService } from './data-product.service';

const mockProduct: DataProductDto = {
  paymentRequired: false,
  id: 'dp-1',
  stateCode: 'DRAFT',
  consentRequired: false,
};

const mockPageApiResponse: PageResponseDtoDataProductDto = {
  items: [mockProduct],
  totalItems: 1,
  totalPages: 1,
  currentPage: 0,
  pageSize: 10,
};

function createMockApiService() {
  let headers = new HttpHeaders();
  return {
    get defaultHeaders() {
      return headers;
    },
    set defaultHeaders(h: HttpHeaders) {
      headers = h;
    },
    createDataProductDraft: vi.fn().mockReturnValue(of(mockProduct)),
    getDataProductsPaginated: vi.fn().mockReturnValue(of(mockPageApiResponse)),
    setDataProductStatus: vi.fn().mockReturnValue(of(mockProduct)),
    getDataProduct: vi.fn().mockReturnValue(of(mockProduct)),
    updateDataProductDraft: vi.fn().mockReturnValue(of(mockProduct)),
    patchDataProduct: vi.fn().mockReturnValue(of(mockProduct)),
    deleteDataProductDraft: vi.fn().mockReturnValue(of(undefined)),
  };
}

function createMockPublicApiService() {
  return {
    getPublicDataProductsPaginated: vi.fn().mockReturnValue(of(mockPageApiResponse)),
    getPublicDataProduct: vi.fn().mockReturnValue(of(mockProduct)),
  };
}

describe('DataProductService', () => {
  let service: DataProductService;
  let mockApiService: ReturnType<typeof createMockApiService>;
  let mockPublicApiService: ReturnType<typeof createMockPublicApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();
    mockPublicApiService = createMockPublicApiService();

    TestBed.configureTestingModule({
      providers: [
        DataProductService,
        { provide: DataProductsService, useValue: mockApiService },
        { provide: PublicDataProductsService, useValue: mockPublicApiService },
      ],
    });

    service = TestBed.inject(DataProductService);
  });

  describe('createDataProduct', () => {
    it('calls createDataProductDraft with dto and actingRole', async () => {
      const dto = { name: { de: 'Test' } };
      await service.createDataProduct(dto, 'PROVIDER');
      expect(mockApiService.createDataProductDraft).toHaveBeenCalledWith(dto, 'PROVIDER');
    });

    it('returns the resolved DataProductDto', async () => {
      const dto = { name: { de: 'Test' } };
      const result = await service.createDataProduct(dto);
      expect(result).toEqual(mockProduct);
    });

    it('passes undefined actingRole when omitted', async () => {
      await service.createDataProduct({});
      expect(mockApiService.createDataProductDraft).toHaveBeenCalledWith({}, undefined);
    });
  });

  describe('getAllDataProducts', () => {
    it('calls getDataProductsPaginated with filter, language, page, searchTerm, size, sort, actingRole', async () => {
      await service.getAllDataProducts(
        { language: 'de', page: 2, searchTerm: 'crop', size: 5, sortParams: [] },
        'ADMIN',
      );
      expect(mockApiService.getDataProductsPaginated).toHaveBeenCalledWith(
        undefined,
        'de',
        2,
        'crop',
        5,
        expect.anything(),
        'ADMIN',
      );
    });

    it('forwards columnFilters as a joined filter object in the first argument', async () => {
      await service.getAllDataProducts({
        columnFilters: ['dataProviderId:p1', 'dataSourceSystemId:s1'],
      });
      expect(mockApiService.getDataProductsPaginated).toHaveBeenCalledWith(
        { filter: 'dataProviderId:p1;dataSourceSystemId:s1' },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('returns a PageResponseDto with the items from the API response', async () => {
      const result: PageResponseDto<DataProductDto> = await service.getAllDataProducts({});
      expect(result.items).toEqual([mockProduct]);
      expect(result.totalItems).toBe(1);
    });
  });

  describe('getPublicProducts', () => {
    it('passes no filter when columnFilters is empty', async () => {
      await service.getPublicProducts({ language: 'de', page: 0, size: 10, sortParams: [] });
      expect(mockPublicApiService.getPublicDataProductsPaginated).toHaveBeenCalledWith(
        undefined,
        'de',
        0,
        undefined,
        10,
        expect.anything(),
      );
    });

    it('forwards columnFilters as a joined filter object in the first argument', async () => {
      await service.getPublicProducts({
        columnFilters: ['dataProviderId:p1', 'dataSourceSystemId:s1'],
      });
      expect(mockPublicApiService.getPublicDataProductsPaginated).toHaveBeenCalledWith(
        { filter: 'dataProviderId:p1;dataSourceSystemId:s1' },
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });
  });

  describe('getDataProductById', () => {
    it('calls getDataProduct with id and actingRole', async () => {
      await service.getDataProductById('dp-1', 'PROVIDER');
      expect(mockApiService.getDataProduct).toHaveBeenCalledWith('dp-1', 'PROVIDER');
    });

    it('returns the resolved DataProductDto', async () => {
      const result = await service.getDataProductById('dp-1');
      expect(result).toEqual(mockProduct);
    });

    it('passes undefined actingRole when omitted', async () => {
      await service.getDataProductById('dp-1');
      expect(mockApiService.getDataProduct).toHaveBeenCalledWith('dp-1', undefined);
    });
  });

  describe('setDataProductStatus', () => {
    it('calls setDataProductStatus with id, stateCode, and actingRole', async () => {
      await service.setDataProductStatus('dp-1', 'ACTIVE', 'ADMIN');
      expect(mockApiService.setDataProductStatus).toHaveBeenCalledWith('dp-1', 'ACTIVE', 'ADMIN');
    });

    it('returns the resolved DataProductDto', async () => {
      const result = await service.setDataProductStatus('dp-1', 'ACTIVE');
      expect(result).toEqual(mockProduct);
    });

    it('passes undefined actingRole when omitted', async () => {
      await service.setDataProductStatus('dp-1', 'ACTIVE');
      expect(mockApiService.setDataProductStatus).toHaveBeenCalledWith('dp-1', 'ACTIVE', undefined);
    });
  });

  describe('updateDataProduct', () => {
    it('calls updateDataProductDraft with id, dto, and actingRole', async () => {
      const dto = { name: { de: 'Updated' } };
      await service.updateDataProduct('dp-1', dto, 'PROVIDER');
      expect(mockApiService.updateDataProductDraft).toHaveBeenCalledWith('dp-1', dto, 'PROVIDER');
    });

    it('returns the resolved DataProductDto', async () => {
      const result = await service.updateDataProduct('dp-1', {});
      expect(result).toEqual(mockProduct);
    });

    it('passes undefined actingRole when omitted', async () => {
      await service.updateDataProduct('dp-1', {});
      expect(mockApiService.updateDataProductDraft).toHaveBeenCalledWith('dp-1', {}, undefined);
    });
  });
});
