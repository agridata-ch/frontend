import { Component, computed, input } from '@angular/core';

/**
 * Minimal horizontal progress bar. Renders a track with a fill whose width reflects the
 * clamped value (0-100).
 *
 * Uses `role="progressbar"` with full ARIA (valuenow/min/max/valuetext) rather than the native
 * `<progress>` element (SonarQube Web:S6819, marked Accepted): native `<progress>` can only be
 * styled via vendor pseudo-elements (not Tailwind utilities) and cannot reliably animate the
 * fill width in webkit browsers. The ARIA pattern is fully accessible.
 *
 * CommentLastReviewed: 2026-07-13
 */
@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  host: { class: 'contents' },
})
export class ProgressBarComponent {
  // Input properties
  readonly label = input<string>('');
  readonly value = input<number>(0);

  // Computed Signals
  protected readonly clampedValue = computed(() => Math.min(100, Math.max(0, this.value())));
}
