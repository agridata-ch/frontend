import { provideHttpClient } from '@angular/common/http';
import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestService } from '@/entities/api';
import { DataRequestStateEnum } from '@/entities/openapi';
import { I18nService } from '@/shared/i18n';
import { MockDataRequestService, MockI18nService, mockDataRequests } from '@/shared/testing/mocks';
import { AgridataTableData } from '@/shared/ui/agridata-table';
import { BadgeVariant } from '@/shared/ui/badge';

import { DataRequestTableComponent } from './data-request-table.component';

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('DataRequestTableComponent', () => {
  let fixture: ComponentFixture<DataRequestTableComponent>;
  let component: DataRequestTableComponent;
  let componentRef: ComponentRef<DataRequestTableComponent>;
  let openComponent: any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestTableComponent],
      providers: [
        { provide: I18nService, useClass: MockI18nService },
        { provide: DataRequestService, useClass: MockDataRequestService },
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestTableComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
    openComponent = component as any;

    componentRef.setInput('dataRequests', mockDataRequests);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should map dataRequests to table rows and emit rowAction output', () => {
    const rowSpy = jest.fn();
    component.tableRowAction.subscribe(rowSpy);

    const rows = openComponent.requests();
    expect(rows.length).toBe(3);

    const first = rows[0];
    first.rowAction?.();
    expect(rowSpy).toHaveBeenCalledWith(mockDataRequests[0]);
  });

  it('getCellValue returns the correct value or empty string', () => {
    const tableData: AgridataTableData = {
      id: '1',
      data: [
        { header: 'Foo', value: 'Bar' },
        { header: 'Baz', value: 'Quux' },
      ],
      highlighted: false,
      actions: [],
      rowAction: () => {},
    };

    expect(openComponent.getCellValue(tableData, 'Foo')).toBe('Bar');
    expect(openComponent.getCellValue(tableData, 'Nonexistent')).toBe('');
  });

  it('getFilteredActions returns only details action for most states', () => {
    const actions = openComponent.getFilteredActions(mockDataRequests[0]);
    expect(actions.length).toBe(1);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
  });

  it('getFilteredActions returns details and retreat actions for InReview state', () => {
    const actions = openComponent.getFilteredActions(mockDataRequests[1]);
    expect(actions.length).toBe(2);
    expect(actions[0].label).toBe('data-request.table.tableActions.details');
    expect(actions[1].label).toBe('data-request.table.tableActions.retreat');
  });

  it('getFilteredActions handles undefined request', () => {
    const actions = openComponent.getFilteredActions(undefined);
    expect(actions).toEqual([]);
  });

  it('getTranslatedStateValue returns translated state value', () => {
    const tableData: AgridataTableData = {
      id: '1',
      data: [{ header: openComponent.dataRequestStateHeader, value: DataRequestStateEnum.Draft }],
      actions: [],
    };

    const result = openComponent.getTranslatedStateValue(
      tableData,
      openComponent.dataRequestStateHeader,
    );
    expect(result).toBe(`data-request.stateCode.${DataRequestStateEnum.Draft}`);
  });

  it('getBadgeVariant returns correct BadgeVariant for each state', () => {
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.Draft)).toBe(BadgeVariant.INFO);
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.InReview)).toBe(BadgeVariant.INFO);
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.ToBeSigned)).toBe(
      BadgeVariant.WARNING,
    );
    expect(openComponent.getBadgeVariant(DataRequestStateEnum.Active)).toBe(BadgeVariant.SUCCESS);
    expect(openComponent.getBadgeVariant('UNKNOWN')).toBe(BadgeVariant.DEFAULT);
  });

  it('retreat callback should call service and reload data', async () => {
    const inReviewRequest = mockDataRequests[1];
    const actions = openComponent.getFilteredActions(inReviewRequest);
    const retreatAction = actions[1];

    const dataRequestService = TestBed.inject(
      DataRequestService,
    ) as unknown as MockDataRequestService;

    retreatAction.callback();
    await flushPromises();

    expect(dataRequestService.retreatDataRequest).toHaveBeenCalledWith(inReviewRequest.id);
    expect(dataRequestService.fetchDataRequests.reload).toHaveBeenCalled();
  });
});
