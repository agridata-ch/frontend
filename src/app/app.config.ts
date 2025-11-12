import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  ErrorHandler,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  TitleStrategy,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import { authInterceptor, provideAuth } from 'angular-auth-oidc-client';

import { GlobalErrorHandler } from '@/app/error/global-error-handler';
import { errorHttpInterceptor } from '@/app/interceptors/error-http-interceptor';
import { impersonationInterceptor } from '@/app/interceptors/impersonation-interceptor';
import { AgridataTitleStrategy } from '@/app/title.strategy';
import { Configuration } from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { oidcConfig } from '@/shared/lib/auth';

import { GA_MEASUREMENT_ID, GA_SCRIPT_URL } from './analytics.config';
import { routes } from './app.routes';
import { i18nConfig } from './i18n.config';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: GA_MEASUREMENT_ID, useValue: environment.googleAnalyticsMeasurementId },
    { provide: GA_SCRIPT_URL, useValue: 'https://www.googletagmanager.com/gtag/js' },
    { provide: TitleStrategy, useClass: AgridataTitleStrategy },
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
    provideHttpClient(
      withInterceptors([errorHttpInterceptor, authInterceptor(), impersonationInterceptor]),
    ),
    {
      provide: Configuration,
      useValue: new Configuration({ basePath: environment.apiBaseUrl }),
    },
    provideTransloco({
      config: {
        ...i18nConfig,
      },
      loader: TranslocoHttpLoader,
    }),
    provideAuth({
      config: {
        ...oidcConfig,
      },
    }),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
  ],
};
