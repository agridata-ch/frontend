import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataMultiSelectOptionComponent } from './agridata-multi-select-option.component';

describe('AgridataMultiSelectOptionComponent', () => {
  let fixture: ComponentFixture<AgridataMultiSelectOptionComponent>;
  let component: AgridataMultiSelectOptionComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AgridataMultiSelectOptionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataMultiSelectOptionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
