import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

import { I18nService } from '@/shared/i18n';
import { FormControlWithMessages } from '@/shared/lib/form.helper';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import {
  AgridataDatepickerComponent,
  maskDate,
  maskSegments,
} from './agridata-datepicker.component';

describe('AgridataDatepickerComponent', () => {
  let fixture: ComponentFixture<AgridataDatepickerComponent>;
  let component: AgridataDatepickerComponent;
  let componentRef: ComponentRef<AgridataDatepickerComponent>;
  let control: FormControlWithMessages;
  let i18nService: MockI18nService;

  const getDayButton = (iso: string) => {
    const host: HTMLElement = fixture.nativeElement;
    return host.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`);
  };

  const openCalendar = () => {
    component['toggleCalendar']();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    i18nService = createMockI18nService();
    await TestBed.configureTestingModule({
      imports: [AgridataDatepickerComponent, ReactiveFormsModule, createTranslocoTestingModule()],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    control = new FormControl('');
    fixture = TestBed.createComponent(AgridataDatepickerComponent);
    componentRef = fixture.componentRef;
    component = fixture.componentInstance;
    componentRef.setInput('control', control);
    fixture.detectChanges();
  });

  describe('display', () => {
    it('should show nothing for an empty control', () => {
      expect(component['displayValue']()).toBeUndefined();
    });

    it('should show the control value as dd.MM.yyyy', () => {
      control.setValue('2026-11-05');
      fixture.detectChanges();

      expect(component['displayValue']()).toBe('05.11.2026');
    });
  });

  describe('calendar', () => {
    beforeEach(() => {
      control.setValue('2026-11-05');
    });

    it('should open on the month of the selected date and close again', () => {
      openCalendar();

      expect(component['isOpen']()).toBe(true);
      expect(component['monthLabel']()).toBe('November 2026');

      component['toggleCalendar']();
      expect(component['isOpen']()).toBe(false);
    });

    it('should start the weeks on Monday and pad only the days of the month', () => {
      openCalendar();

      // 1 November 2026 is a Sunday, so the first row starts on Monday 26 October.
      expect(component['days']()[0].iso).toBe('2026-10-26');
      expect(component['days']().filter((day) => day.inMonth)).toHaveLength(30);
      expect(fixture.nativeElement.querySelectorAll('[data-date]')).toHaveLength(30);
    });

    it('should switch months', () => {
      openCalendar();

      component['showMonth'](1);
      expect(component['monthLabel']()).toBe('Dezember 2026');

      component['showMonth'](-2);
      expect(component['monthLabel']()).toBe('Oktober 2026');
    });

    it('should use the language of the app for month names', () => {
      i18nService.lang.set('fr');
      openCalendar();

      expect(component['monthLabel']()).toBe('novembre 2026');
    });

    it('should open on the min month when nothing is selected', () => {
      control.setValue('');
      componentRef.setInput('min', '2027-02-10');
      openCalendar();

      expect(component['monthLabel']()).toBe('Februar 2027');
    });

    it('should disable days before min', () => {
      componentRef.setInput('min', '2026-11-10');
      openCalendar();

      expect(getDayButton('2026-11-09')?.disabled).toBe(true);
      expect(getDayButton('2026-11-10')?.disabled).toBe(false);
    });

    it('should mark the selected day', () => {
      openCalendar();

      const selectedOf = (iso: string) => getDayButton(iso)?.getAttribute('aria-pressed');

      expect(selectedOf('2026-11-05')).toBe('true');
      expect(selectedOf('2026-11-06')).toBe('false');
    });
  });

  describe('maskDate', () => {
    it.each([
      ['', ''],
      ['1', '1'],
      ['12', '12'],
      ['120', '12.0'],
      ['12062026', '12.06.2026'],
      ['12.06.2026', '12.06.2026'],
      ['5', '05'],
      ['1306', '13.06'],
      ['1326', '13.02'],
      ['12063', '12.06'],
      ['120618', '12.06.1'],
      ['1206190', '12.06.190'],
      ['12061899', '12.06.199'],
      ['12061900', '12.06.1900'],
      ['12062999', '12.06.2999'],
      ['12063000', '12.06'],
      ['32', '3'],
      ['00', '0'],
      ['3112', '31.12'],
      ['3113', '31.1'],
      ['1200', '12.0'],
      ['ab1c2', '12'],
      ['1206202612', '12.06.2026'],
    ])('should turn %j into %j', (raw, expected) => {
      expect(maskDate(raw)).toBe(expected);
    });

    it('should format the input while typing', () => {
      const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

      input.value = '12062026';
      input.dispatchEvent(new Event('input'));

      expect(input.value).toBe('12.06.2026');
      expect(component['text']()).toBe('12.06.2026');
    });
  });

  describe('typing', () => {
    const type = (text: string) => {
      component['text'].set(text);
      component['commitText']();
    };

    it.each([
      ['05.11.2026', '2026-11-05'],
      ['5.1.2027', '2027-01-05'],
      ['31.12.2999', '2999-12-31'],
      ['01.01.1900', '1900-01-01'],
    ])('should write %s as %s and normalise the text', (text, iso) => {
      type(text);

      expect(control.value).toBe(iso);
      expect(control.touched).toBe(true);
      expect(component['text']()).toBe(component['displayValue']());
    });

    it.each(['31.02.2026', '05.11.26', 'abc', '01.01.3000', '31.12.1899'])(
      'should write an empty value for %s',
      (text) => {
        control.setValue('2026-11-05');

        type(text);

        expect(control.value).toBe('');
        expect(component['text']()).toBe(text);
      },
    );

    it('should keep a date before min so the consumer validator can report it', () => {
      componentRef.setInput('min', '2026-11-10');

      type('01.01.1987');

      expect(control.value).toBe('1987-01-01');
      expect(component['text']()).toBe('01.01.1987');
    });

    it('should show a value set on the control in the text field', () => {
      control.setValue('2026-11-20');

      expect(component['text']()).toBe('20.11.2026');
    });
  });

  describe('maskSegments', () => {
    it.each([
      ['15.0.2025', '15.0.2025'],
      ['15..2025', '15..2025'],
      ['15.07.2025', '15.07.2025'],
      ['1a5.06.2025', '15.06.2025'],
    ])('should keep %j', (raw, expected) => {
      expect(maskSegments(raw, 3, false)).toBe(expected);
    });

    it.each([
      ['15.06.20255', 3, false],
      ['1506.2025', 3, false],
      ['15.06..2025', 3, false],
      ['151.06.2025', 3, false],
      ['32.06.2025', 3, false],
      ['00.06.2025', 3, false],
      ['15.13.2025', 3, false],
      ['15.06.3000', 3, false],
      ['15.06.0', 3, false],
    ])('should undo %j', (raw, parts, mayLoseDot) => {
      expect(maskSegments(raw, parts, mayLoseDot)).toBeUndefined();
    });

    it('should let a delete at the end drop the trailing dot', () => {
      expect(maskSegments('15.0', 3, true)).toBe('15.0');
    });
  });

  describe('segment editing', () => {
    const getInput = (): HTMLInputElement => {
      const host: HTMLElement = fixture.nativeElement;
      const input = host.querySelector('input');
      if (!input) throw new Error('input not found');
      return input;
    };

    const edit = (value: string, caret: number, inputType: string) => {
      const input = getInput();
      input.value = value;
      input.setSelectionRange(caret, caret);
      input.dispatchEvent(new InputEvent('input', { inputType }));
      return input;
    };

    const press = (key: string, shiftKey = false) => {
      const event = new KeyboardEvent('keydown', { key, shiftKey, cancelable: true });
      getInput().dispatchEvent(event);
      return event;
    };

    const select = (start: number, end: number = start) => {
      getInput().setSelectionRange(start, end);
    };

    beforeEach(() => {
      control.setValue('2025-06-15');
      fixture.detectChanges();
    });

    it('should keep day and year when the month digit is deleted', () => {
      const input = edit('15.0.2025', 4, 'deleteContentBackward');

      expect(component['text']()).toBe('15.0.2025');
      expect(input.value).toBe('15.0.2025');
      expect(input.selectionStart).toBe(4);
    });

    it('should keep day and month when a year digit is deleted in the middle', () => {
      edit('15.06.205', 8, 'deleteContentBackward');

      expect(component['text']()).toBe('15.06.205');
    });

    it('should clear one segment and keep the others', () => {
      edit('15..2025', 3, 'deleteContentBackward');

      expect(component['text']()).toBe('15..2025');
    });

    it('should type a new month digit without touching day and year', () => {
      edit('15.0.2025', 4, 'deleteContentBackward');
      edit('15.07.2025', 5, 'insertText');

      expect(component['text']()).toBe('15.07.2025');
    });

    it('should drop a digit typed into a full segment', () => {
      const input = edit('151.06.2025', 3, 'insertText');

      expect(component['text']()).toBe('15.06.2025');
      expect(input.selectionStart).toBe(2);
    });

    it('should drop a digit that makes a segment impossible', () => {
      edit('15.16.2025', 4, 'insertText');

      expect(component['text']()).toBe('15.06.2025');
    });

    it('should not delete a dot', () => {
      const input = edit('1506.2025', 2, 'deleteContentBackward');

      expect(component['text']()).toBe('15.06.2025');
      expect(input.selectionStart).toBe(2);
    });

    it('should clear everything when all text is deleted', () => {
      edit('', 0, 'deleteContentBackward');

      expect(component['text']()).toBe('');
    });

    it('should let a delete at the end walk back over a trailing dot', () => {
      component['text'].set('15.06.');
      edit('15.06', 5, 'deleteContentBackward');

      expect(component['text']()).toBe('15.06');
    });

    it('should still format digits typed one after another', () => {
      component['text'].set('');
      edit('1', 1, 'insertText');
      edit('15', 2, 'insertText');
      edit('150', 3, 'insertText');
      edit('15.06', 5, 'insertText');
      edit('15.062', 6, 'insertText');

      expect(component['text']()).toBe('15.06.2');
    });

    it('should select the segment that is clicked', () => {
      select(4);
      getInput().dispatchEvent(new MouseEvent('click'));

      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([3, 5]);
    });

    it('should not select a segment when text is selected by hand', () => {
      select(1, 4);
      getInput().dispatchEvent(new MouseEvent('click'));

      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([1, 4]);
    });

    it('should not select a segment of text that is still being typed', () => {
      component['text'].set('15.06');
      fixture.detectChanges();
      select(4);
      getInput().dispatchEvent(new MouseEvent('click'));

      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([4, 4]);
    });

    it('should move to the next and previous segment with Tab and Shift+Tab', () => {
      select(0, 2);

      expect(press('Tab').defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([3, 5]);
      expect(press('Tab').defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([6, 10]);
      expect(press('Tab', true).defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([3, 5]);
    });

    it('should let Tab leave the field from the last segment and Shift+Tab from the first', () => {
      select(6, 10);
      expect(press('Tab').defaultPrevented).toBe(false);

      select(0, 2);
      expect(press('Tab', true).defaultPrevented).toBe(false);
    });

    it('should start with the day when Tab comes in with everything selected', () => {
      select(0, 10);

      expect(press('Tab').defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([0, 2]);
    });

    it('should move with the arrow keys only from the edge of a segment', () => {
      select(1);
      expect(press('ArrowRight').defaultPrevented).toBe(false);

      select(2);
      expect(press('ArrowRight').defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([3, 5]);

      select(3);
      expect(press('ArrowLeft').defaultPrevented).toBe(true);
      expect([getInput().selectionStart, getInput().selectionEnd]).toEqual([0, 2]);
    });

    it('should leave the arrow keys alone at the first and last segment', () => {
      select(0);
      expect(press('ArrowLeft').defaultPrevented).toBe(false);

      select(10);
      expect(press('ArrowRight').defaultPrevented).toBe(false);
    });

    it('should leave Tab alone in text that is still being typed', () => {
      component['text'].set('15.06');
      fixture.detectChanges();

      expect(press('Tab').defaultPrevented).toBe(false);
    });
  });

  describe('invalid date', () => {
    const type = (text: string) => {
      component['text'].set(text);
      component['commitText']();
    };

    it.each(['31.04.2025', '30.02.2025', '29.02.2025', '31.06.2026', '15..2025', '15.0.2025'])(
      'should give the control an invalidDate error for %s',
      (text) => {
        type(text);

        expect(control.errors).toEqual({ invalidDate: true });
        expect(control.value).toBe('');
      },
    );

    it.each([
      ['29.02.2024', '2024-02-29'],
      ['29.02.2000', '2000-02-29'],
      ['30.04.2025', '2025-04-30'],
    ])('should accept %s', (text, iso) => {
      type(text);

      expect(control.errors).toBeNull();
      expect(control.value).toBe(iso);
    });

    it('should keep the typed text so one digit can be fixed', () => {
      type('31.04.2025');

      expect(component['text']()).toBe('31.04.2025');
    });

    it('should clear the error once the date is fixed', () => {
      type('29.02.2025');
      type('28.02.2025');

      expect(control.errors).toBeNull();
    });

    it('should clear the error when a day is picked', () => {
      type('31.04.2025');
      openCalendar();
      getDayButton('2026-11-05')?.click();

      expect(control.errors).toBeNull();
    });

    it('should not report an empty field', () => {
      type('');

      expect(control.errors).toBeNull();
    });

    it('should report invalidDate before required', () => {
      control.addValidators(Validators.required);

      type('31.04.2025');

      expect(Object.keys(control.errors ?? {})[0]).toBe('invalidDate');
    });

    it('should still report required for an empty field', () => {
      control.addValidators(Validators.required);

      type('');

      expect(control.errors).toEqual({ required: true });
    });

    it('should provide the error message', () => {
      expect(control.errorMessages?.['invalidDate']?.()).toBeTypeOf('string');
    });

    it('should keep the consumer error messages', () => {
      const next = new FormControl('') as FormControlWithMessages;
      next.errorMessages = { required: () => 'required' };

      componentRef.setInput('control', next);
      fixture.detectChanges();

      expect(next.errorMessages['required']()).toBe('required');
      expect(next.errorMessages['invalidDate']).toBeTypeOf('function');
    });
  });

  describe('max year 2999', () => {
    beforeEach(() => {
      control.setValue('2999-12-30');
      openCalendar();
    });

    it('should disable next month in December 2999 only', () => {
      expect(component['isNextMonthDisabled']()).toBe(true);

      component['showMonth'](-1);

      expect(component['isNextMonthDisabled']()).toBe(false);
    });

    it('should not move past 2999-12-31 with the keyboard', () => {
      const last = component['days']().find((day) => day.iso === '2999-12-31')!;

      component['handleDayKeydown'](new KeyboardEvent('keydown', { key: 'ArrowRight' }), last);

      expect(component['monthLabel']()).toBe('Dezember 2999');
    });

    it('should keep 2999-12-31 selectable', () => {
      expect(getDayButton('2999-12-31')?.disabled).toBe(false);
    });
  });

  describe('min year 1900', () => {
    beforeEach(() => {
      control.setValue('1900-01-02');
      openCalendar();
    });

    it('should disable days before 1900-01-01 and keep 1900-01-01 selectable', () => {
      component['showMonth'](-1);

      expect(getDayButton('1900-01-01')?.disabled).toBe(false);
      expect(getDayButton('1899-12-31')).toBeNull();
    });

    it('should disable previous month in January 1900 only', () => {
      expect(component['isPrevMonthDisabled']()).toBe(true);

      component['showMonth'](1);

      expect(component['isPrevMonthDisabled']()).toBe(false);
    });

    it('should not move before 1900-01-01 with the keyboard', () => {
      const first = component['days']().find((day) => day.iso === '1900-01-01')!;

      component['handleDayKeydown'](new KeyboardEvent('keydown', { key: 'ArrowLeft' }), first);

      expect(component['monthLabel']()).toBe('Januar 1900');
    });

    it('should let a later min win over 1900', () => {
      componentRef.setInput('min', '1900-01-15');

      expect(component['isPrevMonthDisabled']()).toBe(true);
      expect(component['days']().find((day) => day.iso === '1900-01-14')?.disabled).toBe(true);
    });
  });

  describe('view mode', () => {
    it.each([
      ['2026-11-05', '05.11.2026'],
      ['', '-'],
    ])('should show %j as %j', (value, expected) => {
      control.setValue(value);
      componentRef.setInput('isViewMode', true);
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent.trim()).toBe(expected);
      expect(fixture.nativeElement.querySelector('input')).toBeNull();
    });
  });

  describe('selecting', () => {
    it('should write the day as yyyy-MM-dd, mark the control touched and close', () => {
      control.setValue('2026-11-05');
      openCalendar();

      getDayButton('2026-11-20')?.click();
      fixture.detectChanges();

      expect(control.value).toBe('2026-11-20');
      expect(control.touched).toBe(true);
      expect(component['isOpen']()).toBe(false);
      expect(component['displayValue']()).toBe('20.11.2026');
    });

    it('should not select a disabled day', () => {
      componentRef.setInput('min', '2026-11-10');
      control.setValue('2026-11-12');
      openCalendar();

      getDayButton('2026-11-09')?.click();

      expect(control.value).toBe('2026-11-12');
      expect(component['isOpen']()).toBe(true);
    });
  });

  describe('keyboard and dismissal', () => {
    beforeEach(() => {
      control.setValue('2026-11-05');
      openCalendar();
    });

    it('should move to the next month when arrowing past the last day', async () => {
      const last = component['days']().find((day) => day.iso === '2026-11-30')!;

      component['handleDayKeydown'](new KeyboardEvent('keydown', { key: 'ArrowRight' }), last);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['monthLabel']()).toBe('Dezember 2026');
      expect(document.activeElement).toBe(getDayButton('2026-12-01'));
    });

    it('should not move before min', () => {
      componentRef.setInput('min', '2026-11-05');
      const first = component['days']().find((day) => day.iso === '2026-11-05')!;

      component['handleDayKeydown'](new KeyboardEvent('keydown', { key: 'ArrowLeft' }), first);

      expect(component['monthLabel']()).toBe('November 2026');
    });

    it.each([
      ['Home', {}, '2026-11-02'],
      ['End', {}, '2026-11-08'],
      ['PageDown', {}, '2026-12-05'],
      ['PageUp', {}, '2026-10-05'],
      ['PageDown', { shiftKey: true }, '2027-11-05'],
    ])('should move on %s %j to %s', async (key, init, iso) => {
      const day = component['days']().find((d) => d.iso === '2026-11-05')!;

      component['handleDayKeydown'](new KeyboardEvent('keydown', { key, ...init }), day);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(getDayButton(iso));
    });

    it('should make the focused day the only tab stop', () => {
      expect(getDayButton('2026-11-05')?.tabIndex).toBe(0);

      getDayButton('2026-11-12')?.focus();
      fixture.detectChanges();

      expect(getDayButton('2026-11-12')?.tabIndex).toBe(0);
      expect(getDayButton('2026-11-05')?.tabIndex).toBe(-1);
    });

    it('should return the tab stop to the selected day when reopened', () => {
      getDayButton('2026-11-12')?.focus();
      component['toggleCalendar']();
      openCalendar();

      expect(component['focusableIso']()).toBe('2026-11-05');
    });

    it('should close when focus leaves the component', () => {
      const outside = document.createElement('button');

      component['handleFocusOut'](
        new FocusEvent('focusout', { relatedTarget: outside }),
        fixture.nativeElement,
      );

      expect(component['isOpen']()).toBe(false);
    });

    it('should stay open when focus moves within the component', () => {
      component['handleFocusOut'](
        new FocusEvent('focusout', { relatedTarget: getDayButton('2026-11-06') }),
        fixture.nativeElement,
      );

      expect(component['isOpen']()).toBe(true);
    });

    it('should ignore other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });
      const day = component['days']()[10];

      component['handleDayKeydown'](event, day);

      expect(event.defaultPrevented).toBe(false);
    });

    it('should wrap Tab from the last day to the first control', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
      const buttons = fixture.nativeElement.querySelectorAll('dialog button:not([tabindex="-1"])');
      getDayButton('2026-11-05')?.focus();

      component['handleDialogTab'](event, false);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(buttons[0]);
    });

    it('should wrap Shift+Tab from the first control to the last day', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, cancelable: true });
      const buttons = fixture.nativeElement.querySelectorAll('dialog button:not([tabindex="-1"])');
      buttons[0].focus();

      component['handleDialogTab'](event, true);

      expect(event.defaultPrevented).toBe(true);
      expect(document.activeElement).toBe(getDayButton('2026-11-05'));
    });

    it('should leave Tab alone in the middle of the calendar', () => {
      const event = new KeyboardEvent('keydown', { key: 'Tab', cancelable: true });
      fixture.nativeElement.querySelector('dialog button')?.focus();

      component['handleDialogTab'](event, false);

      expect(event.defaultPrevented).toBe(false);
    });

    it('should close on escape', () => {
      component['handleEscape'](new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(component['isOpen']()).toBe(false);
    });

    it('should close on a click outside', () => {
      document.body.click();

      expect(component['isOpen']()).toBe(false);
    });
  });

  describe('today', () => {
    beforeEach(() => {
      vi.useFakeTimers({ toFake: ['Date'] });
      vi.setSystemTime(new Date(2026, 5, 15));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should jump back to the current month and focus today', async () => {
      control.setValue('2026-11-05');
      openCalendar();
      expect(component['monthLabel']()).toBe('November 2026');

      component['goToToday']();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['monthLabel']()).toBe('Juni 2026');
      expect(document.activeElement).toBe(getDayButton('2026-06-15'));
    });

    it('should not select today when jumping to it', () => {
      control.setValue('2026-11-05');
      openCalendar();

      component['goToToday']();

      expect(control.value).toBe('2026-11-05');
    });

    it.each([
      ['no min', null, false],
      ['min today', '2026-06-15', false],
      ['min tomorrow', '2026-06-16', true],
    ])('should compute isTodayDisabled for %s', (_label, min, expected) => {
      componentRef.setInput('min', min);

      expect(component['isTodayDisabled']()).toBe(expected);
    });
  });
});
