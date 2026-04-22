import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';

import { AgridataDigitInputComponent } from './agridata-digit-input.component';

describe('AgridataDigitInputComponent', () => {
  let component: AgridataDigitInputComponent;
  let fixture: ComponentFixture<AgridataDigitInputComponent>;
  let control: FormControl;

  beforeEach(async () => {
    control = new FormControl('');

    await TestBed.configureTestingModule({
      imports: [AgridataDigitInputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataDigitInputComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('length', 6);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 6 input boxes by default', () => {
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');

    expect(inputs.length).toBe(6);
  });

  it('should render the correct number of inputs when length is set', () => {
    fixture.componentRef.setInput('length', 4);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input');
    expect(inputs.length).toBe(4);
  });

  describe('hasError', () => {
    it('should return false when control is untouched', () => {
      control.setErrors({ required: true });
      expect(component['hasError']()).toBe(false);
    });

    it('should return true when control is touched and invalid', () => {
      control.setErrors({ required: true });
      control.markAsTouched();
      expect(component['hasError']()).toBe(true);
    });

    it('should return false when control is touched and valid', () => {
      control.setErrors(null);
      control.markAsTouched();
      expect(component['hasError']()).toBe(false);
    });
  });

  describe('onDigitInput', () => {
    it('should set only the last digit and sync the control value', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      const inputEl = inputs[0];
      inputEl.value = '5';

      component['onDigitInput'](0, { target: inputEl } as unknown as Event);
      fixture.detectChanges();

      expect(control.value).toBe('5');
    });

    it('should strip non-numeric characters', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      const inputEl = inputs[0];
      inputEl.value = 'a';

      component['onDigitInput'](0, { target: inputEl } as unknown as Event);

      expect(inputEl.value).toBe('');
      expect(control.value).toBe('');
    });

    it('should advance focus to the next box after valid digit entry', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[0].value = '3';

      const focusSpy = jest.spyOn(inputs[1], 'focus');
      component['onDigitInput'](0, { target: inputs[0] } as unknown as Event);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should not advance focus on the last box', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      const lastIndex = inputs.length - 1;
      inputs[lastIndex].value = '7';

      // No next box to spy on — just verify no error is thrown
      expect(() =>
        component['onDigitInput'](lastIndex, { target: inputs[lastIndex] } as unknown as Event),
      ).not.toThrow();
    });
  });

  describe('onDigitKeydown', () => {
    it('should clear the current box and sync on Backspace', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[1].value = '5';
      control.setValue('_5____');

      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      Object.defineProperty(event, 'target', { value: inputs[1] });

      component['onDigitKeydown'](1, event);

      expect(inputs[1].value).toBe('');
    });

    it('should move focus to the previous box on Backspace when current box is empty', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[1].value = '';

      const focusSpy = jest.spyOn(inputs[0], 'focus');
      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      Object.defineProperty(event, 'target', { value: inputs[1] });

      component['onDigitKeydown'](1, event);

      expect(focusSpy).toHaveBeenCalled();
    });

    it('should not navigate back on Backspace when already on the first box', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[0].value = '';

      const event = new KeyboardEvent('keydown', { key: 'Backspace' });
      Object.defineProperty(event, 'target', { value: inputs[0] });

      expect(() => component['onDigitKeydown'](0, event)).not.toThrow();
    });

    it('should submit the closest form on Enter', () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      const form = document.createElement('form');
      const requestSubmitSpy = jest.spyOn(form, 'requestSubmit').mockImplementation(() => {});
      const closestSpy = jest
        .spyOn(inputs[0], 'closest')
        .mockReturnValue(form as unknown as Element);

      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      Object.defineProperty(event, 'target', { value: inputs[0] });

      component['onDigitKeydown'](0, event);

      expect(closestSpy).toHaveBeenCalledWith('form');
      expect(requestSubmitSpy).toHaveBeenCalled();
    });
  });

  describe('onDigitPaste', () => {
    const makeClipboardEvent = (text: string): ClipboardEvent => {
      const event = {
        preventDefault: jest.fn(),
        clipboardData: { getData: () => text },
      } as unknown as ClipboardEvent;
      return event;
    };

    it('should fill boxes from pasted numeric text', () => {
      const event = makeClipboardEvent('123456');
      component['onDigitPaste'](event);
      fixture.detectChanges();

      expect(control.value).toBe('123456');
    });

    it('should strip non-numeric characters from paste', () => {
      const event = makeClipboardEvent('1a2b3c');
      component['onDigitPaste'](event);
      fixture.detectChanges();

      expect(control.value).toBe('123');
    });

    it('should truncate paste to the configured length', () => {
      const event = makeClipboardEvent('12345678');
      component['onDigitPaste'](event);
      fixture.detectChanges();

      expect(control.value).toBe('123456');
    });

    it('should call preventDefault on paste', () => {
      const event = makeClipboardEvent('123');
      component['onDigitPaste'](event);

      expect(event.preventDefault).toHaveBeenCalled();
    });
  });

  describe('valueChangeEffect', () => {
    it('should clear all boxes when control value is reset to empty string', async () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[0].value = '1';
      inputs[1].value = '2';

      control.setValue('');
      fixture.detectChanges();
      await fixture.whenStable();

      inputs.forEach((input) => expect(input.value).toBe(''));
    });

    it('should clear all boxes when control value is reset to null', async () => {
      const inputs: NodeListOf<HTMLInputElement> = fixture.nativeElement.querySelectorAll('input');
      inputs[0].value = '9';

      control.setValue(null);
      fixture.detectChanges();
      await fixture.whenStable();

      inputs.forEach((input) => expect(input.value).toBe(''));
    });
  });
});
