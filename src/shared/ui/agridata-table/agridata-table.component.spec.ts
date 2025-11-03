import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ResourceQueryDto } from '@/entities/openapi';
import { PageResponseDto } from '@/shared/lib/api.helper';
import { MockResources } from '@/shared/testing/mocks';

import { AgridataTableComponent } from './agridata-table.component';
import {
  CellRendererTypes,
  PAGE_SIZES,
  SortDirections,
  TableMetadata,
} from './agridata-table.model';

// Mock data interface for testing
interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
}

describe('AgridataTableComponent', () => {
  let component: AgridataTableComponent<TestUser>;
  let fixture: ComponentFixture<AgridataTableComponent<TestUser>>;
  let compiled: HTMLElement;

  // Test data
  const mockUsers: TestUser[] = [
    { id: '1', name: 'John Doe', email: 'john@test.com', age: 30 },
    { id: '2', name: 'Jane Smith', email: 'jane@test.com', age: 25 },
    { id: '3', name: 'Bob Wilson', email: 'bob@test.com', age: 35 },
  ];

  const mockPageData: PageResponseDto<TestUser> = {
    currentPage: 0,
    pageSize: PAGE_SIZES[0],
    totalPages: 2,
    totalItems: 15,
    items: mockUsers,
  };

  const mockTableMetadata: TableMetadata<TestUser> = {
    columns: [
      {
        name: 'name',
        sortable: true,
        initialSortDirection: undefined,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.name,
        },
      },
      {
        name: 'email',
        sortable: true,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.email,
        },
      },
      {
        name: 'age',
        sortable: false,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.age,
        },
      },
    ],
    idColumn: 'id',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataTableComponent<TestUser>);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;

    // Set required inputs
    fixture.componentRef.setInput('tableMetadata', mockTableMetadata);
    fixture.componentRef.setInput(
      'dataProvider',
      MockResources.createMockResourceRef(mockPageData),
    );
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component['nextPageIndex']()).toBe(0);
      expect(component['nextPageSize']()).toBe(PAGE_SIZES[0]);
      expect(component['searchTerm']()).toBe('');
      expect(component['hoveredRowId']()).toBeNull();
    });

    it('should compute page data from data provider', () => {
      fixture.detectChanges();
      const pageData = component['pageData']();

      expect(pageData.items.length).toBe(3);
      expect(pageData.currentPage).toBe(0);
      expect(pageData.totalPages).toBe(2);
      expect(pageData.totalItems).toBe(15);
    });

    it('should initialize header column sort model', () => {
      fixture.detectChanges();
      const sortModel = component['headerColumnSortModel']();

      expect(sortModel['name']).toBeDefined();
      expect(sortModel['email']).toBeDefined();
      expect(sortModel['age']).toBeDefined();
    });
  });

  describe('Table Rendering', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should render table with correct number of columns', () => {
      const headerCells = fixture.debugElement.queryAll(By.css('app-table-header-cell'));
      expect(headerCells.length).toBe(3);
    });

    it('should render correct number of data rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows.length).toBe(3);
    });

    it('should render table cells for each column', () => {
      const cells = fixture.debugElement.queryAll(By.css('app-table-cell'));
      expect(cells.length).toBe(9); // 3 rows × 3 columns
    });

    it('should display loading state when data is loading', () => {
      fixture.componentRef.setInput(
        'dataProvider',
        MockResources.createMockResourceRef(mockPageData, signal(true)),
      );
      fixture.detectChanges();

      const loadingElement = compiled.querySelector('[aria-label="table.loading"]');

      expect(loadingElement).toBeTruthy();
    });

    it('should display empty state when no data', () => {
      const emptyData = { ...mockPageData, items: [], totalItems: 0 };
      fixture.componentRef.setInput('dataProvider', MockResources.createMockResourceRef(emptyData));
      fixture.detectChanges();

      const emptyStateComponent = fixture.debugElement.query(By.css('app-empty-state'));
      expect(emptyStateComponent).toBeTruthy();

      const tableElement = fixture.debugElement.query(By.css('table'));
      expect(tableElement).toBeFalsy();
    });

    it('should render actions column when actions are provided', () => {
      const metadataWithActions = {
        ...mockTableMetadata,
        actions: () => [
          {
            label: 'Edit',
            onClick: () => {},
            icon: 'edit',
          },
        ],
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithActions);
      fixture.detectChanges();

      const actionCells = fixture.debugElement.queryAll(By.css('app-table-actions'));
      expect(actionCells.length).toBe(3);
    });

    it('should not render actions column when actions are not provided', () => {
      const actionCells = fixture.debugElement.queryAll(By.css('app-table-actions'));
      expect(actionCells.length).toBe(0);
    });
  });

  describe('Search Functionality', () => {
    it('should not render search input when enableSearch is false', () => {
      fixture.detectChanges();
      const searchInput = compiled.querySelector('app-search-input');
      expect(searchInput).toBeFalsy();
    });

    it('should render search input when enableSearch is true', () => {
      fixture.componentRef.setInput('enableSearch', true);
      fixture.detectChanges();

      const searchInput = compiled.querySelector('app-search-input');
      expect(searchInput).toBeTruthy();
    });

    it('should update search term when handleSearchInput is called', () => {
      component['handleSearchInput']('test search');
      expect(component['searchTerm']()).toBe('test search');
    });

    it('should emit query param change with search term', (done) => {
      fixture.componentRef.setInput('enableSearch', true);
      fixture.detectChanges();

      const subscription = component.queryParameters.subscribe(
        (params: ResourceQueryDto | undefined) => {
          if (params?.searchTerm === 'john') {
            expect(params.searchTerm).toBe('john');
            subscription.unsubscribe();
            done();
          }
        },
      );

      component['handleSearchInput']('john');
    });
  });

  describe('Sorting Functionality', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should update sort direction for a column', () => {
      const nameColumn = mockTableMetadata.columns[0];
      component['setSingleColumnSort'](nameColumn, SortDirections.ASC);

      const sortModel = component['headerColumnSortModel']();
      expect(sortModel['name']()).toBe(SortDirections.ASC);
    });

    it('should reset other columns when setting sort on one column', () => {
      const sortModel = component['headerColumnSortModel']();

      // Set initial sorts
      sortModel['name'].set(SortDirections.ASC);
      sortModel['email'].set(SortDirections.DESC);

      // Change name column sort
      const nameColumn = mockTableMetadata.columns[0];
      component['setSingleColumnSort'](nameColumn, SortDirections.DESC);

      expect(sortModel['name']()).toBe(SortDirections.DESC);
      expect(sortModel['email']()).toBeUndefined();
    });

    it('should clear sort when direction is undefined', () => {
      const nameColumn = mockTableMetadata.columns[0];
      component['setSingleColumnSort'](nameColumn, SortDirections.ASC);
      component['setSingleColumnSort'](nameColumn, undefined);

      const sortModel = component['headerColumnSortModel']();
      expect(sortModel['name']()).toBeUndefined();
    });

    it('should build sort parameters correctly for ascending', () => {
      const nameColumn = mockTableMetadata.columns[0];
      component['setSingleColumnSort'](nameColumn, SortDirections.ASC);

      const sortParams = component['buildSortParameters']();
      expect(sortParams).toEqual(['name']);
    });

    it('should build sort parameters correctly for descending', () => {
      const nameColumn = mockTableMetadata.columns[0];
      component['setSingleColumnSort'](nameColumn, SortDirections.DESC);

      const sortParams = component['buildSortParameters']();
      expect(sortParams).toEqual(['-name']);
    });

    it('should use sortField if provided', () => {
      const customMetadata: TableMetadata<TestUser> = {
        ...mockTableMetadata,
        columns: [
          {
            name: 'displayName',
            sortable: true,
            renderer: {
              type: CellRendererTypes.FUNCTION,
              cellRenderFn: (row) => row.name,
            },
            sortField: 'name',
          },
        ],
      };

      fixture.componentRef.setInput('tableMetadata', customMetadata);
      fixture.detectChanges();

      const column = customMetadata.columns[0];
      component['setSingleColumnSort'](column, SortDirections.ASC);

      const sortParams = component['buildSortParameters']();
      expect(sortParams).toEqual(['name']);
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should show pagination when total pages > 1', () => {
      const pagination = compiled.querySelector('app-table-pagination');
      expect(pagination).toBeTruthy();
    });

    it('should show pagination when totalItems > first page size', () => {
      const singlePageData = {
        ...mockPageData,
        totalPages: 1,
        totalItems: PAGE_SIZES[0] + 1,
      };

      fixture.componentRef.setInput(
        'dataProvider',
        MockResources.createMockResourceRef(singlePageData),
      );
      fixture.detectChanges();

      expect(component['shouldShowPagination']()).toBe(true);
    });

    it('should not show pagination for small datasets', () => {
      const smallData = {
        ...mockPageData,
        totalPages: 1,
        totalItems: 5,
      };

      fixture.componentRef.setInput('dataProvider', MockResources.createMockResourceRef(smallData));
      fixture.detectChanges();

      expect(component['shouldShowPagination']()).toBe(false);
    });

    it('should update page index when nextPageIndex changes', (done) => {
      const subscription = component.queryParameters.subscribe(
        (params: ResourceQueryDto | undefined) => {
          if (params?.page === 2) {
            expect(params.page).toBe(2);
            subscription.unsubscribe();
            done();
          }
        },
      );

      component['nextPageIndex'].set(2);
    });

    it('should update page size when nextPageSize changes', (done) => {
      const subscription = component.queryParameters.subscribe(
        (params: ResourceQueryDto | undefined) => {
          if (params?.size === PAGE_SIZES[1]) {
            expect(params.size).toBe(PAGE_SIZES[1]);
            subscription.unsubscribe();
            done();
          }
        },
      );

      component['nextPageSize'].set(PAGE_SIZES[1]);
    });
  });

  describe('Row Interactions', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should call rowAction when row is clicked', () => {
      const rowActionSpy = jest.fn();
      const metadataWithAction = {
        ...mockTableMetadata,
        rowAction: rowActionSpy,
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithAction);
      fixture.detectChanges();

      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      firstRow.nativeElement.click();

      expect(rowActionSpy).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should call rowAction on Enter key press', () => {
      const rowActionSpy = jest.fn();
      const metadataWithAction = {
        ...mockTableMetadata,
        rowAction: rowActionSpy,
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithAction);
      fixture.detectChanges();

      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      firstRow.nativeElement.dispatchEvent(enterEvent);

      expect(rowActionSpy).toHaveBeenCalledWith(mockUsers[0]);
    });

    it('should set hovered row ID on mouse enter', () => {
      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      firstRow.nativeElement.dispatchEvent(new Event('mouseenter'));

      expect(component['hoveredRowId']()).toBe('1');
    });

    it('should clear hovered row ID on mouse leave', () => {
      component['hoveredRowId'].set('1');

      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      firstRow.nativeElement.dispatchEvent(new Event('mouseleave'));

      expect(component['hoveredRowId']()).toBeNull();
    });

    it('should get correct row ID using idColumn', () => {
      const rowId = component['getRowId'](mockUsers[0]);
      expect(rowId).toBe('1');
    });

    it('should highlight row when highlightFn returns true', () => {
      const metadataWithHighlight = {
        ...mockTableMetadata,
        highlightFn: (row: TestUser) => row.id === '2',
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithHighlight);
      fixture.detectChanges();

      expect(component['isRowHighlighted'](mockUsers[0])).toBe(false);
      expect(component['isRowHighlighted'](mockUsers[1])).toBe(true);
    });

    it('should apply highlight CSS class to highlighted rows', () => {
      const metadataWithHighlight = {
        ...mockTableMetadata,
        highlightFn: (row: TestUser) => row.id === '2',
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithHighlight);
      fixture.detectChanges();

      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      expect(rows[1].nativeElement.classList.contains('bg-sky-50')).toBe(true);
    });
  });

  describe('Query Parameter Changes', () => {
    it('should emit query params on component initialization', (done) => {
      const subscription = component.queryParameters.subscribe(
        (params: ResourceQueryDto | undefined) => {
          if (params) {
            expect(params.page).toBe(0);
            expect(params.size).toBe(PAGE_SIZES[0]);
            expect(params.searchTerm).toBe('');
            expect(params.sortParams).toEqual([]);
            subscription.unsubscribe();
            done();
          }
        },
      );

      fixture.detectChanges();
    });

    it('should emit updated query params when multiple values change', (done) => {
      fixture.detectChanges();

      const subscription = component.queryParameters.subscribe(
        (params: ResourceQueryDto | undefined) => {
          if (params?.page === 1 && params?.searchTerm === 'test') {
            expect(params.page).toBe(1);
            expect(params.searchTerm).toBe('test');
            subscription.unsubscribe();
            done();
          }
        },
      );

      component['nextPageIndex'].set(1);
      component['handleSearchInput']('test');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should have tabindex on rows for keyboard navigation', () => {
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      rows.forEach((row) => {
        expect(row.nativeElement.getAttribute('tabindex')).toBe('0');
      });
    });

    it('should have role="button" on rows', () => {
      const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
      rows.forEach((row) => {
        expect(row.nativeElement.getAttribute('role')).toBe('button');
      });
    });

    it('should set aria-selected on highlighted rows', () => {
      const metadataWithHighlight = {
        ...mockTableMetadata,
        highlightFn: (row: TestUser) => row.id === '1',
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithHighlight);
      fixture.detectChanges();

      const firstRow = fixture.debugElement.query(By.css('tbody tr'));
      expect(firstRow.nativeElement.getAttribute('aria-selected')).toBe('true');
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined data provider gracefully', () => {
      fixture.componentRef.setInput('dataProvider', MockResources.createMockResourceRef(undefined));
      fixture.detectChanges();

      const pageData = component['pageData']();
      expect(pageData.items).toEqual([]);
      expect(pageData.totalItems).toBe(0);
    });

    it('should handle missing rowAction gracefully', () => {
      component['handleRowClick'](mockUsers[0]);
      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle missing highlightFn gracefully', () => {
      const isHighlighted = component['isRowHighlighted'](mockUsers[0]);
      expect(isHighlighted).toBe(false);
    });

    it('should handle empty actions array', () => {
      const metadataWithEmptyActions = {
        ...mockTableMetadata,
        actions: () => [],
      };

      fixture.componentRef.setInput('tableMetadata', metadataWithEmptyActions);
      fixture.detectChanges();

      const actions = component['getRowActions'](mockUsers[0]);
      expect(actions).toEqual([]);
    });

    it('should handle missing actions function', () => {
      const actions = component['getRowActions'](mockUsers[0]);
      expect(actions).toEqual([]);
    });
  });
});
