import { Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { DataProductService } from '@/entities/api';
import { MasterDataService } from '@/entities/api/master-data.service';
import { DataProviderDto, DataSourceSystemDto, PublicDataProductDto } from '@/entities/openapi';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { InfiniteScrollComponent } from '@/shared/infinite-scroll';
import {
  AgridataSelectComponent,
  SelectOption,
  SelectOptionGroup,
} from '@/shared/ui/agridata-select';
import { CardComponent } from '@/shared/ui/card';
import { EmptyStateComponent } from '@/shared/ui/empty-state';
import { SearchInputComponent } from '@/shared/ui/search-input/search-input.component';

import { DataProductCardComponent } from './data-product-card';
import { PublicDataProductDetailComponent } from './public-data-product-detail';

type SelectValue = string | number | null;

/**
 * Displays the public data catalog as a responsive grid of product cards. The first page is fetched on
 * init; further pages are appended as the user scrolls to the bottom.
 *
 * CommentLastReviewed: 2026-08-27
 */
@Component({
  selector: 'app-data-catalog-block',
  imports: [
    AgridataSelectComponent,
    CardComponent,
    DataProductCardComponent,
    EmptyStateComponent,
    I18nDirective,
    InfiniteScrollComponent,
    PublicDataProductDetailComponent,
    SearchInputComponent,
  ],
  templateUrl: './data-catalog-block.component.html',
})
export class DataCatalogBlockComponent {
  // Injects
  private readonly dataProductService = inject(DataProductService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly i18nService = inject(I18nService);
  private readonly location = inject(Location);
  private readonly masterDataService = inject(MasterDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  // Constants
  private readonly PAGE_SIZE = 10;

  // Signals
  protected readonly products = signal<PublicDataProductDto[]>([]);
  protected readonly loading = signal(false);
  protected readonly loaded = signal(false);
  protected readonly totalItems = signal(0);
  protected readonly sortBy = signal<string>('productName');
  protected readonly search = signal('');
  protected readonly error = signal<unknown>(undefined);
  private readonly page = signal(0);
  protected readonly totalPages = signal(1);
  protected readonly searching = signal(false);
  private requestId = 0;

  // Filter state (public data catalog). Systems are grouped by provider; selecting a provider
  // narrows the system list. `null` selection means "all".
  protected readonly selectedProviderId = signal<string | null>(null);
  protected readonly selectedSystemId = signal<string | null>(null);
  private readonly providers = signal<DataProviderDto[]>([]);
  private readonly systems = signal<DataSourceSystemDto[]>([]);

  // The product whose detail modal is open. Owned locally so opening never triggers a router
  // navigation (which would scroll the page to top); the URL is mirrored separately via replaceState.
  // Seeded from the `:productId` child route param so a direct deeplink to `cms/:slug/:id` opens it.
  protected readonly selectedProductId = signal<string | undefined>(
    this.route.firstChild?.snapshot.paramMap.get('productId') ?? undefined,
  );

  // Computed Signals
  protected readonly hasMore = computed(() => this.page() < this.totalPages());
  // The count + sort header hides only while a search term change is loading (the shown count would
  // be stale), then reappears with the fresh count. A sort change keeps it visible throughout.
  protected readonly showListHeader = computed(() => this.totalItems() > 0 && !this.searching());
  protected readonly skeletons = computed(() => {
    const total = this.totalItems();
    const loaded = this.products().length;
    let count: number;

    if (loaded === 0) {
      count = total > 0 ? Math.min(total, this.PAGE_SIZE) : this.PAGE_SIZE;
    } else {
      count = Math.min(total - loaded, this.PAGE_SIZE);
    }

    return Array.from({ length: Math.max(count, 0) });
  });
  protected readonly sortOptions = computed<SelectOption[]>(() => [
    { value: 'productName', label: this.i18nService.translate('data-catalog.sort.nameAsc') },
    { value: '-productName', label: this.i18nService.translate('data-catalog.sort.nameDesc') },
    { value: 'systemName', label: this.i18nService.translate('data-catalog.sort.systemAsc') },
    {
      value: '-systemName',
      label: this.i18nService.translate('data-catalog.sort.systemDesc'),
    },
    {
      value: 'providerName',
      label: this.i18nService.translate('data-catalog.sort.providerAsc'),
    },
    {
      value: '-providerName',
      label: this.i18nService.translate('data-catalog.sort.providerDesc'),
    },
  ]);
  protected readonly providerOptions = computed<SelectOption[]>(() => {
    const options = this.providers()
      .map((provider) => ({
        value: provider.id,
        label: this.i18nService.useObjectTranslation(provider.name),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [
      { value: null, label: this.i18nService.translate('data-catalog.filter.provider.all') },
      ...options,
    ];
  });
  // Flat system options: always the "all" entry, plus the selected provider's systems (flat, no
  // group header) once a provider is chosen. Grouped systems are shown via systemGroups instead.
  protected readonly systemFlatOptions = computed<SelectOption[]>(() => {
    const all: SelectOption = {
      value: null,
      label: this.i18nService.translate('data-catalog.filter.system.all'),
    };
    const selectedProvider = this.selectedProviderId();
    if (!selectedProvider) return [all];

    const systems = [...this.systems()]
      .filter((system) => system.dataProvider.id === selectedProvider)
      .sort((a, b) =>
        this.i18nService
          .useObjectTranslation(a.name)
          .localeCompare(this.i18nService.useObjectTranslation(b.name)),
      )
      .map((system) => ({
        value: system.id,
        label: this.i18nService.useObjectTranslation(system.name),
      }));
    return [all, ...systems];
  });
  // Systems grouped by provider (provider name = group header), shown only while no provider is
  // selected. Once a provider is selected the header is redundant, so systems render flat instead.
  protected readonly systemGroups = computed<SelectOptionGroup[]>(() => {
    if (this.selectedProviderId()) return [];

    const sorted = [...this.systems()].sort((a, b) =>
      this.i18nService
        .useObjectTranslation(a.name)
        .localeCompare(this.i18nService.useObjectTranslation(b.name)),
    );
    const groups = new Map<string, SelectOptionGroup>();
    for (const system of sorted) {
      const provider = system.dataProvider;
      let group = groups.get(provider.id);
      if (!group) {
        group = { label: this.i18nService.useObjectTranslation(provider.name), options: [] };
        groups.set(provider.id, group);
      }
      group.options.push({
        value: system.id,
        label: this.i18nService.useObjectTranslation(system.name),
      });
    }
    return [...groups.values()];
  });
  private readonly columnFilters = computed<string[] | undefined>(() => {
    const filters: string[] = [];
    const providerId = this.selectedProviderId();
    const systemId = this.selectedSystemId();
    if (providerId) filters.push(`dataProviderId:${providerId}`);
    if (systemId) filters.push(`dataSourceSystemId:${systemId}`);
    return filters.length > 0 ? filters : undefined;
  });

  // Effects
  private readonly _init = afterNextRender(() => {
    void this.loadNext();
    void this.loadFilterOptions();
  });

  protected handleCloseDetail(): void {
    this.selectedProductId.set(undefined);
    this.replacePath(['.']);
  }

  protected handleProviderChange(value: SelectValue): void {
    const providerId = typeof value === 'string' ? value : null;
    if (providerId === this.selectedProviderId()) return;

    this.selectedProviderId.set(providerId);
    this.selectedSystemId.set(null);
    void this.reload(false);
  }

  protected handleSearchChange(term: string): void {
    if (term === this.search()) return;

    this.search.set(term);
    void this.reload(true);
  }

  protected handleSortChange(value: SelectValue): void {
    if (typeof value !== 'string' || value === this.sortBy()) return;

    this.sortBy.set(value);
    void this.reload(false);
  }

  protected handleSystemChange(value: SelectValue): void {
    const systemId = typeof value === 'string' ? value : null;
    if (systemId === this.selectedSystemId()) return;

    this.selectedSystemId.set(systemId);
    void this.reload(false);
  }

  protected async loadNext(): Promise<void> {
    if (this.loading() || !this.hasMore() || this.error()) return;

    await this.load();
  }

  protected openDetail(id: string): void {
    this.selectedProductId.set(id);
    this.replacePath([id]);
  }

  // Mirrors the open product into the address bar (cms/<slug>/<id>) without navigating, so the URL is
  // shareable/deeplinkable but no router navigation fires (which would scroll the page to top).
  private replacePath(commands: string[]): void {
    this.location.replaceState(
      this.router.serializeUrl(this.router.createUrlTree(commands, { relativeTo: this.route })),
    );
  }

  // Fetches the current page and appends it. A per-request id guards against stale responses:
  // a reset (sort/search) or newer page supersedes any in-flight request, whose result is dropped.
  private async load(): Promise<void> {
    const requestId = ++this.requestId;
    this.loading.set(true);
    try {
      const response = await this.dataProductService.getPublicProducts({
        page: this.page(),
        size: this.PAGE_SIZE,
        sortParams: [this.sortBy()],
        searchTerm: this.search() || undefined,
        columnFilters: this.columnFilters(),
      });
      if (requestId !== this.requestId) return;

      this.products.update((current) => [...current, ...response.items]);
      this.totalPages.set(response.totalPages);
      this.totalItems.set(response.totalItems);
      this.page.update((current) => current + 1);
    } catch (error: unknown) {
      if (requestId !== this.requestId) return;
      if (error instanceof Error || error instanceof HttpErrorResponse) {
        this.errorService.handleError(error);
      }
      this.error.set(error);
    } finally {
      if (requestId === this.requestId) {
        this.loading.set(false);
        this.loaded.set(true);
        this.searching.set(false);
      }
    }
  }

  // Loads the provider and system lists that back the filter dropdowns. Both are public, unfiltered
  // lists; systems are grouped/filtered by provider client-side via their `dataProvider` reference.
  private async loadFilterOptions(): Promise<void> {
    try {
      const [providers, systems] = await Promise.all([
        this.masterDataService.getPublicDataProviders(),
        this.masterDataService.getPublicDataSourceSystems(),
      ]);
      this.providers.set(providers);
      this.systems.set(systems);
    } catch (error: unknown) {
      if (error instanceof Error || error instanceof HttpErrorResponse) {
        this.errorService.handleError(error);
      }
    }
  }

  // Resets paging and reloads from the first page. `fromSearch` marks a search term change so the
  // list header hides until fresh results arrive; a sort change (false) keeps the header visible.
  private reload(fromSearch: boolean): Promise<void> {
    this.searching.set(fromSearch);
    this.page.set(0);
    this.totalPages.set(1);
    this.products.set([]);
    this.error.set(undefined);
    return this.load();
  }
}
