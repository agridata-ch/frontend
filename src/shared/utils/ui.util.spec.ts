import { calculateVerticalPlacement, copyToClipboard, VerticalPlacement } from './ui.util';

function rect(top: number, bottom: number): DOMRect {
  return { top, bottom } as DOMRect;
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

  describe('copyToClipboard', () => {
    let writeTextMock: jest.Mock;

    beforeEach(() => {
      writeTextMock = jest.fn().mockResolvedValue(undefined);
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
