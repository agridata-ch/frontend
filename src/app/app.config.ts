import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideTransloco } from '@jsverse/transloco';
import {
  AbstractSecurityStorage,
  DefaultLocalStorageService,
  authInterceptor,
  provideAuth,
} from 'angular-auth-oidc-client';

import { impersonationInterceptor } from '@/app/interceptors/impersonation-interceptor';
import { Configuration } from '@/entities/openapi';
import { environment } from '@/environments/environment';
import { oidcConfig } from '@/shared/lib/auth';

import { routes } from './app.routes';
import { i18nConfig } from './i18n.config';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor(), impersonationInterceptor])),
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
    { provide: AbstractSecurityStorage, useClass: DefaultLocalStorageService },
  ],
};
