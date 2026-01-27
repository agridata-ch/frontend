import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestFormCompletionComponent } from './data-request-form-completion.component';

describe('DataRequestFormCompletionComponent', () => {
  let component: DataRequestFormCompletionComponent;
  let fixture: ComponentFixture<DataRequestFormCompletionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestFormCompletionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormCompletionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
