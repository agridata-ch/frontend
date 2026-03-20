import { WritableSignal } from '@angular/core';

/**
 * Copies the provided text to the system clipboard
 *
 * CommentLastReviewed: 2026-01-20
 *
 * @param text The text to copy to clipboard
 * @returns A promise that resolves when the text has been copied
 * @throws Error if clipboard operation fails
 */
export async function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

/**
 * Starts a countdown that decrements the given signal by 1 every second until it reaches 0.
 * Clears any previously running countdown timer before starting a new one.
 *
 * CommentLastReviewed: 2026-03-23
 *
 * @param countdownValue Signal holding the current countdown value.
 * @param durationSeconds Total countdown duration in seconds.
 * @param existingTimer Previously returned timer handle to clear, if any.
 * @returns The new interval handle — store it and pass it back on the next call or to clearInterval.
 */
export function startCountdown(
  countdownValue: WritableSignal<number>,
  durationSeconds: number,
  existingTimer?: ReturnType<typeof setInterval>,
): ReturnType<typeof setInterval> {
  if (existingTimer) {
    clearInterval(existingTimer);
  }

  countdownValue.set(durationSeconds);

  const timer = setInterval(() => {
    const current = countdownValue();
    if (current <= 1) {
      countdownValue.set(0);
      clearInterval(timer);
    } else {
      countdownValue.set(current - 1);
    }
  }, 1000);

  return timer;
}
