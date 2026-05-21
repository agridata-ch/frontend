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
});
