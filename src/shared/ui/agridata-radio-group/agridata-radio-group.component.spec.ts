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

  describe('view mode', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('options', [
        { title: 'Yes', subtitle: '', value: true },
        { title: 'No', subtitle: '', value: false },
      ]);
      fixture.componentRef.setInput('value', false);
      fixture.componentRef.setInput('isViewMode', true);
      fixture.detectChanges();
    });

    it('should keep the options but disable them and drop the border', () => {
      const radios = Array.from(
        fixture.nativeElement.querySelectorAll('input[type="radio"]'),
      ) as HTMLInputElement[];
      expect(radios).toHaveLength(2);
      expect(radios.every((radio) => radio.disabled)).toBe(true);

      const container = fixture.nativeElement.querySelector('div') as HTMLElement;
      expect(container.classList).toContain('border-transparent');
      expect(container.classList).not.toContain('border-agridata-stroke');
    });
  });
});
