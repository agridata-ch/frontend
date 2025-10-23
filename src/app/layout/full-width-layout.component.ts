import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  Renderer2,
  ViewEncapsulation,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthService } from '@/shared/lib/auth';
import { ToastComponent } from '@/shared/ui/toast';
import { FooterWidgetComponent } from '@/widgets/footer-widget';
import { HeaderWidgetComponent } from '@/widgets/header-widget';

/**
 * Provides a full-width layout with header, footer, and content area. It disables view
 * encapsulation to allow CMS-driven styling overrides.
 *
 * CommentLastReviewed: 2025-08-25
 */
@Component({
  selector: 'app-full-width-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderWidgetComponent,
    FooterWidgetComponent,
    ToastComponent,
  ],
  templateUrl: './full-width-layout.component.html',
  styleUrls: ['./full-width-layout.component.css'],
  // Disable view encapsulation for CMS content.
  // This is neccessary because we want to overwrite global variables for every child component
  encapsulation: ViewEncapsulation.None,
})
export class FullWidthLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly renderer = inject(Renderer2);

  private readonly scriptLoaded = signal(false);

  private readonly authStateEffect = effect(() => {
    const prevAuth = this.authService.isAuthenticated();
    if (prevAuth) {
      window.location.reload();
    }
  });

  private readonly scriptEffect = effect(() => {
    this.loadScript(
      'https://d2eac639efd4.edge.sdk.awswaf.com/d2eac639efd4/9f40e813b39c/challenge.js',
    )
      .then(() => this.scriptLoaded.set(true))
      .catch((error) => console.error('Script loading failed:', error));
  });

  private loadScript(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      this.renderer.setAttribute(script, 'src', url);

      script.onload = () => resolve();
      script.onerror = (error: Error) => reject(error);

      this.renderer.appendChild(document.body, script);

      this.destroyRef.onDestroy(() => {
        this.renderer.removeChild(document.body, script);
      });
    });
  }
}
