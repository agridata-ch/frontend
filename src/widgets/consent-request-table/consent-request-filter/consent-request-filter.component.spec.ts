import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsentRequestAggregationSummaryDto } from '@/entities/openapi';
import { ConsentRequestAggregationStateEnum } from '@/entities/openapi/model/consentRequestAggregationStateEnum';

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
  });

  it('counts opened and partially opened requests on the combined opened filter', () => {
    component = fixture.componentInstance;
    componentRef.setInput('requests', sampleRequests);
    fixture.detectChanges();

    // two OPENED plus one PARTIALLY_OPENED
    expect(component.totalOpenRequests()).toBe(3);
  });

  it('onButtonClick toggles selectedValue and emits the correct value', async () => {
    const emittedValues: Array<string | null> = [];
    component.handleFilterChange.subscribe((val) => emittedValues.push(val));

    expect(component.isSelected(null)).toBe(true);

    component.handleClick(ConsentRequestAggregationStateEnum.Opened);
    expect(component.selectedValue()).toBe(ConsentRequestAggregationStateEnum.Opened);
    expect(emittedValues).toEqual([ConsentRequestAggregationStateEnum.Opened]);
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Opened)).toBe(true);

    component.handleClick(ConsentRequestAggregationStateEnum.Opened);
    expect(component.selectedValue()).toBeNull();
    expect(emittedValues).toEqual([ConsentRequestAggregationStateEnum.Opened, null]);
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Opened)).toBe(false);
    expect(component.isSelected(null)).toBe(true);

    component.handleClick(ConsentRequestAggregationStateEnum.Declined);
    expect(component.selectedValue()).toBe(ConsentRequestAggregationStateEnum.Declined);
    expect(emittedValues).toEqual([
      ConsentRequestAggregationStateEnum.Opened,
      null,
      ConsentRequestAggregationStateEnum.Declined,
    ]);
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Declined)).toBe(true);
  });

  it('isSelected returns false for values not currently selected', async () => {
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Opened)).toBe(false);

    component.handleClick(ConsentRequestAggregationStateEnum.Granted);
    expect(component.selectedValue()).toBe(ConsentRequestAggregationStateEnum.Granted);
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Opened)).toBe(false);
    expect(component.isSelected(ConsentRequestAggregationStateEnum.Granted)).toBe(true);
  });

  it('filterOptions contains all expected label/value pairs', () => {
    expect(component.filterOptions).toEqual([
      { label: 'consent-request.filter.ALL', value: null },
      // OPENED is the combined filter for OPENED and PARTIALLY_OPENED, so there is no own option
      {
        label: 'consent-request.filter.OPENED',
        value: ConsentRequestAggregationStateEnum.Opened,
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
});
