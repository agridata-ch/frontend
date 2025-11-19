import { effect, inject, Injectable, untracked } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { debounceTime } from 'rxjs';

import { GA_MEASUREMENT_ID, GA_SCRIPT_URL } from '@/app/analytics.config';
import { TitleService } from '@/app/title.service';
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
  private readonly oidcSecurityService = inject(OidcSecurityService);
  private readonly gaId = inject(GA_MEASUREMENT_ID, { optional: true }) ?? 'G-TEST';
  private readonly gaUrl = inject(GA_SCRIPT_URL);
  private readonly translocoService = inject(TranslocoService);
  private readonly titleService = inject(TitleService);
  private readonly injectTagEffect = effect(() => {
    if (!environment.googleAnalyticsEnabled) {
      return;
    }
    if (!environment.googleAnalyticsMeasurementId) {
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
      gtag('config', '${environment.googleAnalyticsMeasurementId}',  { debug_mode: ${environment.googleAnalyticsDebug}});
    `;
    document.head.appendChild(inlineScript);
  });

  private readonly trackPageViewsEffect = effect(() => {
    if (!environment.googleAnalyticsEnabled) {
      return;
    }
    const title = this.titleService.roTranslatedTitle();
    if (title) {
      this.logPageHit(
        untracked(() => this.titleService.roRoute()),
        title,
        untracked(() => this.titleService.ro18nTitle()),
      );
      // reset i18n title, otherwise a successive route change would log i18nTitle even if it doesn't have one (e.g. cms pages)
      this.titleService.setI18nTitle(undefined);
    }
  });
  private readonly trackUserLoggedInEffect = effect((onCleanup) => {
    if (!environment.googleAnalyticsEnabled) {
      return;
    }
    const sub = this.oidcSecurityService.isAuthenticated$
      .pipe(debounceTime(200)) // event is triggerd upon route activation, even if the redirection happens in guards (which is done regularly after login). This makes sure that it is only logged once
      .subscribe((auth) => {
        if (auth.isAuthenticated) {
          this.setUserProperties({ logged_in: true });
        }
      });
    onCleanup(() => sub.unsubscribe());
  });

  private readonly trackUserLanguageEffect = effect((onCleanup) => {
    const sub = this.translocoService.langChanges$.subscribe((lang) => {
      this.setUserProperties({ language: lang });
    });
    onCleanup(() => sub.unsubscribe());
  });

  logPageHit(route?: string, title?: string, i18nTitle?: string | undefined): void {
    if (environment.googleAnalyticsEnabled && typeof gtag === 'function') {
      gtag('event', 'page_view', {
        page_path: route,
        page_location: window.location.href,
        page_title: title,
        page_title_key: i18nTitle,
      });
    }
  }

  // Log a custom event
  logEvent(eventName: string, params: Record<string, unknown> = {}): void {
    if (environment.googleAnalyticsEnabled && typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }
  // Set user properties for GA4
  setUserProperties(properties: Record<string, unknown>): void {
    if (environment.googleAnalyticsEnabled && typeof gtag === 'function') {
      gtag('set', 'user_properties', properties);
    }
  }
}
