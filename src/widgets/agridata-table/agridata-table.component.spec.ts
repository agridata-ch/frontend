import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  AgridataTableComponent,
  AgridataTableData,
  CellTemplateDirective,
} from './agridata-table.component';
import { QueryList, TemplateRef } from '@angular/core';

describe('AgridataTableComponent', () => {
  let component: AgridataTableComponent;
  let fixture: ComponentFixture<AgridataTableComponent>;

  const sampleData: AgridataTableData[] = [
    {
      data: [
        { header: 'Name', value: 'Alice' },
        { header: 'Age', value: '30' },
      ],
      highlighted: false,
      actions: [],
    },
    {
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
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('infers headers from provided data', () => {
    component.data = null;
    expect(component.headers()).toEqual([]);
  });

  it('infers headers from provided data', () => {
    component.data = sampleData;
    expect(component.headers()).toEqual(['Name', 'Age']);
  });

  it('initializes sortColumnIndex based on defaultSortColumn input', () => {
    component.defaultSortColumn = 'Age';
    component.defaultSortDirection = 'desc';
    component.data = sampleData;
    expect(component.sortColumnIndex()).toBe(1);
    expect(component.sortDirection()).toBe('desc');
  });

  it('sorts data ascending then descending on setSort', () => {
    component.data = sampleData;

    // first click: ascending
    component.setSort(1);
    expect(component.sortDirection()).toBe('asc');
    let sorted = component.sorted();
    expect(sorted[0].data[1].value).toBe('20');

    // second click: descending
    component.setSort(1);
    expect(component.sortDirection()).toBe('desc');
    sorted = component.sorted();
    expect(sorted[0].data[1].value).toBe('30');

    // third click: back to ascending
    component.setSort(1);
    expect(component.sortDirection()).toBe('asc');
    sorted = component.sorted();
    expect(sorted[0].data[1].value).toBe('20');
  });

  it('paginates rows correctly', () => {
    const manyRows: AgridataTableData[] = Array.from({ length: 5 }, (_, i) => ({
      data: [{ header: 'Col', value: `row${i}` }],
      highlighted: false,
      actions: [],
    }));
    component.pageSize = 2;
    component.data = manyRows;

    expect(component.totalPages()).toBe(3);
    expect(component.paginated().length).toBe(2);

    component.nextPage();
    expect(component.paginated().length).toBe(2);

    component.nextPage();
    expect(component.paginated().length).toBe(1);

    component.prevPage();
    expect(component.paginated().length).toBe(2);
  });

  it('returns null for non-existing header', () => {
    const queryList = new QueryList<CellTemplateDirective>();
    queryList.reset([]);
    component.cellTemplates = queryList;
    const result = component.getTemplate('NonExistingHeader');
    expect(result).toBeNull();
  });

  it('returns template for existing header', () => {
    const template = {
      header: 'Name',
      template: {} as TemplateRef<{ $implicit: AgridataTableData }>,
    };

    const queryList = new QueryList<CellTemplateDirective>();
    queryList.reset([template]);
    component.cellTemplates = queryList;

    const result = component.getTemplate('Name');
    expect(result).toBe(template.template);
  });

  it('should format values correctly', () => {
    // format null
    const nullValue = null;
    const formattedNull = component.formatValue(nullValue);
    expect(formattedNull).toBe('');

    // format number
    const number = 123456789;
    const formattedNumber = component.formatValue(number);
    expect(formattedNumber).toBe(123456789);

    // format string
    const string = 'my string';
    const formattedString = component.formatValue(string);
    expect(formattedString).toBe(string);

    // format date
    const date = new Date('2023-10-01T12:00:00Z');
    const formattedDate = component.formatValue(date);
    expect(formattedDate).toBe('01.10.2023');

    // format iso date string
    const isoDateString = '2023-10-01T12:00:00Z';
    const formattedIsoDateString = component.formatValue(isoDateString);
    expect(formattedIsoDateString).toBe('01.10.2023');
  });
});
