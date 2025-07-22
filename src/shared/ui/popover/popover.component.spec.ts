import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopoverComponent } from './popover.component';

describe('PopoverComponent', () => {
  let fixture: ComponentFixture<PopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopoverComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverComponent);
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
