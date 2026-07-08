import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit handleClick event on onButtonClick', () => {
    const clickSpy = jest.spyOn(component.handleClick, 'emit');
    const event = new MouseEvent('click');
    component.onButtonClick(event);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('should not emit handleClick on onButtonClick while disabled', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const clickSpy = jest.spyOn(component.handleClick, 'emit');
    component.onButtonClick(new MouseEvent('click'));

    expect(clickSpy).not.toHaveBeenCalled();
  });

  const getButton = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button')).nativeElement;

  it('should be enabled when neither disabled nor loading', () => {
    expect(getButton().getAttribute('aria-disabled')).toBeNull();
  });

  it('should be disabled while loading even when disabled is false', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();

    expect(getButton().getAttribute('aria-disabled')).toBe('true');
  });

  it('should show the success state when success is true and not loading', () => {
    fixture.componentRef.setInput('success', true);
    fixture.detectChanges();

    const button = getButton();
    expect(button.getAttribute('aria-disabled')).toBe('true');
    expect(button.classList).toContain('success');
    expect(fixture.debugElement.query(By.css('svg.success-check'))).toBeTruthy();
  });

  it('should let loading win over success', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.componentRef.setInput('success', true);
    fixture.detectChanges();

    expect(getButton().classList).not.toContain('success');
    expect(fixture.debugElement.query(By.css('svg.success-check'))).toBeNull();
    expect(fixture.debugElement.query(By.css('.loading-spinner, fa-icon'))).toBeTruthy();
  });

  describe('accessibility', () => {
    it('should keep the default tabindex when enabled', () => {
      expect(getButton().getAttribute('tabindex')).toBe('0');
    });

    it('should remove a disabled button from the tab order', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();

      expect(getButton().getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('tooltip', () => {
    const getTooltip = (): HTMLElement | null => document.body.querySelector('[role="tooltip"]');

    // The directive shows after tooltipShowDelay (250ms); advance fake timers past it, then flush
    // the render effect so the tooltip element is created.
    async function hover(el: HTMLElement): Promise<void> {
      await fixture.whenStable();
      el.dispatchEvent(new MouseEvent('mouseenter'));
      jest.advanceTimersByTime(300);
      await fixture.whenStable();
      fixture.detectChanges();
    }

    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      getTooltip()?.remove();
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('should show an explicit tooltip on the button on mouseenter', async () => {
      fixture.componentRef.setInput('tooltip', 'Delete item');
      fixture.detectChanges();

      await hover(getButton());

      expect(getTooltip()?.textContent).toContain('Delete item');
    });

    it('should fall back to the aria-label as tooltip text while keeping aria-label on the button', async () => {
      fixture.componentRef.setInput('ariaLabel', 'Download');
      fixture.detectChanges();

      await hover(getButton());

      expect(getButton().getAttribute('aria-label')).toBe('Download');
      expect(getTooltip()?.textContent).toContain('Download');
    });

    it('should show the disabledInfo tooltip on the button when disabled', async () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.componentRef.setInput('disabledInfo', 'Draft limit reached');
      fixture.detectChanges();

      const button = getButton();
      expect(button.getAttribute('aria-disabled')).toBe('true');

      await hover(button);

      expect(getTooltip()?.textContent).toContain('Draft limit reached');
    });
  });
});
