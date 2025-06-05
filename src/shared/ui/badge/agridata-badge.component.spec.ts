import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataBadgeComponent } from './agridata-badge.component';

describe('AgridataBadgeComponent', () => {
  let component: AgridataBadgeComponent;
  let fixture: ComponentFixture<AgridataBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataBadgeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
