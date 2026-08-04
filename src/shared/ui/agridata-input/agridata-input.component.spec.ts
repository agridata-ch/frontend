import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { AgridataInputComponent } from './agridata-input.component';

describe('AgridataInputComponent', () => {
  let component: AgridataInputComponent;
  let fixture: ComponentFixture<AgridataInputComponent>;
  let componentRef: ComponentRef<AgridataInputComponent>;

  const getInput = (): HTMLInputElement =>
    fixture.debugElement.query(By.css('input')).nativeElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgridataInputComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataInputComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the input value on handleInputChange', () => {
    const mockEmit = jest.fn();
    Object.defineProperty(component, 'handleInput', {
      value: { emit: mockEmit },
      writable: false,
    });
    const mockValue = 'test value';
    const event = { target: { value: mockValue } } as unknown as Event;

    component.handleInputChange(event);

    expect(mockEmit).toHaveBeenCalledWith(mockValue);
  });

  describe('with a bound form control', () => {
    beforeEach(() => {
      componentRef.setInput('control', new FormControl(''));
      fixture.detectChanges();
    });

    it('should be editable by default', () => {
      expect(getInput().readOnly).toBe(false);
    });

    it('should be readonly when disabled', () => {
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(getInput().readOnly).toBe(true);
    });

    it('should be readonly in view mode', () => {
      componentRef.setInput('isViewMode', true);
      fixture.detectChanges();

      expect(getInput().readOnly).toBe(true);
    });
  });
});
