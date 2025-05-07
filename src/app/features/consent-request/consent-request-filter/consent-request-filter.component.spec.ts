import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ConsentRequestFilterComponent } from './consent-request-filter.component';

describe('ConsentRequestFilterComponent', () => {
  let fixture: ComponentFixture<ConsentRequestFilterComponent>;
  let component: ConsentRequestFilterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsentRequestFilterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConsentRequestFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('initially no selected values', () => {
    expect(component.selectedValues()).toEqual([]);
    // 'All' (null) should be selected when none are chosen
    expect(component.isSelected(null)).toBe(true);
    expect(component.isSelected('OPENED')).toBe(false);
  });

  it('clicking All (null) when none selected does not emit', () => {
    const spy = jest.fn();
    component.onClick.subscribe(spy);
    component.handleClick(null);
    expect(spy).not.toHaveBeenCalled();
    expect(component.selectedValues()).toEqual([]);
  });

  it('clicking a value toggles it on and emits', () => {
    const spy = jest.fn();
    component.onClick.subscribe(spy);

    component.handleClick('OPENED');
    expect(component.selectedValues()).toEqual(['OPENED']);
    expect(spy).toHaveBeenCalledWith(['OPENED']);
  });

  it('clicking the same value again toggles it off and emits empty', () => {
    const spy = jest.fn();
    component.onClick.subscribe(spy);

    // first click to select
    component.handleClick('DECLINED');
    expect(component.selectedValues()).toEqual(['DECLINED']);
    expect(spy).toHaveBeenCalledWith(['DECLINED']);

    spy.mockClear();

    // second click to deselect
    component.handleClick('DECLINED');
    expect(component.selectedValues()).toEqual([]);
    expect(spy).toHaveBeenCalledWith([]);
  });

  it('clicking All (null) after selections resets and emits', () => {
    const spy = jest.fn();
    component.onClick.subscribe(spy);

    // select two values
    component.handleClick('OPENED');
    component.handleClick('GRANTED');
    expect(component.selectedValues().sort()).toEqual(['GRANTED', 'OPENED']);

    spy.mockClear();

    // click All to reset
    component.handleClick(null);
    expect(component.selectedValues()).toEqual([]);
    expect(spy).toHaveBeenCalledWith([]);
  });

  it('isSelected reflects current selections', () => {
    // select OPENED
    component.handleClick('OPENED');
    expect(component.isSelected('OPENED')).toBe(true);
    expect(component.isSelected('DECLINED')).toBe(false);
    expect(component.isSelected(null)).toBe(false);
  });

  it('filterOptions contains expected entries', () => {
    expect(component.filterOptions).toEqual([
      { label: 'Alle', value: null },
      { label: 'Offen', value: 'OPENED' },
      { label: 'Abgelehnt', value: 'DECLINED' },
      { label: 'Genehmigt', value: 'GRANTED' },
    ]);
  });
});
