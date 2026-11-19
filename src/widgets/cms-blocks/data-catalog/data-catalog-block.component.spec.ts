import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { DataProductDocumentService } from '@/entities/api/data-product-document.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { MasterDataService } from '@/entities/api/master-data.service';
import {
  DataProviderDto,
  DataSourceSystemDto,
  PublicDataProductSummaryDto,
} from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockDataProductDocumentService,
  createMockDataProductService,
  createMockErrorHandlerService,
  createMockI18nService,
  createMockMasterDataService,
  MockDataProductService,
  MockErrorHandlerService,
  MockMasterDataService,
} from '@/shared/testing/mocks';

import { DataCatalogBlockComponent } from './data-catalog-block.component';

class MockIntersectionObserver {
  public static readonly instances: MockIntersectionObserver[] = [];

  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly disconnect = vi.fn();
  readonly takeRecords = vi.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {
    MockIntersectionObserver.instances.push(this);
  }

  trigger(isIntersecting: boolean): void {
    this.callback(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    );
  }
}

const product = (id: string): PublicDataProductSummaryDto => ({
  paymentRequired: false,
  id,
  stateCode: 'ACTIVE' as PublicDataProductSummaryDto['stateCode'],
  consentRequired: false,
  name: { de: `Produkt ${id}` },
});

const provider = (id: string): DataProviderDto => ({ id, name: { de: `Provider ${id}` } });

const system = (id: string, providerId: string): DataSourceSystemDto => ({
  id,
  name: { de: `System ${id}` },
  dataProvider: provider(providerId),
  legalBasis: { de: '' },
});

