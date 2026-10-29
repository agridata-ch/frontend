import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ConsentRequestAggregationSummaryDto } from '@/entities/openapi';
import { ConsentRequestAggregationStateEnum } from '@/entities/openapi/model/consentRequestAggregationStateEnum';
import { FilterButtonsComponent } from '@/shared/ui/filter-buttons';

import { ConsentRequestFilterComponent } from './consent-request-filter.component';

describe('ConsentRequestFilterComponent', () => {
  let fixture: ComponentFixture<ConsentRequestFilterComponent>;
  let component: ConsentRequestFilterComponent;
  let componentRef: ComponentRef<ConsentRequestFilterComponent>;

  const sampleRequests: ConsentRequestAggregationSummaryDto[] = [
    { id: '1', stateCode: ConsentRequestAggregationStateEnum.Opened },
    { id: '2', stateCode: ConsentRequestAggregationStateEnum.Granted },
    { id: '3', stateCode: ConsentRequestAggregationStateEnum.Opened },
    { id: '4', stateCode: ConsentRequestAggregationStateEnum.Declined },
    { id: '5', stateCode: ConsentRequestAggregationStateEnum.PartiallyOpened },
    { id: '6', stateCode: ConsentRequestAggregationStateEnum.PartiallyGranted },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestFilterComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('requests', sampleRequests);
    fixture.detectChanges();
  });

  it('counts opened and partially opened requests on the combined opened filter', () => {
    // two OPENED plus one PARTIALLY_OPENED
    expect(component['totalOpenRequests']()).toBe(3);
  });

  it('filterOptions contains all expected options with the count on OPENED only', () => {
    expect(component['filterOptions']()).toEqual([
      { label: 'consent-request.filter.ALL', value: null },
      // OPENED is the combined filter for OPENED and PARTIALLY_OPENED, so there is no own option
      {
        label: 'consent-request.filter.OPENED',
        value: ConsentRequestAggregationStateEnum.Opened,
        count: 3,
      },
      {
        label: 'consent-request.filter.DECLINED',
        value: ConsentRequestAggregationStateEnum.Declined,
      },
      {
        label: 'consent-request.filter.GRANTED',
        value: ConsentRequestAggregationStateEnum.Granted,
      },
      {
        label: 'consent-request.filter.PARTIALLY_GRANTED',
        value: ConsentRequestAggregationStateEnum.PartiallyGranted,
      },
    ]);
  });

  it('emits handleFilterChange when the filter buttons change the selection', () => {
    const emittedValues: Array<string | null> = [];
    component.handleFilterChange.subscribe((value) => emittedValues.push(value));

    fixture.debugElement
      .query(By.directive(FilterButtonsComponent))
      .triggerEventHandler('selectedValueChange', ConsentRequestAggregationStateEnum.Declined);

    expect(emittedValues).toEqual([ConsentRequestAggregationStateEnum.Declined]);
  });
});
