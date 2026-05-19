import {
  Component,
  computed,
  inject,
  resource,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { faEye, faLayerGroup } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, PageResponseDto, ResourceQueryDto } from '@/entities/openapi';
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

/**
 * Shows a table with all available data products.
 *
 * CommentLastReviewed: 2026-05-13
 */
@Component({
  selector: 'app-data-products-page',
  imports: [
    AgridataTableComponent,
    FaIconComponent,
    I18nDirective,
    ErrorOutletComponent,
    DataProductDtoDirective,
  ],
  templateUrl: './data-products-page.component.html',
})
export class DataProductsPageComponent {
  private readonly dataProductService = inject(DataProductService);
  private readonly errorService = inject(ErrorHandlerService);
  protected readonly i18nService = inject(I18nService);

  protected readonly NAME_HEADER = 'dataProducts.table.name';
  protected readonly SYSTEM_HEADER = 'dataProducts.table.system';

  protected readonly faLayerGroup = faLayerGroup;
  protected readonly faEye = faEye;

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
          label: 'dataProducts.table.actions.viewDetails',
          icon: faEye,
          callback: async () => {},
        },
      ],
    };
  });

  readonly fetchDataProductsResource = resource({
    params: () => ({
      query: this.resourceQueryDto() ?? {},
      locale: this.i18nService.lang(),
    }),
    loader: ({ params }) => this.dataProductService.getAllDataProducts(params.query, params.locale),
    defaultValue: {} as PageResponseDto,
  });

  fetchDataProductsErrorHandler = createResourceErrorHandlerEffect(
    this.fetchDataProductsResource,
    this.errorService,
  );
}
