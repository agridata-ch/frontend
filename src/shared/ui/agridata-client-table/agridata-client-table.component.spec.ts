import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { getTranslocoModule } from '@/app/transloco-testing.module';
import { MockResources } from '@/shared/testing/mocks';
import { AgridataTableComponent, CellRendererTypes } from '@/shared/ui/agridata-table';

import { AgridataClientTableComponent } from './agridata-client-table.component';
import { ClientTableMetadata } from './client-table-model';

// Mock data interface for tests
interface TestUser {
  id: string;
  name: string;
  email: string;
  age: number;
  date: string;
}

describe('AgridataClientTableComponent', () => {
  let component: AgridataClientTableComponent<TestUser>;
  let fixture: ComponentFixture<AgridataClientTableComponent<TestUser>>;

  // Test data
  const mockUsers: TestUser[] = [
    { id: '1', name: 'John Doe', email: 'john@test.com', age: 30, date: '2023-05-15' },
    { id: '2', name: 'Jane Smithers', email: 'jane@test.com', age: 25, date: '2023-06-20' },
    { id: '3', name: 'Bob Wilson', email: 'bob@test.com', age: 35, date: '2023-04-10' },
  ];

  const mockTableMetadata: ClientTableMetadata<TestUser> = {
    columns: [
      {
        name: 'name',
        sortable: true,
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
        sortable: true,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.age,
        },
      },
      {
        name: 'date',
        sortable: true,
        renderer: {
          type: CellRendererTypes.FUNCTION,
          cellRenderFn: (row) => row.date,
        },
      },
    ],
    idColumn: 'id',
    searchFn: (data, term) =>
      data.filter(
        (item) =>
          item.name.toLowerCase().includes(term.toLowerCase()) ||
          item.email.toLowerCase().includes(term.toLowerCase()),
      ),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AgridataClientTableComponent,
        AgridataTableComponent,
        getTranslocoModule({
          langs: {
            de: {},
          },
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataClientTableComponent<TestUser>);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('rawData', mockUsers);
    fixture.componentRef.setInput('tableMetadata', mockTableMetadata);
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should be initialized with default values', () => {
      expect(component.pageSize()).toBe(10);
      expect(component.enableSearch()).toBe(false);
      expect(component.resourceQueryDto()).toBeUndefined();
    });

    it('should process all data on first load', () => {
      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(3);
      expect(mockResourceRef.value().totalItems).toBe(3);
    });
  });

  describe('Data Processing', () => {
    beforeEach(() => {
      fixture.detectChanges();
    });

    it('should paginate data correctly', () => {
      fixture.componentRef.setInput('pageSize', 2);
      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(2);
      expect(mockResourceRef.value().totalPages).toBe(2);
    });

    it('should search data by text', () => {
      component.resourceQueryDto.set({
        searchTerm: 'John',
        page: 0,
        size: 10,
        sortParams: [],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(1);
      expect(mockResourceRef.value().items[0].name).toBe('John Doe');
    });

    it('should sort data by strings (ASC)', () => {
      component.resourceQueryDto.set({
        searchTerm: '',
        page: 0,
        size: 10,
        sortParams: ['name'],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items[0].name).toBe('Bob Wilson');
      expect(mockResourceRef.value().items[1].name).toBe('Jane Smithers');
      expect(mockResourceRef.value().items[2].name).toBe('John Doe');
    });

    it('should sort data by strings (DESC)', () => {
      component.resourceQueryDto.set({
        searchTerm: '',
        page: 0,
        size: 10,
        sortParams: ['-name'],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items[0].name).toBe('John Doe');
      expect(mockResourceRef.value().items[1].name).toBe('Jane Smithers');
      expect(mockResourceRef.value().items[2].name).toBe('Bob Wilson');
    });

    it('should sort data by numbers', () => {
      component.resourceQueryDto.set({
        searchTerm: '',
        page: 0,
        size: 10,
        sortParams: ['age'],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items[0].age).toBe(25);
      expect(mockResourceRef.value().items[1].age).toBe(30);
      expect(mockResourceRef.value().items[2].age).toBe(35);
    });

    it('should sort data by date', () => {
      component.resourceQueryDto.set({
        searchTerm: '',
        page: 0,
        size: 10,
        sortParams: ['date'],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items[0].date).toBe('2023-04-10');
      expect(mockResourceRef.value().items[1].date).toBe('2023-05-15');
      expect(mockResourceRef.value().items[2].date).toBe('2023-06-20');
    });
  });

  describe('Integration with AgridataTable', () => {
    it('should display the AgridataTable component', () => {
      fixture.detectChanges();
      const tableElement = fixture.debugElement.query(By.directive(AgridataTableComponent));
      expect(tableElement).toBeTruthy();
    });

    it('should enable search when enableSearch is set to true', () => {
      fixture.componentRef.setInput('enableSearch', true);
      fixture.detectChanges();

      const tableElement = fixture.debugElement.query(By.directive(AgridataTableComponent));
      expect(tableElement.componentInstance.enableSearch()).toBe(true);
    });

    it('should process sort parameters from child table component', () => {
      fixture.detectChanges();

      // Simulate sort direction change through child component
      const tableElement = fixture.debugElement.query(By.directive(AgridataTableComponent));
      tableElement.componentInstance.queryParameters.set({
        page: 0,
        size: 10,
        sortParams: ['name'],
        searchTerm: '',
      });

      fixture.detectChanges();
      expect(component.resourceQueryDto()?.sortParams).toEqual(['name']);

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items[0].name).toBe('Bob Wilson');
    });

    it('should process search requests from child table component', () => {
      fixture.componentRef.setInput('enableSearch', true);
      fixture.detectChanges();

      // Simulate search input through child component
      const tableElement = fixture.debugElement.query(By.directive(AgridataTableComponent));
      tableElement.componentInstance.queryParameters.set({
        page: 0,
        size: 10,
        sortParams: [],
        searchTerm: 'jane',
      });

      fixture.detectChanges();
      expect(component.resourceQueryDto()?.searchTerm).toBe('jane');

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(1);
      expect(mockResourceRef.value().items[0].name).toBe('Jane Smithers');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty data list', () => {
      fixture.componentRef.setInput('rawData', []);
      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(0);
      expect(mockResourceRef.value().totalItems).toBe(0);
    });

    it('should handle undefined rawData', () => {
      fixture.componentRef.setInput('rawData', undefined);
      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(0);
      expect(mockResourceRef.value().totalItems).toBe(0);
    });

    it('should handle missing searchFn', () => {
      const metadataWithoutSearch = { ...mockTableMetadata };
      delete metadataWithoutSearch.searchFn;

      fixture.componentRef.setInput('tableMetadata', metadataWithoutSearch);
      component.resourceQueryDto.set({
        searchTerm: 'John',
        page: 0,
        size: 10,
        sortParams: [],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().items.length).toBe(3); // Without search function, all entries should be returned
    });

    it('should reset page to 0 when requesting a page number that is too high', () => {
      component.resourceQueryDto.set({
        searchTerm: '',
        page: 5, // Higher than available pages
        size: 10,
        sortParams: [],
      });

      fixture.detectChanges();

      const fetchedData = component['computeData'](
        component.rawData(),
        component.resourceQueryDto(),
      );
      const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

      expect(mockResourceRef.value().currentPage).toBe(0);
    });
  });
  // Additional tests to increase code coverage

  it('should sort data using custom sortFn (ASC)', () => {
    // Create a custom metadata with sortFn
    const metadataWithSortFn = { ...mockTableMetadata };
    metadataWithSortFn.columns[0].sortFn = (a, b) => {
      return a.name.length - b.name.length;
    };

    fixture.componentRef.setInput('tableMetadata', metadataWithSortFn);
    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['name'],
    });

    fixture.detectChanges();

    const fetchedData = component['computeData'](component.rawData(), component.resourceQueryDto());
    const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

    expect(mockResourceRef.value().items[0].name).toBe('John Doe');
    expect(mockResourceRef.value().items[1].name).toBe('Bob Wilson');
    expect(mockResourceRef.value().items[2].name).toBe('Jane Smithers');
  });

  it('should sort data using custom sortFn (DESC)', () => {
    // Create a custom metadata with sortFn
    const metadataWithSortFn = { ...mockTableMetadata };
    metadataWithSortFn.columns[0].sortFn = (a, b) => {
      return a.name.length - b.name.length;
    };

    fixture.componentRef.setInput('tableMetadata', metadataWithSortFn);
    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['-name'],
    });

    fixture.detectChanges();

    const fetchedData = component['computeData'](component.rawData(), component.resourceQueryDto());
    const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

    // Sorted by name length (DESC): Jane Smith (10), Bob Wilson (10), John Doe (8)
    expect(mockResourceRef.value().items[0].name).toBe('Jane Smithers');
    expect(mockResourceRef.value().items[1].name).toBe('Bob Wilson');
    expect(mockResourceRef.value().items[2].name).toBe('John Doe');
  });

  it('should log error when no column definition is found for sort param', () => {
    console.error = jest.fn();

    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['nonExistingColumn'],
    });

    fixture.detectChanges();

    component['computeData'](component.rawData(), component.resourceQueryDto());

    expect(console.error).toHaveBeenCalled();
  });

  it('should log error when trying to sort with no sortFn, sortValueFn and renderer is not function', () => {
    const templateMetadata: ClientTableMetadata<TestUser> = {
      columns: [
        {
          name: 'name',
          sortable: true,
          renderer: {
            type: CellRendererTypes.TEMPLATE,
            template: undefined,
          },
        },
        ...mockTableMetadata.columns.slice(1),
      ],
      idColumn: 'id',
      searchFn: mockTableMetadata.searchFn,
    };

    // Reset the component with new metadata
    fixture.componentRef.setInput('tableMetadata', templateMetadata);

    console.error = jest.fn();

    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['name'],
    });

    fixture.detectChanges();

    component['computeData'](component.rawData(), component.resourceQueryDto());

    expect(console.error).toHaveBeenCalled();
  });

  it('should sort numeric values (ASC)', () => {
    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['age'],
    });

    fixture.detectChanges();

    const fetchedData = component['computeData'](component.rawData(), component.resourceQueryDto());
    const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

    expect(mockResourceRef.value().items[0].age).toBe(25);
    expect(mockResourceRef.value().items[1].age).toBe(30);
    expect(mockResourceRef.value().items[2].age).toBe(35);
  });

  it('should sort numeric values (DESC)', () => {
    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['-age'],
    });

    fixture.detectChanges();

    const fetchedData = component['computeData'](component.rawData(), component.resourceQueryDto());
    const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

    expect(mockResourceRef.value().items[0].age).toBe(35);
    expect(mockResourceRef.value().items[1].age).toBe(30);
    expect(mockResourceRef.value().items[2].age).toBe(25);
  });

  it('should use sortValueFn when available', () => {
    // Create custom metadata with sortValueFn
    const metadataWithSortValueFn = { ...mockTableMetadata };
    metadataWithSortValueFn.columns[0].sortValueFn = (row) => {
      return row.name.length;
    };

    fixture.componentRef.setInput('tableMetadata', metadataWithSortValueFn);
    component.resourceQueryDto.set({
      searchTerm: '',
      page: 0,
      size: 10,
      sortParams: ['name'],
    });

    fixture.detectChanges();

    const fetchedData = component['computeData'](component.rawData(), component.resourceQueryDto());
    const mockResourceRef = MockResources.createMockResourceRef(fetchedData);

    // Sorted by name length (ASC): John Doe (8), Bob Wilson (10), Jane Smith (10)
    expect(mockResourceRef.value().items[0].name).toBe('John Doe');
    expect(mockResourceRef.value().items[1].name.length).toBe(10);
    expect(mockResourceRef.value().items[2].name.length).toBe(13);
  });
});
