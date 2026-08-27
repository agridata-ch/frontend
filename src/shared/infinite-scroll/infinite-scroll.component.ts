import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  input,
  output,
} from '@angular/core';
import { faArrowDown } from '@awesome.me/kit-0b6d1ed528/icons/classic/regular';
import { faSpinnerThird } from '@awesome.me/kit-0b6d1ed528/icons/duotone/solid';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { I18nService } from '@/shared/i18n';

/**
 * Bottom sentinel for paged lists: emits `loadMore` when scrolled into view so the consumer can
 * append its next page, and renders the matching indicators itself — a spinner while `loading`, a
 * gentle scroll hint while `hasMore`, and projected content (e.g. an "all loaded" message) once
 * done. The sentinel's initial visibility is ignored on purpose: the consumer fetches the first
 * page itself, and this component only reacts to the user actually scrolling to the end.
 *
 * CommentLastReviewed: 2026-09-01
 */
@Component({
  selector: 'app-infinite-scroll',
  imports: [FontAwesomeModule],
  templateUrl: './infinite-scroll.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfiniteScrollComponent {
  // Injects
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly i18n = inject(I18nService);

  // Constants
  protected readonly faSpinnerThird = faSpinnerThird;
  protected readonly faArrowDown = faArrowDown;

  // Input properties
  readonly loading = input(false);
  readonly hasMore = input(false);
  readonly hasItems = input(false);

  // Output properties
  readonly loadMore = output<void>();

  // State
  private initialized = false;
  private isIntersecting = false;
  private wasEligible = false;

  // Signals
  // Announced by the aria-live region while loading; the icons are decorative (aria-hidden).
  protected readonly loadingLabel = this.i18n.translateSignal('infinite-scroll.loading');

  // Computed Signals
  private readonly disabled = computed(() => this.loading() || !this.hasMore());

  // Effects
  // Re-check when `disabled` changes: if it clears while the sentinel is still in view, the next
  // page must load without waiting for another scroll, since the observer reports no new transition
  // while the sentinel stays continuously visible across a load.
  private readonly _onDisabledChange = effect(() => {
    this.disabled();
    this.evaluate();
  });

  private readonly _observe = afterNextRender(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        this.isIntersecting = entry.isIntersecting;

        // Ignore the observer's initial report; the consumer fetches the first page itself.
        if (!this.initialized) {
          this.initialized = true;
          this.wasEligible = this.isIntersecting && !this.disabled();
          return;
        }

        this.evaluate();
      },
      { rootMargin: '-400px' },
    );
    observer.observe(this.el.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  });

  // Emits on the rising edge of "eligible to load" (in view, enabled, past the initial report), so
  // it fires once both when the sentinel scrolls into view and when loading finishes while it stays
  // visible, and not again until it becomes ineligible (scrolled away or disabled).
  private evaluate(): void {
    const eligible = this.initialized && this.isIntersecting && !this.disabled();
    if (eligible && !this.wasEligible) {
      this.loadMore.emit();
    }
    this.wasEligible = eligible;
  }
}
