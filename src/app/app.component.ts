import { ViewportScroller } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
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
  private readonly router = inject(Router);
  private readonly scroller = inject(ViewportScroller);

  private readonly currentAnchor = signal<string | null>(null);

  scrollEffect = effect(() => {
    const anchor = this.currentAnchor();
    if (!anchor) return;

    // Wait a delay to ensure the view has rendered
    setTimeout(() => {
      const el = document.getElementById(anchor);
      if (!el) return;

      this.scroller.scrollToAnchor(anchor);

      requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top;
        if (Math.abs(top) > 1) {
          this.scroller.scrollToAnchor(anchor);
        }
      });
    }, 150);
  });

  routerEffect = effect(() => {
    this.router.events.pipe(filter((e): e is Scroll => e instanceof Scroll)).subscribe((e) => {
      if (e.anchor) {
        this.currentAnchor.set(e.anchor);
      }
    });
  });
}
