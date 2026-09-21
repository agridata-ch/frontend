import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataRadioGroupComponent } from './agridata-radio-group.component';

describe('AgridataRadioGroupComponent', () => {
  let component: AgridataRadioGroupComponent;
  let fixture: ComponentFixture<AgridataRadioGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataRadioGroupComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataRadioGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the name input to every rendered radio input', () => {
    fixture.componentRef.setInput('options', [
      { title: 'Yes', subtitle: '', value: true },
      { title: 'No', subtitle: '', value: false },
    ]);
    fixture.componentRef.setInput('name', 'paymentRequired');
    fixture.detectChanges();

    const radios = Array.from(
      fixture.nativeElement.querySelectorAll('input[type="radio"]'),
    ) as HTMLInputElement[];
    expect(radios).toHaveLength(2);
    expect(radios.every((radio) => radio.name === 'paymentRequired')).toBe(true);
  });

  describe('view mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { title: 'Yes', subtitle: 'Yes subtitle', value: true },
        { title: 'No', subtitle: 'No subtitle', value: false },
      ]);
      fixture.componentRef.setInput('isViewMode', true);
    });

    it('should show only the selected option title, without radio inputs or subtitle', () => {
      fixture.componentRef.setInput('value', false);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('No');
      expect(fixture.nativeElement.textContent).not.toContain('Yes');
      expect(fixture.nativeElement.textContent).not.toContain('No subtitle');
      expect(fixture.nativeElement.querySelectorAll('input[type="radio"]')).toHaveLength(0);
    });

    it('should show a placeholder when no option is selected', () => {
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('–');
    });
  });
});
