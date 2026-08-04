import { TestBed } from '@angular/core/testing';

import { AnchorRect, TooltipBubbleService } from './tooltip-bubble.service';

function bubble(): HTMLElement | null {
  return document.body.querySelector('[role="tooltip"]');
}

function point(x: number, y: number): AnchorRect {
  return { top: y, bottom: y, left: x, width: 0, height: 0 };
}

describe('TooltipBubbleService', () => {
  let service: TooltipBubbleService;

  beforeEach(() => {
    jest.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TooltipBubbleService);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    document.body.querySelectorAll('[role="tooltip"]').forEach((element) => element.remove());
  });

  it('should append an aria-hidden bubble to the body', () => {
    service.show('Copied', () => point(500, 300));

    const element = bubble();
    expect(element).not.toBeNull();
    expect(element?.parentElement).toBe(document.body);
    expect(element?.textContent).toBe('Copied');
    expect(element?.getAttribute('aria-hidden')).toBe('true');
  });

  it('should centre the bubble on a zero-size anchor', () => {
    // jsdom reports a 0x0 rect, so the centred left collapses to the anchor's x.
    service.show('Copied', () => point(500, 300));

    expect(bubble()?.style.left).toBe('500px');
    expect(bubble()?.style.top).toBe('308px');
  });

  it('should clamp the bubble inside the viewport near the right edge', () => {
    const width = 160;
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue({ ...point(0, 0), width, height: 24 } as DOMRect);

    service.show('Copied', () => point(window.innerWidth - 2, 300));

    // Right edge clamp: innerWidth - width - gap.
    expect(bubble()?.style.left).toBe(`${window.innerWidth - width - 8}px`);
  });

  it('should replace the previous bubble instead of stacking a second one', () => {
    service.show('First', () => point(100, 100));
    service.show('Second', () => point(200, 200));

    expect(document.body.querySelectorAll('[role="tooltip"]')).toHaveLength(1);
    expect(bubble()?.textContent).toBe('Second');
  });

  it('should ignore hide and setText from a superseded handle', () => {
    const stale = service.show('First', () => point(100, 100));
    service.show('Second', () => point(200, 200));

    expect(stale.setText('Rewritten')).toBe(false);
    stale.hide();

    expect(bubble()?.textContent).toBe('Second');
  });

  it('should retitle the bubble through a live handle', () => {
    const handle = service.show('First', () => point(100, 100));

    expect(handle.setText('Second')).toBe(true);
    expect(bubble()?.textContent).toBe('Second');
  });

  it('should hide the bubble on Escape and notify the owner', () => {
    const onDismiss = jest.fn();
    service.show('Copied', () => point(100, 100), { onDismiss });

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(bubble()).toBeNull();
    expect(onDismiss).toHaveBeenCalled();
  });

  it('should remove a transient bubble and call onHide after its duration', () => {
    const onHide = jest.fn();
    service.showTransient('Copied', () => point(500, 300), 1500, onHide);
    expect(bubble()).not.toBeNull();

    jest.advanceTimersByTime(1500);

    expect(bubble()).toBeNull();
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('should call onHide when a transient bubble is superseded early', () => {
    const onHide = jest.fn();
    service.showTransient('Copied', () => point(500, 300), 1500, onHide);

    service.show('Tooltip', () => point(100, 100));

    expect(onHide).toHaveBeenCalledTimes(1);
    expect(bubble()?.textContent).toBe('Tooltip');

    // The superseded timer must not fire a second time.
    jest.advanceTimersByTime(1500);
    expect(onHide).toHaveBeenCalledTimes(1);
  });

  it('should make a transient bubble ignore the pointer so it cannot swallow clicks', () => {
    service.showTransient('Copied', () => point(500, 300), 1500);

    expect(bubble()?.className).toContain('pointer-events-none');
  });
});
