import { TestBed } from '@angular/core/testing';

import { ErrorHandlerService } from '@/shared/error/error-handler.service';
import { createMockErrorHandlerService, MockErrorHandlerService } from '@/shared/testing/mocks';

import { createDocumentDownloadHandler } from './document-download.helper';

const { downloadBlob, openBlobInNewTab } = vi.hoisted(() => ({
  downloadBlob: vi.fn(),
  openBlobInNewTab: vi.fn(),
}));

vi.mock('@/shared/utils', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/utils')>()),
  downloadBlob,
  openBlobInNewTab,
}));

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// Drains the microtask queue so the fetch().then().catch().finally() chain settles.
function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('createDocumentDownloadHandler', () => {
  let errorService: MockErrorHandlerService;
  let handler: ReturnType<typeof createDocumentDownloadHandler>;

  beforeEach(() => {
    downloadBlob.mockClear();
    openBlobInNewTab.mockClear();
    errorService = createMockErrorHandlerService();

    TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandlerService, useValue: errorService }],
    });

    handler = createDocumentDownloadHandler(TestBed.inject(ErrorHandlerService));
  });

  describe('download', () => {
    it('flags the key as downloading while the fetch is in flight and saves the resolved blob', async () => {
      const blob = new Blob();
      const pending = deferred<Blob>();
      const fetch = vi.fn(() => pending.promise);

      handler.download('doc-1', 'file.pdf', fetch);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(handler.isDownloading('doc-1')).toBe(true);

      pending.resolve(blob);
      await flush();

      expect(downloadBlob).toHaveBeenCalledWith(blob, 'file.pdf');
      expect(handler.isDownloading('doc-1')).toBe(false);
    });

    it('ignores a second call for the same key while one is in flight', () => {
      const fetch = vi.fn(() => deferred<Blob>().promise);

      handler.download('doc-1', 'file.pdf', fetch);
      handler.download('doc-1', 'file.pdf', fetch);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('routes a rejected fetch to the error service and clears the loading flag', async () => {
      const error = new Error('boom');
      const fetch = vi.fn(() => Promise.reject(error));

      handler.download('doc-1', 'file.pdf', fetch);
      await flush();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
      expect(downloadBlob).not.toHaveBeenCalled();
      expect(handler.isDownloading('doc-1')).toBe(false);
    });
  });

  describe('open', () => {
    it('flags the key as opening while the fetch is in flight and opens the resolved blob as pdf', async () => {
      const blob = new Blob();
      const pending = deferred<Blob>();
      const fetch = vi.fn(() => pending.promise);

      handler.open('doc-1', fetch);

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(handler.isOpening('doc-1')).toBe(true);

      pending.resolve(blob);
      await flush();

      expect(openBlobInNewTab).toHaveBeenCalledWith(blob, 'application/pdf');
      expect(handler.isOpening('doc-1')).toBe(false);
    });

    it('ignores a second call for the same key while one is in flight', () => {
      const fetch = vi.fn(() => deferred<Blob>().promise);

      handler.open('doc-1', fetch);
      handler.open('doc-1', fetch);

      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('routes a rejected fetch to the error service and clears the loading flag', async () => {
      const error = new Error('boom');
      const fetch = vi.fn(() => Promise.reject(error));

      handler.open('doc-1', fetch);
      await flush();

      expect(errorService.handleError).toHaveBeenCalledWith(error);
      expect(openBlobInNewTab).not.toHaveBeenCalled();
      expect(handler.isOpening('doc-1')).toBe(false);
    });
  });

  it('tracks downloading and opening state independently for the same key', () => {
    handler.download('doc-1', 'file.pdf', () => deferred<Blob>().promise);

    expect(handler.isDownloading('doc-1')).toBe(true);
    expect(handler.isOpening('doc-1')).toBe(false);
  });

  it('tracks distinct keys separately', () => {
    handler.download('doc-1', 'file.pdf', () => deferred<Blob>().promise);

    expect(handler.isDownloading('doc-1')).toBe(true);
    expect(handler.isDownloading('doc-2')).toBe(false);
  });
});
