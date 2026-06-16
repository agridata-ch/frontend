import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DataProductDto, DataProductsService } from '@/entities/openapi';
import { PageResponseDtoDataProductDto } from '@/entities/openapi/model/pageResponseDtoDataProductDto';
import { PageResponseDto } from '@/shared/lib/api.helper';

import { DataProductService } from './data-product.service';

const mockProduct: DataProductDto = {
  id: 'dp-1',
  stateCode: 'DRAFT',
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
    createDataProductDraft: jest.fn().mockReturnValue(of(mockProduct)),
    getDataProductsPaginated: jest.fn().mockReturnValue(of(mockPageApiResponse)),
    setDataProductStatus: jest.fn().mockReturnValue(of(mockProduct)),
    getDataProduct: jest.fn().mockReturnValue(of(mockProduct)),
    updateDataProductDraft: jest.fn().mockReturnValue(of(mockProduct)),
  };
}

describe('DataProductService', () => {
  let service: DataProductService;
  let mockApiService: ReturnType<typeof createMockApiService>;

  beforeEach(() => {
    mockApiService = createMockApiService();

    TestBed.configureTestingModule({
      providers: [DataProductService, { provide: DataProductsService, useValue: mockApiService }],
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
    it('sets the Accept-Language header to the provided locale', async () => {
      await service.getAllDataProducts({}, 'fr');
      expect(mockApiService.defaultHeaders.get('Accept-Language')).toBe('fr');
    });

    it('calls getDataProductsPaginated with page, searchTerm, size, actingRole', async () => {
      await service.getAllDataProducts(
        { page: 2, searchTerm: 'crop', size: 5, sortParams: [] },
        'de',
        'ADMIN',
      );
      expect(mockApiService.getDataProductsPaginated).toHaveBeenCalledWith(
        2,
        'crop',
        5,
        expect.anything(),
        'ADMIN',
      );
    });

    it('returns a PageResponseDto with the items from the API response', async () => {
      const result: PageResponseDto<DataProductDto> = await service.getAllDataProducts({}, 'de');
      expect(result.items).toEqual([mockProduct]);
      expect(result.totalItems).toBe(1);
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
