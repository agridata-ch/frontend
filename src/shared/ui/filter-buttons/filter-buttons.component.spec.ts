import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterButtonsComponent, FilterOption } from './filter-buttons.component';

describe('FilterButtonsComponent', () => {
  let fixture: ComponentFixture<FilterButtonsComponent>;
  let component: FilterButtonsComponent;
  let componentRef: ComponentRef<FilterButtonsComponent>;

  const options: FilterOption[] = [
    { label: 'filter.ALL', value: null },
    { label: 'filter.A', value: 'A', count: 2 },
    { label: 'filter.B', value: 'B' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterButtonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterButtonsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('options', options);
    fixture.detectChanges();
  });

  it('selects the clicked value and emits it', () => {
    const emittedValues: Array<string | null> = [];
    component.selectedValue.subscribe((value) => emittedValues.push(value));

    component['handleClick']('A');

    expect(component.selectedValue()).toBe('A');
    expect(emittedValues).toEqual(['A']);
  });

  it('resets to null when the selected value is clicked again', () => {
    component['handleClick']('A');
    component['handleClick']('A');

    expect(component.selectedValue()).toBeNull();
  });

  it('switches directly between values', () => {
    component['handleClick']('A');
    component['handleClick']('B');

    expect(component.selectedValue()).toBe('B');
  });

  it('marks only the selected button as pressed for screen readers', () => {
    componentRef.setInput('selectedValue', 'A');
    fixture.detectChanges();

    const pressedStates = Array.from(
      fixture.nativeElement.querySelectorAll('button'),
      (button: HTMLButtonElement) => button.getAttribute('aria-pressed'),
    );
    expect(pressedStates).toEqual(['false', 'true', 'false']);
  });
});
