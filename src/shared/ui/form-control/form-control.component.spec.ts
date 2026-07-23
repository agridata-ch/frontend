import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

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
    fixture.detectChanges();
    expect(component['hasError']()).toBe(true);
  });

  it('should return false from hasError() if control is untouched', () => {
    const ctrl = new FormControl('');
    componentRef.setInput('control', ctrl);
    fixture.detectChanges();
    expect(component['hasError']()).toBe(false);
  });

  it('should return false from hasError() if control is touched and valid', () => {
    const ctrl = new FormControl('value');
    ctrl.markAsTouched();
    componentRef.setInput('control', ctrl);
    fixture.detectChanges();
    expect(component['hasError']()).toBe(false);
  });

  it('should reactively update hasError() when the control is touched after first render', () => {
    // Regression: under zoneless change detection, markAllAsTouched()/blur mutate only the
    // control's touched state, which is not a signal. hasError() must still update via the
    // control.events subscription rather than staying at its initial value.
    const ctrl = new FormControl('', Validators.required);
    componentRef.setInput('control', ctrl);
    fixture.detectChanges(); // runs the effect so it subscribes to control.events

    expect(component['hasError']()).toBe(false);

    ctrl.markAsTouched(); // emits a TouchedChangeEvent -> subscription updates the signal

    expect(component['hasError']()).toBe(true);
  });

  describe('isDisabled()', () => {
    it('should be true when the disabled input is set', () => {
      componentRef.setInput('control', new FormControl('value'));
      componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(component['isDisabled']()).toBe(true);
    });

    it('should reflect the bound control being disabled without the disabled input', () => {
      const ctrl = new FormControl('value');
      componentRef.setInput('control', ctrl);
      fixture.detectChanges(); // subscribes to control.events

      expect(component['isDisabled']()).toBe(false);

      ctrl.disable(); // emits a StatusChangeEvent -> subscription updates the signal

      expect(component['isDisabled']()).toBe(true);
    });

    it('should update back to false when the control is re-enabled', () => {
      const ctrl = new FormControl({ value: 'value', disabled: true });
      componentRef.setInput('control', ctrl);
      fixture.detectChanges();

      expect(component['isDisabled']()).toBe(true);

      ctrl.enable();

      expect(component['isDisabled']()).toBe(false);
    });
  });

  describe('getErrorMessage()', () => {
    it('should return the error message if the control is touched and invalid', () => {
      const ctrl = new FormControl('');
      ctrl.markAsTouched();
      ctrl.setErrors({ required: true });
      componentRef.setInput('control', ctrl);

      (getErrorMessage as jest.Mock).mockReturnValue('This field is required.');
      fixture.detectChanges();

      expect(component['errorMessage']()).toBe('This field is required.');
      expect(getErrorMessage).toHaveBeenCalledWith(ctrl, 'required');
    });

    it('should return null if the control is not touched', () => {
      const ctrl = new FormControl('');
      ctrl.setErrors({ required: true });
      componentRef.setInput('control', ctrl);
      fixture.detectChanges();

      expect(component['errorMessage']()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });

    it('should return null if the control is valid', () => {
      const ctrl = new FormControl('value');
      ctrl.markAsTouched();
      componentRef.setInput('control', ctrl);
      fixture.detectChanges();

      expect(component['errorMessage']()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });

    it('should return null if there are no errors', () => {
      const ctrl = new FormControl('');
      ctrl.markAsTouched();
      componentRef.setInput('control', ctrl);
      fixture.detectChanges();

      expect(component['errorMessage']()).toBeNull();
      expect(getErrorMessage).not.toHaveBeenCalled();
    });
  });
});
