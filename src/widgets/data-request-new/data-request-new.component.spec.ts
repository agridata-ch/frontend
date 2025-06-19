import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestNewComponent } from './data-request-new.component';

describe('DataRequestNewComponent', () => {
  let component: DataRequestNewComponent;
  let fixture: ComponentFixture<DataRequestNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
