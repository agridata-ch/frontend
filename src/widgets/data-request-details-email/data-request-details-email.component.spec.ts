import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestDetailsEmailComponent } from './data-request-details-email.component';

describe('DataRequestDetailsEmailComponent', () => {
  let component: DataRequestDetailsEmailComponent;
  let fixture: ComponentFixture<DataRequestDetailsEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestDetailsEmailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestDetailsEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it.skip('should create', () => {
    expect(component).toBeTruthy();
  });
});
