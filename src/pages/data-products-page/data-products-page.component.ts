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
import {
  faEye,
  faLayerGroup,
  faPlus,
  faTrashCan,
} from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import {
  DataProductDto,
  DataProductDtoStateCode,
  PageResponseDto,
  ResourceQueryDto,
} from '@/entities/openapi';
import { ROUTE_PATHS } from '@/shared/constants/constants';
import {
  DataProductDtoDirective,
  getBadgeVariant,
  getDataProductState,
  getStatusTranslation,
} from '@/shared/data-product';
import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { ErrorOutletComponent } from '@/shared/error-alert-outlet/error-outlet.component';
import { I18nDirective, I18nService } from '@/shared/i18n';
import { createResourceErrorHandlerEffect } from '@/shared/lib/api.helper';
import {
  ActionDTO,
  AgridataTableComponent,
  CellRendererTypes,
  SortDirections,
  TableMetadata,
} from '@/shared/ui/agridata-table';
import { AgridataBadgeComponent, BadgeSize } from '@/shared/ui/badge';
import { ButtonComponent, ButtonVariants } from '@/shared/ui/button';
import {
  DATA_PRODUCT_NEW_ID,
  FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM,
} from '@/widgets/data-product-detail-form';

import { DataProductsDeleteModalComponent } from './data-products-delete-modal';

/**
 * Shows a table with all available data products.
 *
 * CommentLastReviewed: 2026-07-30
 */
@Component({
  selector: 'app-data-products-page',
  imports: [
    AgridataBadgeComponent,
    AgridataTableComponent,
    ButtonComponent,
    DataProductDtoDirective,
    DataProductsDeleteModalComponent,
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
  protected readonly STATE_CODE_HEADER = 'data-products.table.stateCode';
  protected readonly buttonIcon = faPlus;

  protected readonly BadgeSize = BadgeSize;
  protected readonly faEye = faEye;
  protected readonly faLayerGroup = faLayerGroup;
  protected readonly faTrashCan = faTrashCan;
  protected readonly getBadgeVariant = getBadgeVariant;
  protected readonly getDataProductState = getDataProductState;
  protected readonly getStatusTranslation = getStatusTranslation;

  private readonly nameTemplate =
    viewChild<TemplateRef<{ $implicit: DataProductDto }>>('nameTemplate');
  private readonly stateCodeTemplate =
    viewChild<TemplateRef<{ $implicit: DataProductDto }>>('stateCodeTemplate');

  readonly resourceQueryDto = signal<ResourceQueryDto | undefined>(undefined);
  protected readonly productToDelete = signal<DataProductDto | null>(null);

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
        {
          name: this.STATE_CODE_HEADER,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: this.stateCodeTemplate(),
          },
          cellCssClasses: 'whitespace-nowrap',
          sortable: false,
          sortValueFn: (item: DataProductDto) =>
            item ? this.getStatusTranslation(this.getDataProductState(item), this.i18nService) : '',
        },
      ],
      rowMenuActions: this.getRowMenuActions,
      rowAction: (row) => {
        this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH, row.id]);
      },
    };
  });

  readonly fetchDataProductsResource = resource({
    params: () => ({
      actingRole: this.stateService.actingRole(),
      query: this.resourceQueryDto() ?? {},
    }),
    loader: ({ params }) =>
      this.dataProductService.getAllDataProducts(params.query, params.actingRole),
    defaultValue: {} as PageResponseDto,
  });

  protected fetchDataProductsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchDataProductsResource,
    this.errorService,
  );

  readonly getRowMenuActions = (row?: DataProductDto): ActionDTO[] => {
    if (!row) return [];

    const viewDetails: ActionDTO = {
      label: 'data-products.table.actions.viewDetails',
      icon: this.faEye,
      callback: async () => {
        if (!row.id) return;
        this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH, row.id]);
      },
    };
    const deleteAction: ActionDTO = {
      label: 'data-products.table.actions.delete',
      icon: this.faTrashCan,
      callback: async () => {
        this.productToDelete.set(row);
      },
    };

    if (row.stateCode === DataProductDtoStateCode.Draft) {
      return [viewDetails, deleteAction];
    }

    return [viewDetails];
  };

  protected newProduct(): void {
    this.router.navigate([ROUTE_PATHS.DATA_PRODUCTS_PATH, DATA_PRODUCT_NEW_ID]);
  }

  private readonly reloadDataProductsEffect = effect(() => {
    const nav = this.router.currentNavigation();
    if (nav?.extras?.state?.[FORCE_RELOAD_DATA_PRODUCTS_STATE_PARAM]) {
      this.fetchDataProductsResource.reload();
    }
  });
}
