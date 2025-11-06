import { effect, inject, Injectable } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { debounceTime } from 'rxjs';

import { GA_MEASUREMENT_ID, GA_SCRIPT_URL } from '@/app/analytics.config';
import { AgridataStateService } from '@/entities/api/agridata-state.service';
import { environment } from '@/environments/environment';

declare let gtag: (
  command: 'config' | 'event' | 'set' | 'js',
  targetOrAction: string | Date,
  params?: Record<string, unknown>,
) => void;

/**
 * Service for integrating Google Analytics (GA4) tracking functionality.
 * Automatically injects gtag script and tracks page views on route changes.
 *
 * CommentLastReviewed: 2025-11-06
 */
@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private readonly stateService = inject(AgridataStateService);
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly gaId = inject(GA_MEASUREMENT_ID, { optional: true }) ?? 'G-TEST';
  private readonly gaUrl = inject(GA_SCRIPT_URL);
  private readonly injectTagEffect = effect(() => {
    if (!environment.gaMeasurementId) {
      console.warn('GA Measurement ID not set in environment.');
      return;
    }
    const gtagScript = document.createElement('script');
    gtagScript.async = true;
    gtagScript.src = `${this.gaUrl}?id=${this.gaId}`;
    document.head.appendChild(gtagScript);
    const inlineScript = document.createElement('script');
    inlineScript.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${environment.gaMeasurementId}');
    `;
    document.head.appendChild(inlineScript);
  });

  private readonly trackUserLoggedInEffect = effect((onCleanup) => {
    const sub = this.oidcSecurityService.isAuthenticated$
      .pipe(debounceTime(200)) // event is triggerd upon route activation, even if the redirection happens in guards (which is done regularly after login). This makes sure that it is only logged once
      .subscribe((auth) => {
        if (auth.isAuthenticated) {
          this.setUserProperties({ logged_in: true });
        }
      });
    onCleanup(() => sub.unsubscribe());
  });

  private readonly trackPageViewsEffect = effect(() => {
    const currentRoute = this.stateService.currentRoute();
    if (currentRoute) {
      console.log('Current route', currentRoute);
      gtag('event', 'page_view', {
        page_path: currentRoute,
        page_location: window.location.href,
        page_title: document.title,
      });
    }
  });

  // Log a custom event
  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }
  // Set user properties for GA4
  setUserProperties(properties: Record<string, unknown>): void {
    if (typeof gtag === 'function') {
      gtag('set', 'user_properties', properties);
    }
  }
}
