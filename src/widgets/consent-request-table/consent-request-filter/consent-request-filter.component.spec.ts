import { ComponentRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';

import { ConsentRequestDto } from '@/entities/openapi';
import { ConsentRequestStateEnum } from '@/entities/openapi/model/consentRequestStateEnum';

import { ConsentRequestFilterComponent } from './consent-request-filter.component';

describe('ConsentRequestFilterComponent', () => {
  let fixture: ComponentFixture<ConsentRequestFilterComponent>;
  let component: ConsentRequestFilterComponent;
  let componentRef: ComponentRef<ConsentRequestFilterComponent>;

  const sampleRequests: ConsentRequestDto[] = [
    { id: '1', stateCode: ConsentRequestStateEnum.Opened } as ConsentRequestDto,
    { id: '2', stateCode: ConsentRequestStateEnum.Granted } as ConsentRequestDto,
    { id: '3', stateCode: ConsentRequestStateEnum.Opened } as ConsentRequestDto,
    { id: '4', stateCode: ConsentRequestStateEnum.Declined } as ConsentRequestDto,
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestFilterComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('computes totalOpenRequests correctly based on requests input', () => {
    component = fixture.componentInstance;
    componentRef.setInput('requests', sampleRequests);
    fixture.detectChanges();

    // There are two with stateCode = Opened
    expect(component.totalOpenRequests()).toBe(2);
  });

  it('handleClick toggles selectedValue and emits the correct value', async () => {
    const emittedValues: Array<string | null> = [];
    component.onClick.subscribe((val) => emittedValues.push(val));

    expect(component.isSelected(null)).toBe(true);

    component.handleClick(ConsentRequestStateEnum.Opened);
    expect(component.selectedValue()).toBe(ConsentRequestStateEnum.Opened);
    expect(emittedValues).toEqual([ConsentRequestStateEnum.Opened]);
    expect(component.isSelected(ConsentRequestStateEnum.Opened)).toBe(true);

    component.handleClick(ConsentRequestStateEnum.Opened);
    expect(component.selectedValue()).toBeNull();
    expect(emittedValues).toEqual([ConsentRequestStateEnum.Opened, null]);
    expect(component.isSelected(ConsentRequestStateEnum.Opened)).toBe(false);
    expect(component.isSelected(null)).toBe(true);

    component.handleClick(ConsentRequestStateEnum.Declined);
    expect(component.selectedValue()).toBe(ConsentRequestStateEnum.Declined);
    expect(emittedValues).toEqual([
      ConsentRequestStateEnum.Opened,
      null,
      ConsentRequestStateEnum.Declined,
    ]);
    expect(component.isSelected(ConsentRequestStateEnum.Declined)).toBe(true);
  });

  it('isSelected returns false for values not currently selected', async () => {
    expect(component.isSelected(ConsentRequestStateEnum.Opened)).toBe(false);

    component.handleClick(ConsentRequestStateEnum.Granted);
    expect(component.selectedValue()).toBe(ConsentRequestStateEnum.Granted);
    expect(component.isSelected(ConsentRequestStateEnum.Opened)).toBe(false);
    expect(component.isSelected(ConsentRequestStateEnum.Granted)).toBe(true);
  });

  it('filterOptions contains all expected label/value pairs', () => {
    const opts = component.filterOptions;
    expect(opts.length).toBe(4);

    expect(opts[0]).toEqual({ label: 'consent-request-table.filter.ALL', value: null });
    expect(opts[1]).toEqual({
      label: 'consent-request-table.filter.OPENED',
      value: ConsentRequestStateEnum.Opened,
    });
    expect(opts[2]).toEqual({
      label: 'consent-request-table.filter.DECLINED',
      value: ConsentRequestStateEnum.Declined,
    });
    expect(opts[3]).toEqual({
      label: 'consent-request-table.filter.GRANTED',
      value: ConsentRequestStateEnum.Granted,
    });
  });
});
