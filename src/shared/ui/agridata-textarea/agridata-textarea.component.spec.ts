import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

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

  it('should be readonly and skipped by tab navigation in view mode', () => {
    componentRef.setInput('isViewMode', true);
    fixture.detectChanges();

    const textarea: HTMLTextAreaElement = fixture.debugElement.query(
      By.css('textarea'),
    ).nativeElement;
    expect(textarea.readOnly).toBe(true);
    expect(textarea.tabIndex).toBe(-1);
  });

  it('should be readonly when disabled', () => {
    componentRef.setInput('disabled', true);
    fixture.detectChanges();

    expect(
      (fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement)
        .readOnly,
    ).toBe(true);
  });
});
