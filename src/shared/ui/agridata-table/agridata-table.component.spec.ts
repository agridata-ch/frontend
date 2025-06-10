import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataTableComponent } from './agridata-table.component';
import { AgridataTableData } from './agridata-table.model';

describe('AgridataTableComponent', () => {
  let fixture: ComponentFixture<AgridataTableComponent>;
  let component: AgridataTableComponent;
  let componentRef: ComponentRef<AgridataTableComponent>;

  const sampleData: AgridataTableData[] = [
    {
      id: '1',
      data: [
        { header: 'Name', value: 'Alice' },
        { header: 'Age', value: '30' },
      ],
      highlighted: false,
      actions: [],
    },
    {
      id: '2',
      data: [
        { header: 'Name', value: 'Bob' },
        { header: 'Age', value: '20' },
      ],
      highlighted: true,
      actions: [],
    },
  ];

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

  it('infers empty headers when rawData is null', () => {
    componentRef.setInput('rawData', null);
    fixture.detectChanges();

    expect(component.headers()).toEqual([]);
  });

  it('infers headers from provided data', () => {
    componentRef.setInput('rawData', sampleData);
    fixture.detectChanges();

    expect(component.headers()).toEqual(['Name', 'Age']);
  });

  it('initializes sortColumnIndex and sortDirection from defaults', () => {
    componentRef.setInput('defaultSortColumn', 'Age');
    componentRef.setInput('defaultSortDirection', 'desc');
    componentRef.setInput('rawData', sampleData);
    fixture.detectChanges();

    expect(component.sortColumnIndex()).toBe(1);
    expect(component.sortDirection()).toBe('desc');
  });

  it('sorts data descending then ascending on setSort', () => {
    componentRef.setInput('rawData', sampleData);
    fixture.detectChanges();

    // First click: set column 1, direction stays 'desc'
    component.setSort(1);
    expect(component.sortDirection()).toBe('desc');
    let sorted = component.sortedRows();
    expect(sorted[0].data[1].value).toBe('30');

    // Second click: toggle to 'asc'
    component.setSort(1);
    expect(component.sortDirection()).toBe('asc');
    sorted = component.sortedRows();
    expect(sorted[0].data[1].value).toBe('20');

    // Third click: toggle back to 'desc'
    component.setSort(1);
    expect(component.sortDirection()).toBe('desc');
    sorted = component.sortedRows();
    expect(sorted[0].data[1].value).toBe('30');
  });

  it('paginates rows correctly', () => {
    const manyRows = Array.from({ length: 5 }, (_, i) => ({
      id: `${i + 1}`,
      data: [{ header: 'Col', value: `row${i}` }],
      highlighted: false,
      actions: [],
    })) as AgridataTableData[];

    componentRef.setInput('pageSize', 2);
    componentRef.setInput('rawData', manyRows);
    fixture.detectChanges();

    expect(component.totalPages()).toBe(3);
    expect(component.paginated().length).toBe(2);

    component.nextPage();
    expect(component.paginated().length).toBe(2);

    component.nextPage();
    expect(component.paginated().length).toBe(1);

    component.prevPage();
    expect(component.paginated().length).toBe(2);
  });

  it('formats values correctly in formatValue()', () => {
    expect(component.formatValue(null)).toBe('');
    expect(component.formatValue(undefined)).toBe('');
    expect(component.formatValue(42)).toBe(42);
    expect(component.formatValue('hello')).toBe('hello');

    const date = new Date('2023-10-01T12:00:00Z');
    expect(component.formatValue(date)).toBe('01.10.2023');

    const iso = '2023-10-01T12:00:00Z';
    expect(component.formatValue(iso)).toBe('01.10.2023');
  });

  it('should call rowAction if present on row', () => {
    const action = jest.fn();
    const row = { id: '1', data: [], rowAction: action } as unknown as AgridataTableData;

    component.onRowClick(row);

    expect(action).toHaveBeenCalled();
  });

  it('should not throw if rowAction is not present', () => {
    const row = { id: '1', data: [] } as unknown as AgridataTableData;

    expect(() => component.onRowClick(row)).not.toThrow();
  });
});
