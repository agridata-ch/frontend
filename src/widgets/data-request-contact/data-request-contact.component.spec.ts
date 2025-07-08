import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestContactComponent } from './data-request-contact.component';

describe('DataRequestContactComponent', () => {
  let component: DataRequestContactComponent;
  let fixture: ComponentFixture<DataRequestContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestContactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
