import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DataProductService } from '@/entities/api/data-product.service';
import { PublicDataProductDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nService } from '@/shared/i18n';
import {
  createMockDataProductService,
  createMockErrorHandlerService,
  createMockI18nService,
  MockDataProductService,
  MockErrorHandlerService,
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

const product = (id: string): PublicDataProductDto => ({
  id,
  stateCode: 'ACTIVE' as PublicDataProductDto['stateCode'],
  consentRequired: false,
  name: { de: `Produkt ${id}` },
});

describe('DataCatalogBlockComponent', () => {
  let component: DataCatalogBlockComponent;
  let fixture: ComponentFixture<DataCatalogBlockComponent>;
  let dataProductService: MockDataProductService;
  let errorService: MockErrorHandlerService;
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

    await TestBed.configureTestingModule({
      imports: [DataCatalogBlockComponent],
      providers: [
        { provide: DataProductService, useValue: dataProductService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: createMockI18nService() },
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
      items: PublicDataProductDto[];
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
    dataProductService.getPublicProductById.mockResolvedValue(product('x'));

    await init();
    fixture.nativeElement.querySelector('app-data-product-card button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(dataProductService.getPublicProductById).toHaveBeenCalledWith('x');
    expect(fixture.nativeElement.querySelector('app-modal > div')).not.toBeNull();
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
    dataProductService.getPublicProductById.mockResolvedValue(product('x'));

    await init();
    fixture.nativeElement.querySelector('app-data-product-card button')?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    fixture.nativeElement
      .querySelector('[data-testid="public-data-product-detail-modal-close"]')
      ?.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-modal > div')).toBeNull();
    expect(TestBed.inject(Location).path()).not.toContain('x');
  });
});
