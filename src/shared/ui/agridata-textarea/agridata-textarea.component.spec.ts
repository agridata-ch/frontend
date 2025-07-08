import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { AgridataTextareaComponent } from './agridata-textarea.component';

describe('AgridataTextareaComponent', () => {
  let fixture: ComponentFixture<AgridataTextareaComponent>;
  let component: AgridataTextareaComponent;
  let componentRef: ComponentRef<AgridataTextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataTextareaComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataTextareaComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('control', new FormControl(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
