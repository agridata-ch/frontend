import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataRequestsConsumerPage } from './data-requests-consumer.page';

describe('DataRequestsConsumerPage - component behavior', () => {
  let fixture: ComponentFixture<DataRequestsConsumerPage>;
  let component: DataRequestsConsumerPage;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [DataRequestsConsumerPage],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestsConsumerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should handleOpen', () => {
    component.handleOpen();
    expect(component.showPanel()).toBe(true);
  });

  it('should handleClose', () => {
    component.handleClose();
    expect(component.showPanel()).toBe(false);
  });
});
