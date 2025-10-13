import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { getErrorMessage } from '@/shared/lib/form.helper';

import { FormControlComponent } from './form-control.component';

jest.mock('@/shared/lib/form.helper', () => ({
  getErrorMessage: jest.fn(),
}));

describe('FormControlComponent', () => {
  let fixture: ComponentFixture<FormControlComponent>;
  let component: FormControlComponent;
  let componentRef: ComponentRef<FormControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(FormControlComponent);
    componentRef = fixture.componentRef;
    component = componentRef.instance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should return true from hasError() if control is touched and invalid', () => {
    const ctrl = new FormControl('');
    ctrl.markAsTouched();
    ctrl.setErrors({ required: true });
    componentRef.setInput('control', ctrl);
    expect(component.hasError()).toBe(true);
  });

  it('should return false from hasError() if control is untouched', () => {
    const ctrl = new FormControl('');
    componentRef.setInput('control', ctrl);
    fixture.detectChanges();
    expect(component.hasError()).toBe(false);
  });

  it('should return false from hasError() if control is touched and valid', () => {
    const ctrl = new FormControl('value');
    ctrl.markAsTouched();
    componentRef.setInput('control', ctrl);
    expect(component.hasError()).toBe(false);
  });

  describe('getErrorMessage()', () => {
    it('should return the error message if the control is touched and invalid', () => {
      const ctrl = new FormControl('');
      ctrl.markAsTouched();
      ctrl.setErrors({ required: true });
      componentRef.setInput('control', ctrl);

      (getErrorMessage as jest.Mock).mockReturnValue('This field is required.');

      expect(component.errorMessage()).toBe('This field is required.');
      expect(getErrorMessage).toHaveBeenCalledWith(ctrl, 'required');
    });

    it('should return null if the control is not touched', () => {
      const ctrl = new FormControl('');
      ctrl.setErrors({ required: true });
      componentRef.setInput('control', ctrl);

      expect(component.errorMessage()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });

    it('should return null if the control is valid', () => {
      const ctrl = new FormControl('value');
      ctrl.markAsTouched();
      componentRef.setInput('control', ctrl);

      expect(component.errorMessage()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });

    it('should return null if there are no errors', () => {
      const ctrl = new FormControl('');
      ctrl.markAsTouched();
      componentRef.setInput('control', ctrl);

      expect(component.errorMessage()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });
  });
});
