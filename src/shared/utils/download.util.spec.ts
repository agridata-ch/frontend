import type { Mock } from 'vitest';

import { downloadBlob, openBlobInNewTab } from './download.util';

describe('download.util', () => {
  const mockUrl = 'blob:http://localhost/mock';

  beforeEach(() => {
    URL.createObjectURL = vi.fn().mockReturnValue(mockUrl);
    URL.revokeObjectURL = vi.fn();
  });

  describe('downloadBlob', () => {
    it('creates an anchor, triggers the download and revokes the url', () => {
      const anchor = { href: '', download: '', click: vi.fn(), remove: vi.fn() };
      const createElementSpy = vi
        .spyOn(document, 'createElement')
        .mockReturnValue(anchor as unknown as HTMLElement);
      const appendChildSpy = vi
        .spyOn(document.body, 'appendChild')
        .mockImplementation((node) => node);

      downloadBlob(new Blob(['pdf']), 'report.pdf');

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(anchor.href).toBe(mockUrl);
      expect(anchor.download).toBe('report.pdf');
      expect(anchor.click).toHaveBeenCalled();
      expect(anchor.remove).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
    });
  });

  describe('openBlobInNewTab', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('opens the blob url in a new tab and revokes it after a delay', () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);

      openBlobInNewTab(new Blob(['pdf']));

      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(openSpy).toHaveBeenCalledWith(mockUrl, '_blank', 'noopener');
      // Revoke is deferred so the new tab can start loading the blob first.
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();

      vi.runOnlyPendingTimers();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith(mockUrl);

      openSpy.mockRestore();
    });

    it('re-tags the blob with the given mime type before opening', () => {
      const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => null);

      openBlobInNewTab(new Blob(['pdf'], { type: 'application/octet-stream' }), 'application/pdf');

      const openedBlob = (URL.createObjectURL as Mock).mock.calls[0][0] as Blob;
      expect(openedBlob.type).toBe('application/pdf');
      expect(openSpy).toHaveBeenCalledWith(mockUrl, '_blank', 'noopener');

      openSpy.mockRestore();
    });
  });
});
