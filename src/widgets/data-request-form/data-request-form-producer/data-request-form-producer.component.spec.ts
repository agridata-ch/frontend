import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

import { DataRequestFormProducerComponent } from './data-request-form-producer.component';

describe('DataRequestFormProducerComponent', () => {
  let component: DataRequestFormProducerComponent;
  let fixture: ComponentFixture<DataRequestFormProducerComponent>;
  let componentRef: ComponentRef<DataRequestFormProducerComponent>;
  let form: FormGroup;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataRequestFormProducerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DataRequestFormProducerComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    form = new FormGroup({
      producer: new FormGroup({
        dataProducerGroup: new FormControl(''),
      }),
    });
    componentRef.setInput('form', form);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
