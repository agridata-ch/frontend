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
    vi.useFakeTimers();
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
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should strip the native title attribute so the browser tooltip never fires', () => {
    expect(host.getAttribute('title')).toBeNull();
  });

  it('should show a tooltip on mouseenter', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();

    const el = tooltip();
    expect(el).not.toBeNull();
    expect(el?.textContent).toContain('Bold');
    expect(el?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should show a tooltip on keyboard focus', () => {
    host.dispatchEvent(new FocusEvent('focusin'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();

    expect(tooltip()).not.toBeNull();
  });

  it('should hide the tooltip on Escape', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should hide the tooltip on mouseleave', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    host.dispatchEvent(new MouseEvent('mouseleave'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should hide the tooltip on click', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    host.dispatchEvent(new MouseEvent('click'));
    fixture.detectChanges();

    expect(tooltip()).toBeNull();
  });

  it('should remove the tooltip element on destroy', () => {
    host.dispatchEvent(new MouseEvent('mouseenter'));
    vi.runOnlyPendingTimers();
    fixture.detectChanges();
    expect(tooltip()).not.toBeNull();

    fixture.destroy();

    expect(tooltip()).toBeNull();
  });
});

@Component({
  imports: [TooltipDirective],
  template: `
    <div (click)="parentClicks.update((count) => count + 1)">
      <span id="badge" [appTooltip]="label()">Public sector</span>
    </div>
    <span id="icon" [appTooltip]="label()"></span>
    <span id="truncated" appTooltip="Full title">Full title</span>
    <button type="button"><span id="nested" [appTooltip]="label()">x</span></button>
    <div id="outside"></div>
  `,
})
class ToggletipHostComponent {
  readonly label = signal('Explanation');
  readonly parentClicks = signal(0);
}

describe('TooltipDirective toggletip', () => {
  let component: ToggletipHostComponent;
  let fixture: ComponentFixture<ToggletipHostComponent>;

  function element(id: string): HTMLElement {
    return fixture.nativeElement.querySelector(`#${id}`);
  }

  function description(host: HTMLElement): string | null | undefined {
    const id = host.getAttribute('aria-describedby');
    return id ? document.getElementById(id)?.textContent : null;
  }

  beforeEach(async () => {
    vi.useFakeTimers();
    await TestBed.configureTestingModule({
      imports: [ToggletipHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggletipHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  describe('accessibility', () => {
    it('should make a non-interactive host a focusable button described by the tooltip text', () => {
      const badge = element('badge');

      expect(badge.getAttribute('tabindex')).toBe('0');
      expect(badge.getAttribute('role')).toBe('button');
      expect(description(badge)).toBe('Explanation');
      expect(badge.getAttribute('aria-label')).toBeNull();
    });

    it('should name an icon-only host with the tooltip text', () => {
      const icon = element('icon');

      expect(icon.getAttribute('aria-label')).toBe('Explanation');
      expect(icon.getAttribute('aria-describedby')).toBeNull();
    });

    it('should keep a plain tooltip when the tooltip equals the host text', () => {
      const truncated = element('truncated');

      expect(truncated.getAttribute('role')).toBeNull();
      expect(truncated.getAttribute('tabindex')).toBeNull();
      expect(truncated.getAttribute('aria-describedby')).toBeNull();
      expect(truncated.getAttribute('aria-label')).toBeNull();
    });

    it('should leave a host inside an interactive element untouched', () => {
      const nested = element('nested');

      expect(nested.getAttribute('role')).toBeNull();
      expect(nested.getAttribute('tabindex')).toBeNull();
    });

    it('should remove the toggletip attributes when the text becomes empty', async () => {
      component.label.set('');
      fixture.detectChanges();
      await fixture.whenStable();

      const icon = element('icon');
      expect(icon.getAttribute('role')).toBeNull();
      expect(icon.getAttribute('tabindex')).toBeNull();
      expect(icon.getAttribute('aria-label')).toBeNull();
      expect(element('badge').getAttribute('aria-describedby')).toBeNull();
    });
  });

  describe('interaction', () => {
    it('should toggle the tooltip on click (tap)', () => {
      const badge = element('badge');

      badge.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(tooltip()?.textContent).toContain('Explanation');

      badge.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(tooltip()).toBeNull();
    });

    it('should not propagate the toggle click to a clickable parent', () => {
      element('badge').dispatchEvent(new MouseEvent('click', { bubbles: true }));

      expect(component.parentClicks()).toBe(0);
    });

    it('should show immediately on tap even though focus scheduled a delayed show', () => {
      const badge = element('badge');

      badge.dispatchEvent(new FocusEvent('focusin'));
      badge.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      vi.runOnlyPendingTimers();
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();
    });

    it.each(['Enter', ' '])('should toggle the tooltip with the %j key', (key) => {
      const event = new KeyboardEvent('keydown', { key, cancelable: true });

      element('badge').dispatchEvent(event);
      fixture.detectChanges();

      expect(tooltip()).not.toBeNull();
      expect(event.defaultPrevented).toBe(true);
    });

    it('should hide the tooltip on a pointerdown outside the host', () => {
      element('badge').dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();
      expect(tooltip()).not.toBeNull();

      element('outside').dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      fixture.detectChanges();

      expect(tooltip()).toBeNull();
    });

    it('should keep the tooltip on a pointerdown on the host itself', () => {
      const badge = element('badge');
      badge.dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();

      badge.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      fixture.detectChanges();

      expect(tooltip()).not.toBeNull();
    });

    it('should not toggle a host inside an interactive element on click', () => {
      element('nested').dispatchEvent(new MouseEvent('click'));
      fixture.detectChanges();

      expect(tooltip()).toBeNull();
    });

    it('should remove the description element on destroy', () => {
      const id = element('badge').getAttribute('aria-describedby') ?? '';

      fixture.destroy();

      expect(document.getElementById(id)).toBeNull();
    });
  });
});
