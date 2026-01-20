import { copyToClipboard } from './ui.util';

describe('UI Utils', () => {
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
