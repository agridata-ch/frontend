import { ViewportScroller } from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  inject,
  Injector,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { filter } from 'rxjs';

import { DebugModalComponent } from '@/features/debug/debug-modal.component';
import { ErrorModal } from '@/shared/error-modal/error-modal.component';

/**
 * The root Angular component that renders the application shell. It provides the router outlet as
 * the placeholder for dynamic routes.
 *
 * CommentLastReviewed: 2025-10-21
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ErrorModal, DebugModalComponent],
})
export class AppComponent {
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);

  private readonly currentAnchor = signal<string | null>(null);

  scrollEffect = effect((onCleanup) => {
    const anchor = this.currentAnchor();
    if (!anchor) return;

    const maxAttempts = 5;

    const safeScrollToAnchor = (anchor: string, attemptCount = 0) => {
      const el = document.getElementById(anchor);
      if (!el) return;

      this.scroller.scrollToAnchor(anchor);

      // Check if the scroll was successful
      requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top;
        if (Math.abs(top) > 1 && attemptCount < maxAttempts) {
          safeScrollToAnchor(anchor, attemptCount + 1);
        }
      });
    };

    // First attempt after render
    runInInjectionContext(this.injector, () => {
      afterNextRender(() => safeScrollToAnchor(anchor));
    });

    // Second attempt after a short delay
    setTimeout(() => safeScrollToAnchor(anchor), 150);

    // Third attempt after window load completes
    let loadListener: (() => void) | undefined;

    if (document.readyState === 'complete') {
      // Page already loaded, try once more
      setTimeout(() => safeScrollToAnchor(anchor), 300);
    } else {
      // Wait for full page load including images
      loadListener = () => {
        safeScrollToAnchor(anchor);
      };
      window.addEventListener('load', loadListener, { once: true });
    }

    // Final attempt with a longer delay to catch late-loading resources
    setTimeout(() => safeScrollToAnchor(anchor), 1000);

    onCleanup(() => {
      this.currentAnchor.set(null);
      if (loadListener) {
        window.removeEventListener('load', loadListener);
      }
    });
  });

  routerEffect = effect(() => {
    this.router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e) => {
      if (e.anchor) {
        this.currentAnchor.set(e.anchor);
      }
    });
  });
}
