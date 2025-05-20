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
    expect(component.selectedValue()).toEqual(null);
    // 'All' (null) should be selected when none are chosen
    expect(component.isSelected(null)).toBe(true);
    expect(component.isSelected('OPENED')).toBe(false);
  });

  it('clicking All (null) when none selected does not emit', () => {
    component.handleClick(null);
    expect(component.selectedValue()).toEqual(null);
  });

  it('clicking a value toggles it on and emits', () => {
    component.handleClick('OPENED');
    expect(component.selectedValue()).toEqual('OPENED');
  });

  it('clicking the same value again toggles it off and emits empty', () => {
    // first click to select
    component.handleClick('DECLINED');
    expect(component.selectedValue()).toEqual('DECLINED');

    // second click to deselect
    component.handleClick('DECLINED');
    expect(component.selectedValue()).toEqual(null);
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
