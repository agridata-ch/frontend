import { TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { I18nService } from '@/shared/i18n';
import { createMockI18nService } from '@/shared/testing/mocks';
import { TooltipBubbleService } from '@/shared/tooltip';

import { createCopyFeedback } from './copy-feedback.helper';

describe('createCopyFeedback', () => {
  let showTransient: Mock;
  let writeText: Mock;
  let copyFeedback: ReturnType<typeof createCopyFeedback>;

  const pointerClick = (): MouseEvent =>
    new MouseEvent('click', { clientX: 500, clientY: 300, detail: 1 });

  beforeEach(() => {
    showTransient = vi.fn();
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });

    TestBed.configureTestingModule({
      providers: [
        { provide: I18nService, useValue: createMockI18nService() },
        { provide: TooltipBubbleService, useValue: { showTransient } },
      ],
    });
    copyFeedback = createCopyFeedback(
      TestBed.inject(TooltipBubbleService),
      TestBed.inject(I18nService),
      'prefix',
    );
  });

  it('copies the value and shows the success message at the cursor', async () => {
    await copyFeedback.copy('value', pointerClick());

    expect(writeText).toHaveBeenCalledWith('value');
    expect(copyFeedback.message()).toBe('prefix.copied');
    expect(showTransient).toHaveBeenCalledWith(
      'prefix.copied',
      expect.any(Function),
      1500,
      expect.any(Function),
    );
    expect(showTransient.mock.calls[0][1]()).toEqual({
      top: 300,
      bottom: 300,
      left: 500,
      width: 0,
      height: 0,
    });
  });

  it.each([
    ['a keyboard click', new MouseEvent('click', { detail: 0 })],
    ['an Enter keydown', new KeyboardEvent('keydown', { key: 'Enter' })],
  ])('anchors the bubble to the trigger on %s', async (_label, event) => {
    const button = document.createElement('button');
    let copied: Promise<void> = Promise.resolve();
    button.addEventListener(event.type, (dispatched) => {
      copied = copyFeedback.copy('value', dispatched);
    });

    button.dispatchEvent(event);
    await copied;

    expect(showTransient.mock.calls[0][1]()).toEqual(button.getBoundingClientRect());
  });

  it('shows the failure message when the clipboard write rejects', async () => {
    writeText.mockRejectedValue(new Error('denied'));

    await copyFeedback.copy('value', pointerClick());

    expect(copyFeedback.message()).toBe('prefix.copyFailed');
  });

  it('clears the message when the bubble hides', async () => {
    await copyFeedback.copy('value', pointerClick());

    showTransient.mock.calls[0][3]();

    expect(copyFeedback.message()).toBe('');
  });

  it('keeps the new message when a second copy supersedes the first bubble', async () => {
    // The real service runs the previous onHide while showing the next bubble.
    showTransient.mockImplementation(() => showTransient.mock.calls.at(-2)?.[3]());
    writeText.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('denied'));

    await copyFeedback.copy('first', pointerClick());
    await copyFeedback.copy('second', pointerClick());

    expect(copyFeedback.message()).toBe('prefix.copyFailed');
  });
});
