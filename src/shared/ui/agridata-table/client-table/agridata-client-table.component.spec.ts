import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgridataClientTableComponent } from './agridata-client-table.component';

describe.skip('AgridataClientTableComponent', () => {
  let component: AgridataClientTableComponent<any>;
  let fixture: ComponentFixture<AgridataClientTableComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataClientTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataClientTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
