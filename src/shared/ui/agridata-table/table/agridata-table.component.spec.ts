import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataTableComponent } from './agridata-table.component';
// import { AgridataTableData } from './agridata-table.model';

describe.skip('AgridataTableComponent', () => {
  let fixture: ComponentFixture<AgridataTableComponent<any>>;
  let component: AgridataTableComponent<any>;
  let componentRef: ComponentRef<AgridataTableComponent<any>>;

  // const sampleData: AgridataTableData[] = [
  //   {
  //     id: '1',
  //     data: [
  //       { header: 'Name', value: 'Alice' },
  //       { header: 'Age', value: '30' },
  //     ],
  //     highlighted: false,
  //     actions: [],
  //   },
  //   {
  //     id: '2',
  //     data: [
  //       { header: 'Name', value: 'Bob' },
  //       { header: 'Age', value: '20' },
  //     ],
  //     highlighted: true,
  //     actions: [],
  //   },
  // ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataTableComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // it('infers empty headers when rawData is null', () => {
  //   componentRef.setInput('rawData', null);
  //   fixture.detectChanges();

  //   expect(component.headers()).toEqual([]);
  // });

  // it('infers headers from provided data', () => {
  //   componentRef.setInput('rawData', sampleData);
  //   fixture.detectChanges();

  //   expect(component.headers()).toEqual(['Name', 'Age']);
  // });

  // it('initializes sortColumnIndex and sortDirection from defaults', () => {
  //   componentRef.setInput('defaultSortColumn', 'Age');
  //   componentRef.setInput('defaultSortDirection', 'desc');
  //   componentRef.setInput('rawData', sampleData);
  //   fixture.detectChanges();

  //   expect(component.sortColumnIndex()).toBe(1);
  //   expect(component.sortDirection()).toBe('desc');
  // });

  // it('sorts data descending then ascending on setSort', () => {
  //   componentRef.setInput('rawData', sampleData);
  //   fixture.detectChanges();

  //   // First click: set column 1, direction stays 'desc'
  //   component.setSort(1);
  //   expect(component.sortDirection()).toBe('desc');
  //   let sorted = component.sortedRows();
  //   expect(sorted[0].data[1].value).toBe('30');

  //   // Second click: toggle to 'asc'
  //   component.setSort(1);
  //   expect(component.sortDirection()).toBe('asc');
  //   sorted = component.sortedRows();
  //   expect(sorted[0].data[1].value).toBe('20');

  //   // Third click: toggle back to 'desc'
  //   component.setSort(1);
  //   expect(component.sortDirection()).toBe('desc');
  //   sorted = component.sortedRows();
  //   expect(sorted[0].data[1].value).toBe('30');
  // });

  // it('paginates rows correctly', () => {
  //   const manyRows = Array.from({ length: 5 }, (_, i) => ({
  //     id: `${i + 1}`,
  //     data: [{ header: 'Col', value: `row${i}` }],
  //     highlighted: false,
  //     actions: [],
  //   })) as AgridataTableData[];

  //   componentRef.setInput('pageSize', 2);
  //   componentRef.setInput('rawData', manyRows);
  //   fixture.detectChanges();

  //   expect(component.totalPages()).toBe(3);
  //   expect(component.paginated().length).toBe(2);

  //   component.nextPage();
  //   expect(component.paginated().length).toBe(2);

  //   component.nextPage();
  //   expect(component.paginated().length).toBe(1);

  //   component.prevPage();
  //   expect(component.paginated().length).toBe(2);
  // });

  // it('formats values correctly in formatValue()', () => {
  //   expect(component.formatValue(null)).toBe('');
  //   expect(component.formatValue(undefined)).toBe('');
  //   expect(component.formatValue(42)).toBe(42);
  //   expect(component.formatValue('hello')).toBe('hello');

  //   const date = new Date('2023-10-01T12:00:00Z');
  //   expect(component.formatValue(date)).toBe('01.10.2023');

  //   const iso = '2023-10-01T12:00:00Z';
  //   expect(component.formatValue(iso)).toBe('01.10.2023');
  // });

  // it('should call rowAction if present on row', () => {
  //   const action = jest.fn();
  //   const row = { id: '1', data: [], rowAction: action } as unknown as AgridataTableData;

  //   component.onRowClick(row);

  //   expect(action).toHaveBeenCalled();
  // });

  // it('should not throw if rowAction is not present', () => {
  //   const row = { id: '1', data: [] } as unknown as AgridataTableData;

  //   expect(() => component.onRowClick(row)).not.toThrow();
  // });

  // describe('sort persistence across data changes', () => {
  //   it('should maintain sort state when new data arrives with the same headers', () => {
  //     // Initialize with sample data and set a specific sort
  //     componentRef.setInput('rawData', sampleData);
  //     fixture.detectChanges();

  //     // Sort by Age column
  //     component.setSort(1); // Age column (index 1)
  //     expect(component.sortColumnIndex()).toBe(1);
  //     expect(component.sortDirection()).toBe('desc');

  //     // First sorted data - Bob should come first (Age 30 > 20)
  //     const firstSortedData = component.sortedRows();
  //     expect(firstSortedData[0].data[0].value).toBe('Alice');
  //     expect(firstSortedData[0].data[1].value).toBe('30');

  //     // New data with the same structure but different values
  //     const newData: AgridataTableData[] = [
  //       {
  //         id: '3',
  //         data: [
  //           { header: 'Name', value: 'Charlie' },
  //           { header: 'Age', value: '40' },
  //         ],
  //         highlighted: false,
  //         actions: [],
  //       },
  //       {
  //         id: '4',
  //         data: [
  //           { header: 'Name', value: 'David' },
  //           { header: 'Age', value: '25' },
  //         ],
  //         highlighted: false,
  //         actions: [],
  //       },
  //     ];

  //     // Update the data
  //     componentRef.setInput('rawData', newData);
  //     fixture.detectChanges();

  //     // Check if sorting is maintained
  //     expect(component.sortColumnIndex()).toBe(1); // Age column should still be sorted
  //     expect(component.sortDirection()).toBe('desc'); // Direction should be maintained

  //     // Check the sorted results reflect the maintained sort
  //     const newSortedData = component.sortedRows();
  //     expect(newSortedData[0].data[0].value).toBe('Charlie');
  //     expect(newSortedData[0].data[1].value).toBe('40');
  //   });

  //   it('should maintain sort direction when clicking same column header multiple times and data changes', () => {
  //     // Initialize with sample data
  //     componentRef.setInput('rawData', sampleData);
  //     fixture.detectChanges();

  //     // Sort by Age column and toggle to ascending
  //     component.setSort(1); // First click - desc
  //     component.setSort(1); // Second click - asc
  //     expect(component.sortDirection()).toBe('asc');

  //     // Update the data
  //     const newData = [...sampleData];
  //     newData.push({
  //       id: '3',
  //       data: [
  //         { header: 'Name', value: 'Charlie' },
  //         { header: 'Age', value: '25' },
  //       ],
  //       highlighted: false,
  //       actions: [],
  //     });

  //     componentRef.setInput('rawData', newData);
  //     fixture.detectChanges();

  //     // Verify sort direction is still ascending after data update
  //     expect(component.sortColumnIndex()).toBe(1);
  //     expect(component.sortDirection()).toBe('asc');

  //     // Verify data is sorted in ascending order
  //     const sortedData = component.sortedRows();
  //     expect(sortedData[0].data[1].value).toBe('20'); // Bob should be first (youngest)
  //     expect(sortedData[1].data[1].value).toBe('25'); // Charlie should be second
  //     expect(sortedData[2].data[1].value).toBe('30'); // Alice should be last (oldest)
  //   });

  //   it('should reset sort if sorted column no longer exists in new data', () => {
  //     // Initialize with data containing Name, Age columns
  //     componentRef.setInput('rawData', sampleData);
  //     fixture.detectChanges();

  //     // Sort by Age column
  //     component.setSort(1);
  //     expect(component.sortColumnIndex()).toBe(1);

  //     // New data with different columns
  //     const newData: AgridataTableData[] = [
  //       {
  //         id: '3',
  //         data: [
  //           { header: 'Name', value: 'Charlie' },
  //           { header: 'City', value: 'New York' }, // Age column replaced with City
  //         ],
  //         highlighted: false,
  //         actions: [],
  //       },
  //     ];

  //     // Update the data
  //     componentRef.setInput('rawData', newData);
  //     fixture.detectChanges();

  //     // Sort should be reset because 'Age' column no longer exists
  //     expect(component.sortColumnIndex()).toBeNull();
  //   });

  //   it('should handle column reordering while maintaining sort on the same column', () => {
  //     // Initialize with sample data
  //     componentRef.setInput('rawData', sampleData);
  //     fixture.detectChanges();

  //     // Sort by Age column
  //     component.setSort(1); // Age column (index 1)
  //     expect(component.sortColumnIndex()).toBe(1);

  //     // New data with reordered columns (Age first, then Name)
  //     const reorderedData: AgridataTableData[] = [
  //       {
  //         id: '1',
  //         data: [
  //           { header: 'Age', value: '30' },
  //           { header: 'Name', value: 'Alice' },
  //         ],
  //         highlighted: false,
  //         actions: [],
  //       },
  //       {
  //         id: '2',
  //         data: [
  //           { header: 'Age', value: '20' },
  //           { header: 'Name', value: 'Bob' },
  //         ],
  //         highlighted: true,
  //         actions: [],
  //       },
  //     ];

  //     // Update the data with reordered columns
  //     componentRef.setInput('rawData', reorderedData);
  //     fixture.detectChanges();

  //     // Sort should now be on index 0 (Age column)
  //     expect(component.sortColumnIndex()).toBe(0);
  //     expect(component.sortDirection()).toBe('desc');

  //     // Check the sorted results reflect the maintained sort on Age
  //     const sortedData = component.sortedRows();
  //     expect(sortedData[0].data[0].value).toBe('30'); // Alice should be first (age 30)
  //   });
  // });
});
