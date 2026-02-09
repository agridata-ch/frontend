import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataProductDto, DataProviderDto, DataProvidersService } from '@/entities/openapi';
import { AuthService } from '@/shared/lib/auth';
import { createMockAuthService, MockAuthService } from '@/shared/testing/mocks/mock-auth-service';
import {
  createMockErrorHandlerService,
  MockErrorHandlerService,
} from '@/shared/testing/mocks/mock-error-handler.service';

import { MasterDataService } from './master-data.service';

const mockProviders: DataProviderDto[] = [
  { id: 'provider-1', name: { de: 'Provider 1' } },
  { id: 'provider-2', name: { de: 'Provider 2' } },
];

const mockProductsProvider1: DataProductDto[] = [
  { id: 'product-1', name: { de: 'Produkt 1' }, dataSourceSystemCode: 'AGIS' },
  { id: 'product-2', name: { de: 'Produkt 2' }, dataSourceSystemCode: 'TVD' },
];

const mockProductsProvider2: DataProductDto[] = [
  { id: 'product-3', name: { de: 'Produkt 3' }, dataSourceSystemCode: 'AGIS' },
];

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('MasterDataService', () => {
  let service: MasterDataService;
  let authService: MockAuthService;
  let errorService: MockErrorHandlerService;
  let dataProviderService: jest.Mocked<DataProvidersService>;

  beforeEach(() => {
    authService = createMockAuthService();
    errorService = createMockErrorHandlerService();
    dataProviderService = {
      getDataProviders: jest.fn().mockReturnValue(of(mockProviders)),
      getDataProductsByProviderId: jest.fn().mockImplementation((providerId: string) => {
        if (providerId === 'provider-1') {
          return of(mockProductsProvider1);
        }
        if (providerId === 'provider-2') {
          return of(mockProductsProvider2);
        }
        return of([]);
      }),
    } as unknown as jest.Mocked<DataProvidersService>;

    TestBed.configureTestingModule({
      providers: [
        MasterDataService,
        { provide: AuthService, useValue: authService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: DataProvidersService, useValue: dataProviderService },
      ],
    });

    service = TestBed.inject(MasterDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('dataProviders', () => {
    it('should fetch providers when authenticated', async () => {
      authService.__testSignals.isAuthenticated.set(true);
      await flushPromises();

      expect(dataProviderService.getDataProviders).toHaveBeenCalled();
      expect(service.dataProviders()).toEqual(mockProviders);
    });

    it('should not fetch providers when not authenticated', async () => {
      authService.__testSignals.isAuthenticated.set(false);
      await flushPromises();

      expect(service.dataProviders()).toEqual([]);
    });

    it('should handle errors when fetching providers', async () => {
      const testError = new Error('Failed to fetch providers');
      dataProviderService.getDataProviders.mockReturnValue(throwError(() => testError));

      authService.__testSignals.isAuthenticated.set(true);
      await flushPromises();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });
  });

  describe('getProductsForProvider', () => {
    it('should return empty array when providerId is undefined', () => {
      expect(service.getProductsForProvider(undefined)).toEqual([]);
    });

    it('should return empty array when products not yet loaded', () => {
      expect(service.getProductsForProvider('provider-1')).toEqual([]);
    });

    it('should return cached products after loading', async () => {
      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      expect(service.getProductsForProvider('provider-1')).toEqual(mockProductsProvider1);
    });
  });

  describe('fetchProductsByProvider', () => {
    it('should not fetch when providerId is undefined', async () => {
      service.fetchProductsByProvider(undefined);
      await flushPromises();

      expect(dataProviderService.getDataProductsByProviderId).not.toHaveBeenCalled();
    });

    it('should fetch and cache products for provider', async () => {
      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      expect(dataProviderService.getDataProductsByProviderId).toHaveBeenCalledWith('provider-1');
      expect(service.getProductsForProvider('provider-1')).toEqual(mockProductsProvider1);
    });

    it('should not refetch if already cached', async () => {
      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      expect(dataProviderService.getDataProductsByProviderId).toHaveBeenCalledTimes(1);
    });

    it('should not refetch if already loading', async () => {
      // Start first fetch
      service.fetchProductsByProvider('provider-1');

      // Try to fetch again while still loading
      service.fetchProductsByProvider('provider-1');

      await flushPromises();

      expect(dataProviderService.getDataProductsByProviderId).toHaveBeenCalledTimes(1);
    });

    it('should handle errors and route to error service', async () => {
      const testError = new Error('Failed to fetch products');
      dataProviderService.getDataProductsByProviderId.mockReturnValue(throwError(() => testError));

      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      expect(errorService.handleError).toHaveBeenCalledWith(testError);
    });

    it('should cache products separately per provider', async () => {
      service.fetchProductsByProvider('provider-1');
      await flushPromises();

      service.fetchProductsByProvider('provider-2');
      await flushPromises();

      expect(service.getProductsForProvider('provider-1')).toEqual(mockProductsProvider1);
      expect(service.getProductsForProvider('provider-2')).toEqual(mockProductsProvider2);
    });
  });

  describe('isLoadingProductsByProvider', () => {
    it('should return false when providerId is undefined', () => {
      expect(service.isLoadingProductsByProvider(undefined)).toBe(false);
    });

    it('should return false when not loading', () => {
      expect(service.isLoadingProductsByProvider('provider-1')).toBe(false);
    });

    it('should return true while loading and false after completion', async () => {
      service.fetchProductsByProvider('provider-1');

      expect(service.isLoadingProductsByProvider('provider-1')).toBe(true);

      await flushPromises();

      expect(service.isLoadingProductsByProvider('provider-1')).toBe(false);
    });
  });

  describe('isLoadingProducts', () => {
    it('should return false when no providers are loading', () => {
      expect(service.isLoadingProducts()).toBe(false);
    });

    it('should return true when any provider is loading', async () => {
      service.fetchProductsByProvider('provider-1');

      expect(service.isLoadingProducts()).toBe(true);

      await flushPromises();

      expect(service.isLoadingProducts()).toBe(false);
    });
  });

  describe('isProvidersLoading', () => {
    it('should return false when not authenticated', () => {
      authService.__testSignals.isAuthenticated.set(false);
      expect(service.isProvidersLoading()).toBe(false);
    });
  });
});
