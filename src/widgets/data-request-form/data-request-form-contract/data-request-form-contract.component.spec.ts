import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestFormContractComponent } from './data-request-form-contract.component';

describe('DataRequestFormContractComponent', () => {
  let component: DataRequestFormContractComponent;
  let fixture: ComponentFixture<DataRequestFormContractComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestFormContractComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormContractComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
