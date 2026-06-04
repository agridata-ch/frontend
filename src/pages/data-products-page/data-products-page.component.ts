import {
  Component,
  computed,
  effect,
  inject,
  resource,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { faEye, faLayerGroup, faPlus } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, PageResponseDto, ResourceQueryDto } from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import { DataProductDtoDirective } from '@/shared/data-product';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import {
  DATA_PRODUCT_NEW_ID,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
} from '@/widgets/data-product-detail-form/data-product-detail-form.model';

/**
 * Shows a table with all available data products.
 *
 * CommentLastReviewed: 2026-05-13
 */
@Component({
  selector: 'app-data-products-page',
  imports: [
    AgridataTableComponent,
    ButtonComponent,
    DataProductDtoDirective,
    ErrorOutletComponent,
    FaIconComponent,
    I18nDirective,
    RouterOutlet,
  ],
  templateUrl: './data-products-page.component.html',
})
export class DataProductsPageComponent {
  private readonly dataProductService = inject(DataProductService);
  private readonly errorService = inject(ErrorHandlerService);
  private readonly router = inject(Router);
  private readonly stateService = inject(AgridataStateService);
  protected readonly i18nService = inject(I18nService);

  protected readonly ButtonVariants = ButtonVariants;
  protected readonly NAME_HEADER = 'data-products.table.name';
  protected readonly SYSTEM_HEADER = 'data-products.table.system';
  protected readonly buttonIcon = faPlus;

  protected readonly faEye = faEye;
  protected readonly faLayerGroup = faLayerGroup;

  private readonly nameTemplate =
    viewChild<TemplateRef<{ $implicit: DataProductDto }>>('nameTemplate');

  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);

  protected readonly dataProductsTableMetaData = computed<TableMetadata<DataProductDto>>(() => {
    return {
      idColumn: 'id',
      columns: [
        {
          name: this.NAME_HEADER,
          sortable: true,
          sortField: 'productName' as keyof DataProductDto,
          initialSortDirection: SortDirections.ASC,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.nameTemplate(),
          },
        },
        {
          name: this.SYSTEM_HEADER,
          sortable: true,
          sortField: 'systemName' as keyof DataProductDto,
          renderer: {
            type: CellRendererTypes.FUNCTION,
            cellRenderFn: (row) =>
              this.i18nService.useObjectTranslation(row.dataSourceSystem?.name),
          },
        },
      ],
      rowMenuActions: () => [
        {
          label: 'data-products.table.actions.viewDetails',
          icon: faEye,
          callback: async () => {},
        },
      ],
    };
  });

  readonly fetchDataProductsResource = resource({
    params: () => ({
      actingRole: this.stateService.actingRole(),
      locale: this.i18nService.lang(),
      query: this.resourceQueryDto() ?? {},
    }),
    loader: ({ params }) =>
      this.dataProductService.getAllDataProducts(params.query, params.locale, params.actingRole),
    defaultValue: {} as PageResponseDto,
  });

  fetchDataProductsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchDataProductsResource,
    this.errorService,
  );

  private readonly reloadDataProductsEffect = effect(() => {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.[FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]) {
      this.fetchDataProductsResource.reload();
    }
  });

  protected newProduct(): void {
    this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH, DATA_PRODUCT_NEW_ID]);
  }
}
