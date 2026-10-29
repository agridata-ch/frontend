import { ComponentRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService, MockI18nService } from '@/shared/testing/mocks';
import { createTranslocoTestingModule } from '@/shared/testing/transloco-testing.module';

import { AgridataDatepickerCalendarComponent } from './agridata-datepicker-calendar.component';

describe('AgridataDatepickerCalendarComponent', () => {
  let fixture: ComponentFixture<AgridataDatepickerCalendarComponent>;
  let component: AgridataDatepickerCalendarComponent;
  let componentRef: ComponentRef<AgridataDatepickerCalendarComponent>;
  let i18nService: MockI18nService;

  const getDayButton = (iso: string) => {
    const host: HTMLElement = fixture.nativeElement;
    return host.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`);
  };

  const findDay = (iso: string) => component['days']().find((day) => day.iso === iso)!;

  const render = (value: string, min: string | null = null) => {
    componentRef.setInput('value', value);
    componentRef.setInput('min', min);
    fixture.detectChanges();
  };

  beforeEach(async () => {
    i18nService = createMockI18nService();
    await TestBed.configureTestingModule({
      imports: [AgridataDatepickerCalendarComponent, createTranslocoTestingModule()],
      providers: [{ provide: I18nService, useValue: i18nService }],
    }).compileComponents();

    fixture = TestBed.createComponent(AgridataDatepickerCalendarComponent);
    componentRef = fixture.componentRef;
    component = fixture.componentInstance;
  });

  describe('month view', () => {
    it('should show the month of the selected date', () => {
      render('2026-11-05');

      expect(component['monthLabel']()).toBe('November 2026');
    });

    it('should show the min month when nothing is selected', () => {
      render('', '2027-02-10');

      expect(component['monthLabel']()).toBe('Februar 2027');
    });

    it('should start the weeks on Monday and pad only the days of the month', () => {
      render('2026-11-05');

      // 1 November 2026 is a Sunday, so the first row starts on Monday 26 October.
      expect(component['days']()[0].iso).toBe('2026-10-26');
      expect(component['days']().filter((day) => day.inMonth)).toHaveLength(30);
      expect(fixture.nativeElement.querySelectorAll('[data-date]')).toHaveLength(30);
    });

    it('should switch months', () => {
      render('2026-11-05');

      component['showMonth'](1);
      expect(component['monthLabel']()).toBe('Dezember 2026');

      component['showMonth'](-2);
      expect(component['monthLabel']()).toBe('Oktober 2026');
    });

    it('should keep the shown month when value or min change while open', () => {
      render('2026-11-05');
      component['showMonth'](1);

      componentRef.setInput('value', '2027-03-01');
      componentRef.setInput('min', '2026-01-01');
      fixture.detectChanges();

      expect(component['monthLabel']()).toBe('Dezember 2026');
    });

    it('should use the language of the app for month names', () => {
      i18nService.lang.set('fr');
      render('2026-11-05');

      expect(component['monthLabel']()).toBe('novembre 2026');
    });

    it('should disable days before min', () => {
      render('2026-11-05', '2026-11-10');

      expect(getDayButton('2026-11-09')?.disabled).toBe(true);
      expect(getDayButton('2026-11-10')?.disabled).toBe(false);
    });

    it('should mark the selected day', () => {
      render('2026-11-05');

      expect(getDayButton('2026-11-05')?.getAttribute('aria-pressed')).toBe('true');
      expect(getDayButton('2026-11-06')?.getAttribute('aria-pressed')).toBe('false');
    });
  });

  describe('selecting', () => {
    it('should emit the clicked day as yyyy-MM-dd', () => {
      const emitSpy = vi.spyOn(component.handleSelect, 'emit');
      render('2026-11-05');

      getDayButton('2026-11-20')?.click();

      expect(emitSpy).toHaveBeenCalledWith('2026-11-20');
    });

    it('should not emit for a disabled day', () => {
      const emitSpy = vi.spyOn(component.handleSelect, 'emit');
      render('2026-11-12', '2026-11-10');

      getDayButton('2026-11-09')?.click();

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('keyboard', () => {
    beforeEach(() => {
      render('2026-11-05');
    });

    it('should focus the selected day when it appears', async () => {
      await fixture.whenStable();

      expect(document.activeElement).toBe(getDayButton('2026-11-05'));
    });

    it('should move to the next month when arrowing past the last day', async () => {
      component['handleDayKeydown'](
        new KeyboardEvent('keydown', { key: 'ArrowRight' }),
        findDay('2026-11-30'),
      );
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['monthLabel']()).toBe('Dezember 2026');
      expect(document.activeElement).toBe(getDayButton('2026-12-01'));
    });

    it('should not move before min', () => {
      componentRef.setInput('min', '2026-11-05');

      component['handleDayKeydown'](
        new KeyboardEvent('keydown', { key: 'ArrowLeft' }),
        findDay('2026-11-05'),
      );

      expect(component['monthLabel']()).toBe('November 2026');
    });

    it.each([
      ['Home', {}, '2026-11-02'],
      ['End', {}, '2026-11-08'],
      ['PageDown', {}, '2026-12-05'],
      ['PageUp', {}, '2026-10-05'],
      ['PageDown', { shiftKey: true }, '2027-11-05'],
    ])('should move on %s %j to %s', async (key, init, iso) => {
      component['handleDayKeydown'](
        new KeyboardEvent('keydown', { key, ...init }),
        findDay('2026-11-05'),
      );
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

    it('should ignore other keys', () => {
      const event = new KeyboardEvent('keydown', { key: 'a', cancelable: true });

      component['handleDayKeydown'](event, component['days']()[10]);

      expect(event.defaultPrevented).toBe(false);
    });
  });

  describe('max year 2999', () => {
    beforeEach(() => {
      render('2999-12-30');
    });

    it('should disable next month in December 2999 only', () => {
      expect(component['isNextMonthDisabled']()).toBe(true);

      component['showMonth'](-1);

      expect(component['isNextMonthDisabled']()).toBe(false);
    });

    it('should not move past 2999-12-31 with the keyboard', () => {
      component['handleDayKeydown'](
        new KeyboardEvent('keydown', { key: 'ArrowRight' }),
        findDay('2999-12-31'),
      );

      expect(component['monthLabel']()).toBe('Dezember 2999');
    });

    it('should keep 2999-12-31 selectable', () => {
      expect(getDayButton('2999-12-31')?.disabled).toBe(false);
    });
  });

  describe('min year 1900', () => {
    beforeEach(() => {
      render('1900-01-02');
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
      component['handleDayKeydown'](
        new KeyboardEvent('keydown', { key: 'ArrowLeft' }),
        findDay('1900-01-01'),
      );

      expect(component['monthLabel']()).toBe('Januar 1900');
    });

    it('should let a later min win over 1900', () => {
      componentRef.setInput('min', '1900-01-15');

      expect(component['isPrevMonthDisabled']()).toBe(true);
      expect(findDay('1900-01-14').disabled).toBe(true);
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

    it('should jump back to the current month and focus today without selecting it', async () => {
      const emitSpy = vi.spyOn(component.handleSelect, 'emit');
      render('2026-11-05');

      component['goToToday']();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component['monthLabel']()).toBe('Juni 2026');
      expect(document.activeElement).toBe(getDayButton('2026-06-15'));
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it.each([
      ['no min', null, false],
      ['min today', '2026-06-15', false],
      ['min tomorrow', '2026-06-16', true],
    ])('should compute isTodayDisabled for %s', (_label, min, expected) => {
      render('', min);

      expect(component['isTodayDisabled']()).toBe(expected);
    });
  });
});
