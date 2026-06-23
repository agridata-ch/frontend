import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ErrorHandlerService } from '@/app/error/error-handler.service';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { DataProductService } from '@/entities/api/data-product.service';
import { DataProductDto, ResourceQueryDto } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { PageResponseDto } from '@/shared/lib/api.helper';
import {
  createMockAgridataStateService,
  createMockDataProductService,
  createMockErrorHandlerService,
  createMockI18nService,
  MockDataProductService,
  MockErrorHandlerService,
  MockI18nService,
} from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';
import { CellRendererTypes } from '@/shared/ui/agridata-table';

import { DataProductsPageComponent } from './data-products-page.component';

describe('DataProductsPageComponent - component behavior', () => {
  let fixture: ComponentFixture<DataProductsPageComponent>;
  let component: DataProductsPageComponent;
  let dataProductService: MockDataProductService;
  let errorService: MockErrorHandlerService;
  let i18nService: MockI18nService;

  beforeEach(async () => {
    dataProductService = createMockDataProductService();
    errorService = createMockErrorHandlerService();
    i18nService = createMockI18nService();

    await TestBed.configureTestingModule({
      imports: [DataProductsPageComponent, createTranslocoTestingModule()],
      providers: [
        { provide: AgridataStateService, useValue: createMockAgridataStateService() },
        { provide: DataProductService, useValue: dataProductService },
        { provide: ErrorHandlerService, useValue: errorService },
        { provide: I18nService, useValue: i18nService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataProductsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('creation', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('resource loading', () => {
    it('should load data products on init', async () => {
      const mockProduct: DataProductDto = {
        id: 'product-1',
        stateCode: 'DRAFT',
        name: { de: 'Test Product', fr: 'Produit Test' },
        description: { de: 'A test product' },
        dataSourceSystem: {
          id: 'system-1',
          dataProvider: { id: 'provider-1' },
          name: { de: 'System A' },
        },
      };
      const mockResponse: PageResponseDto<DataProductDto> = {
        items: [mockProduct],
        totalItems: 1,
        totalPages: 1,
        currentPage: 0,
        pageSize: 10,
      };

      dataProductService.getAllDataProducts.mockResolvedValueOnce(mockResponse);

      const testFixture = TestBed.createComponent(DataProductsPageComponent);
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(dataProductService.getAllDataProducts).toHaveBeenCalledWith({}, 'de', undefined);
    });

    it('should pass locale from i18nService to getAllDataProducts', async () => {
      dataProductService.getAllDataProducts.mockResolvedValueOnce({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
      } as PageResponseDto<DataProductDto>);

      const testFixture = TestBed.createComponent(DataProductsPageComponent);
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(dataProductService.getAllDataProducts).toHaveBeenCalledWith(
        expect.any(Object),
        'de',
        undefined,
      );
    });

    it('should pass resourceQueryDto params to getAllDataProducts', async () => {
      dataProductService.getAllDataProducts.mockResolvedValueOnce({
        items: [],
        totalItems: 0,
        totalPages: 0,
        currentPage: 0,
        pageSize: 10,
      } as PageResponseDto<DataProductDto>);

      const testFixture = TestBed.createComponent(DataProductsPageComponent);
      const testComponent = testFixture.componentInstance;

      const queryParams: ResourceQueryDto = {
        page: 1,
        size: 5,
        searchTerm: 'test',
        sortParams: ['productName,desc'],
      };

      testComponent['resourceQueryDto'].set(queryParams);
      testFixture.detectChanges();
      await testFixture.whenStable();

      expect(dataProductService.getAllDataProducts).toHaveBeenCalledWith(
        queryParams,
        'de',
        undefined,
      );
    });
  });

  describe('table metadata computed signal', () => {
    it('should include two columns in table metadata', () => {
      const metadata = component['dataProductsTableMetaData']();
      expect(metadata.columns.length).toBe(3);
    });

    it('should configure the name column with template renderer', () => {
      const metadata = component['dataProductsTableMetaData']();
      const nameColumn = metadata.columns[0];

      expect(nameColumn.name).toBe('data-products.table.name');
      expect(nameColumn.sortable).toBe(true);
      expect(nameColumn.sortField).toBe('productName');
      expect(nameColumn.renderer.type).toBe(CellRendererTypes.TEMPLATE);
    });

    it('should configure the system column with function renderer', () => {
      const metadata = component['dataProductsTableMetaData']();
      const systemColumn = metadata.columns[1];

      expect(systemColumn.name).toBe('data-products.table.system');
      expect(systemColumn.sortable).toBe(true);
      expect(systemColumn.sortField).toBe('systemName');
      expect(systemColumn.renderer.type).toBe(CellRendererTypes.FUNCTION);
    });

    it('should use FUNCTION renderer on system column to call i18nService.useObjectTranslation', () => {
      const metadata = component['dataProductsTableMetaData']();
      const systemColumn = metadata.columns[1];

      const mockProduct: DataProductDto = {
        id: 'product-1',
        stateCode: 'DRAFT',
        dataSourceSystem: {
          id: 'system-1',
          dataProvider: { id: 'provider-1' },
          name: { de: 'System A', fr: 'Système A' },
        },
      };

      if (systemColumn.renderer.type === CellRendererTypes.FUNCTION) {
        systemColumn.renderer.cellRenderFn(mockProduct);
        expect(i18nService.useObjectTranslation).toHaveBeenCalledWith(
          mockProduct.dataSourceSystem?.name,
        );
      }
    });

    it('should configure row menu actions with one viewDetails action', () => {
      const metadata = component['dataProductsTableMetaData']();
      const actions = metadata.rowMenuActions?.();

      expect(actions).toBeDefined();
      expect(actions?.length).toBe(1);
      expect(actions?.[0].label).toBe('data-products.table.actions.viewDetails');
    });
  });
});
