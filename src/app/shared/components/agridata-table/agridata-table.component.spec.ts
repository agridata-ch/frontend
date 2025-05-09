import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataTableComponent } from './agridata-table.component';

describe('AgridataTableComponent', () => {
  let component: AgridataTableComponent;
  let fixture: ComponentFixture<AgridataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