describe('DataCatalogBlockComponent', () => {
  let component: DataCatalogBlockComponent;
  let fixture: ComponentFixture<DataCatalogBlockComponent>;
  let dataProductService: MockDataProductService;
  let errorService: MockErrorHandlerService;
  let masterDataService: MockMasterDataService;
  const originalObserver = globalThis.IntersectionObserver;

  const observer = () => MockIntersectionObserver.instances[0];

  // Renders the component, which fetches the first page in afterNextRender.
  async function init(): Promise<void> {
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  // Simulates the user scrolling the sentinel out of and back into view, loading a page each time it
  // re-enters while the directive is enabled.
  async function scrollToEnd(): Promise<void> {
    for (let i = 0; i < 4; i++) {
      observer().trigger(false);
      observer().trigger(true);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    }
  }

  beforeEach(async () => {
    MockIntersectionObserver.instances.length = 0;
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;

    dataProductService = createMockDataProductService();
    errorService = createMockErrorHandlerService();
    masterDataService = createMockMasterDataService();

    await TestBed.configureTestingModule({
      imports: [DataCatalogBlockComponent],
      providers: [
        { provide: DataProductService, useValue: dataProductService },
        { provide: DataProductDocumentService, useValue: createMockDataProductDocumentService() },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: MasterDataService, useValue: masterDataService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataCatalogBlockComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    globalThis.IntersectionObserver = originalObserver;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch the first page on init', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('a'), product('b')],
      totalItems: 2,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });

    await init();

    expect(dataProductService.getPublicProducts).toHaveBeenCalledTimes(1);
    expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ sortParams: ['productName'] }),
    );
    expect(component['products']()).toHaveLength(2);
    expect(fixture.nativeElement.querySelectorAll('app-data-product-card')).toHaveLength(2);
  });

  it('should accumulate items across pages and stop at the last page', async () => {
    dataProductService.getPublicProducts
      .mockResolvedValueOnce({
        items: [product('a'), product('b')],
        totalItems: 3,
        totalPages: 2,
        currentPage: 0,
        pageSize: 10,
      })
      .mockResolvedValueOnce({
        items: [product('c')],
        totalItems: 3,
        totalPages: 2,
        currentPage: 1,
        pageSize: 10,
      });

    await init();
    await scrollToEnd();

    expect(dataProductService.getPublicProducts).toHaveBeenCalledTimes(2);
    expect(component['products']()).toHaveLength(3);
    expect(component['hasMore']()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('app-data-product-card')).toHaveLength(3);
  });

  it('should show skeleton cards while the first page is loading', async () => {
    let resolvePage!: (value: {
      items: PublicDataProductSummaryDto[];
      totalItems: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
    }) => void;
    dataProductService.getPublicProducts.mockReturnValue(
      new Promise((resolve) => (resolvePage = resolve)),
    );

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component['loading']()).toBe(true);
    expect(
      fixture.nativeElement.querySelectorAll('app-card .animate-pulse').length,
    ).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();

    resolvePage({ items: [], totalItems: 0, totalPages: 0, currentPage: 0, pageSize: 10 });
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-card .animate-pulse')).toBeNull();
  });

  it('should show the empty state only after the first page loaded empty', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [],
      totalItems: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    });

    await init();

    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
  });

  it('should reset and refetch with the selected sort order', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('a')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });

    await init();
    component['handleSortChange']('-productName');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dataProductService.getPublicProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, sortParams: ['-productName'] }),
    );
    expect(component['products']()).toHaveLength(1);
  });

  it('should reset and refetch with the entered search term', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('a')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });

    await init();
    component['handleSearchChange']('foo');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dataProductService.getPublicProducts).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 0, searchTerm: 'foo' }),
    );
    expect(component['products']()).toHaveLength(1);
  });

  it('should cap the reload skeletons to the known total item count', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('a')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });

    await init();

    // Hold the re-sort request pending so the skeleton state is observable.
    dataProductService.getPublicProducts.mockReturnValue(new Promise(() => undefined));
    component['handleSortChange']('-productName');
    fixture.detectChanges();

    // products is cleared during the reload, so every app-card is a skeleton.
    expect(fixture.nativeElement.querySelectorAll('app-card')).toHaveLength(1);
  });

  it('should surface a failed first page via the error service and not show the empty state', async () => {
    dataProductService.getPublicProducts.mockRejectedValue(new Error('boom'));

    await init();

    expect(errorService.handleError).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('should stop requesting further pages after an error', async () => {
    dataProductService.getPublicProducts.mockRejectedValue(new Error('boom'));

    await init();
    await scrollToEnd();

    // The first failure blocks further loads, so the error is reported once, not on every scroll.
    expect(errorService.handleError).toHaveBeenCalledTimes(1);
  });

  it('opens the detail modal and mirrors the id into the path when a card is clicked', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('x')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });
    dataProductService.getPublicProductById.mockResolvedValue({
      ...product('x'),
      dataSourceSystem: undefined,
    });

    await init();
    fixture.nativeElement.querySelector('app-data-product-card button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dataProductService.getPublicProductById).toHaveBeenCalledWith('x');
    // The modal portals itself to document.body, so it is no longer in the component subtree.
    expect(document.body.querySelector('app-modal > div')).not.toBeNull();
    expect(TestBed.inject(Location).path()).toContain('x');
  });

  it('closes the detail modal and clears the path via the close button', async () => {
    dataProductService.getPublicProducts.mockResolvedValue({
      items: [product('x')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    });
    dataProductService.getPublicProductById.mockResolvedValue({
      ...product('x'),
      dataSourceSystem: undefined,
    });

    await init();
    fixture.nativeElement.querySelector('app-data-product-card button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    document.body
      .querySelector<HTMLElement>('[data-testid="public-data-product-detail-modal-close"]')
      ?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.body.querySelector('app-modal > div')).toBeNull();
    expect(TestBed.inject(Location).path()).not.toContain('x');
  });

  describe('filtering', () => {
    const page = {
      items: [product('a')],
      totalItems: 1,
      totalPages: 1,
      currentPage: 0,
      pageSize: 10,
    };

    beforeEach(() => {
      dataProductService.getPublicProducts.mockResolvedValue(page);
      masterDataService.getPublicDataProviders.mockResolvedValue([provider('p1'), provider('p2')]);
      masterDataService.getPublicDataSourceSystems.mockResolvedValue([
        system('s1', 'p1'),
        system('s2', 'p2'),
      ]);
    });

    it('loads provider and system filter options on init, grouped by provider', async () => {
      await init();

      // "All providers" option plus one per provider.
      expect(component['providerOptions']()).toHaveLength(3);
      expect(component['systemGroups']()).toHaveLength(2);
      expect(component['systemGroups']()[0].options).toHaveLength(1);
    });

    it('shows the selected provider systems as a flat list, without groups', async () => {
      await init();
      component['handleProviderChange']('p1');
      fixture.detectChanges();

      expect(component['systemGroups']()).toHaveLength(0);
      // "All systems" + the single system belonging to the selected provider.
      const flat = component['systemFlatOptions']();
      expect(flat).toHaveLength(2);
      expect(flat[1].value).toBe('s1');
    });

    it('resets the selected system and refetches with the provider filter', async () => {
      await init();
      component['selectedSystemId'].set('s1');
      component['handleProviderChange']('p1');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(component['selectedSystemId']()).toBeNull();
      expect(dataProductService.getPublicProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 0, columnFilters: ['dataProviderId:p1'] }),
      );
    });

    it('refetches with the system filter when a system is selected', async () => {
      await init();
      component['handleSystemChange']('s1');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(dataProductService.getPublicProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({ page: 0, columnFilters: ['dataSourceSystemId:s1'] }),
      );
    });

    describe('shared link', () => {
      // The component reads the query params at construction, so navigate first, then recreate it.
      async function initWithQuery(query: string): Promise<void> {
        // The pre-built fixture would also fetch on the next render, so drop it.
        fixture.destroy();
        await TestBed.inject(Router).navigateByUrl(`/?${query}`);
        fixture = TestBed.createComponent(DataCatalogBlockComponent);
        component = fixture.componentInstance;
        await init();
      }

      it('applies valid filters, search and sort from the URL', async () => {
        await initWithQuery('provider=p1&system=s1&q=foo&sort=-productName');

        expect(dataProductService.getPublicProducts).toHaveBeenCalledTimes(1);
        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({
            searchTerm: 'foo',
            sortParams: ['-productName'],
            columnFilters: ['dataProviderId:p1', 'dataSourceSystemId:s1'],
          }),
        );
      });

      it('keeps the shared filters when the filter options fail to load', async () => {
        masterDataService.getPublicDataProviders.mockRejectedValue(new Error('boom'));

        await initWithQuery('provider=p1&system=s1');

        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({
            columnFilters: ['dataProviderId:p1', 'dataSourceSystemId:s1'],
          }),
        );
      });

      it('does not fetch before the filter ids are validated', async () => {
        masterDataService.getPublicDataProviders.mockReturnValue(new Promise(() => undefined));

        await initWithQuery('provider=p1');

        expect(component['loading']()).toBe(true);
        expect(dataProductService.getPublicProducts).not.toHaveBeenCalled();
      });

      it('trims the q param so the search box does not trigger a second reload', async () => {
        await initWithQuery('q=%20foo%20');

        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({ searchTerm: 'foo' }),
        );
      });

      it('ignores a q param shorter than the minimum search length', async () => {
        await initWithQuery('q=ab');

        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({ searchTerm: undefined }),
        );
      });

      it('treats empty provider and system params as no filter', async () => {
        await initWithQuery('provider=&system=');

        expect(component['selectedProviderId']()).toBeNull();
        expect(component['selectedSystemId']()).toBeNull();
      });

      it('removes an unknown sort from the URL on a sort-only link', async () => {
        await initWithQuery('sort=bogus');

        expect(TestBed.inject(Location).path()).not.toContain('bogus');
      });

      it('shows the unfiltered list for unknown ids and an unknown sort', async () => {
        await initWithQuery('provider=nope&system=nope&sort=bogus');
        await fixture.whenStable();

        expect(dataProductService.getPublicProducts).toHaveBeenCalledTimes(1);
        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({ sortParams: ['productName'], columnFilters: undefined }),
        );
        expect(TestBed.inject(Location).path()).not.toContain('nope');
      });

      it('shows the q param in the search box', async () => {
        await initWithQuery('q=foo');

        expect(fixture.nativeElement.querySelector('app-search-input input').value).toBe('foo');
      });

      it('keeps the open product path together with the filters', async () => {
        await initWithQuery('provider=p1');
        component['openDetail']('x');
        await fixture.whenStable();

        expect(TestBed.inject(Location).path()).toMatch(/x\?.*provider=p1/);
      });

      it('drops a system that does not belong to the selected provider', async () => {
        await initWithQuery('provider=p1&system=s2');

        expect(dataProductService.getPublicProducts).toHaveBeenCalledTimes(1);
        expect(dataProductService.getPublicProducts).toHaveBeenCalledWith(
          expect.objectContaining({ columnFilters: ['dataProviderId:p1'] }),
        );
      });

      it('mirrors filters, search and sort into the URL and omits defaults', async () => {
        await init();
        component['handleSearchChange']('foo');
        component['handleSortChange']('-productName');
        component['handleProviderChange']('p1');
        component['handleSystemChange']('s1');
        await fixture.whenStable();

        const path = TestBed.inject(Location).path();
        expect(path).toContain('provider=p1');
        expect(path).toContain('q=foo');
        expect(path).toContain('sort=-productName');
        expect(path).toContain('system=s1');

        component['handleSearchChange']('');
        component['handleSortChange']('productName');
        component['handleSystemChange'](null);
        component['handleProviderChange'](null);
        await fixture.whenStable();

        expect(TestBed.inject(Location).path()).not.toMatch(/[?&](q|sort|provider|system)=/);
      });
    });

    it('combines provider and system filters', async () => {
      await init();
      component['handleProviderChange']('p1');
      component['handleSystemChange']('s1');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(dataProductService.getPublicProducts).toHaveBeenLastCalledWith(
        expect.objectContaining({
          columnFilters: ['dataProviderId:p1', 'dataSourceSystemId:s1'],
        }),
      );
    });
  });
});
