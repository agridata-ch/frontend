import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipDirective } from './tooltip.directive';

@Component({
  imports: [TooltipDirective],
  template: `<button id="trigger" [appTooltip]="label()" [tooltipShowDelay]="0" title="native">
    x
  </button>`,
})
class TestHostComponent {
  readonly label = signal('Bold');
}

function tooltip(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]');
}

describe('TooltipDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: HTMLButtonElement;

  beforeEach(async () => {
    jest.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.nativeElement.querySelector('#trigger');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  it('should strip the native title attribute so the browser tooltip never fires', () => {
    expect(host.getAttribute('title')).toBeNull();
  });

  it('should show a tooltip on mouseenter', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();

    const el = tooltip();
    expect(el).not.toBeNull();
    expect(el?.textContent).toContain('Bold');
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show a tooltip on keyboard focus', () => {
    host.dispatchEvent(new FocusEvent('focusin'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();

    expect(tooltip()).not.toBeNull();
  });

  it('should hide the tooltip on Escape', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should hide the tooltip on mouseleave', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    host.dispatchEvent(new MouseEvent('mouseleave'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should hide the tooltip on click', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    host.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should remove the tooltip element on destroy', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    jest.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    fixture.destroy();

    expect(tooltip()).toBeNull();
  });
});
