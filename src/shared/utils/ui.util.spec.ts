import { Component, ElementRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import {
  calculateVerticalPlacement,
  copyToClipboard,
  createOpenAboveSignal,
  VerticalPlacement,
} from './ui.util';

function rect(top: number, bottom: number): DOMRect {
  return { top, bottom } as DOMRect;
}

function heightRect(height: number): DOMRect {
  return { height } as DOMRect;
}

@Component({
  selector: 'app-open-above-test-host',
  template: `
    <div #scrollParent data-testid="scroll-parent" style="overflow-y: auto">
      <button #trigger type="button">trigger</button>
    </div>
    <div #popover data-testid="popover">popover</div>
  `,
})
class OpenAboveTestHostComponent {
  readonly trigger = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly popover = viewChild<ElementRef<HTMLElement>>('popover');
  readonly scrollParent = viewChild<ElementRef<HTMLElement>>('scrollParent');
  readonly openAbove = createOpenAboveSignal(this.trigger, this.popover);
}

describe('UI Utils', () => {
  describe('calculateVerticalPlacement', () => {
    it('should place below when there is enough room', () => {
      // 200px below the trigger, content is 100px tall → fits below
      expect(calculateVerticalPlacement(rect(590, 600), 100, 800)).toBe(VerticalPlacement.BOTTOM);
    });

    it('should flip above when there is not enough room below but more room above', () => {
      // Only 50px below the trigger but 740px above, content is 100px tall → flips above
      expect(calculateVerticalPlacement(rect(740, 750), 100, 800)).toBe(VerticalPlacement.TOP);
    });

    it('should stay below when neither side fits but there is more room below', () => {
      // Trigger near the top: 60px above, 90px below, content 100px tall. Flipping to TOP would clip
      // past the viewport top, so it stays BOTTOM.
      expect(calculateVerticalPlacement(rect(60, 60), 100, 150)).toBe(VerticalPlacement.BOTTOM);
    });

    it('should default to window.innerHeight when no viewport height is given', () => {
      Object.defineProperty(globalThis, 'innerHeight', { value: 800, configurable: true });
      expect(calculateVerticalPlacement(rect(590, 600), 100)).toBe(VerticalPlacement.BOTTOM);
      expect(calculateVerticalPlacement(rect(740, 750), 100)).toBe(VerticalPlacement.TOP);
    });
  });

  describe('createOpenAboveSignal', () => {
    let fixture: ComponentFixture<OpenAboveTestHostComponent>;
    let component: OpenAboveTestHostComponent;
    let triggerRect: DOMRect;
    let popoverRect: DOMRect;
    let scrollParentRect: DOMRect;

    // The effect derives openAbove from the elements' geometry on its first run, which happens as
    // soon as the view children are available, so the geometry must be stubbed before the component
    // is ever rendered rather than patched onto the real elements afterwards.
    beforeEach(async () => {
      triggerRect = rect(0, 0);
      popoverRect = heightRect(0);
      scrollParentRect = rect(0, 800);

      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        if (this.tagName === 'BUTTON') return triggerRect;
        if (this.dataset['testid'] === 'popover') return popoverRect;
        if (this.dataset['testid'] === 'scroll-parent') return scrollParentRect;
        return rect(0, 0);
      });
      Object.defineProperty(globalThis, 'innerHeight', { value: 800, configurable: true });

      await TestBed.configureTestingModule({
        imports: [OpenAboveTestHostComponent],
      }).compileComponents();
      fixture = TestBed.createComponent(OpenAboveTestHostComponent);
      component = fixture.componentInstance;
    });

    it('stays below the trigger when there is enough room', async () => {
      triggerRect = rect(590, 600);
      popoverRect = heightRect(100);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.openAbove()).toBe(false);
    });

    it('flips above the trigger when there is not enough room below but more room above', async () => {
      triggerRect = rect(740, 750);
      popoverRect = heightRect(100);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.openAbove()).toBe(true);
    });

    it('measures available space against the nearest scrollable ancestor instead of the viewport', async () => {
      // The scrollable ancestor ends at 620px, well short of the 800px viewport, so the 50px of room
      // below the trigger inside it is not enough even though the viewport itself has plenty of space.
      scrollParentRect = rect(0, 620);
      triggerRect = rect(590, 600);
      popoverRect = heightRect(50);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.openAbove()).toBe(true);
    });

    it('measures space above from the clipping boundary top, not the viewport top', async () => {
      // Scroll container sits far from the viewport top (500-650). The trigger has only 10px of real
      // room above it inside the container, and 130px below, so it should stay BOTTOM. Measuring
      // "space above" from the viewport top instead of the container top would wrongly read 510px of
      // room above and flip TOP.
      scrollParentRect = rect(500, 650);
      triggerRect = rect(510, 520);
      popoverRect = heightRect(200);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.openAbove()).toBe(false);
    });
  });

  describe('copyToClipboard', () => {
    let writeTextMock: Mock;

    beforeEach(() => {
      writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });
    });

    it('should copy text to clipboard', async () => {
      const testText = 'test text to copy';

      await copyToClipboard(testText);

      expect(writeTextMock).toHaveBeenCalledWith(testText);
    });

    it('should handle clipboard write errors', async () => {
      const testError = new Error('Clipboard access denied');
      writeTextMock.mockRejectedValueOnce(testError);

      await expect(copyToClipboard('test')).rejects.toThrow('Clipboard access denied');
    });
  });
});
