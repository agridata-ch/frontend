import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { AbstractSecurityStorage, authInterceptor, provideAuth } from 'angular-auth-oidc-client';

import { routes } from '@/app/app.routes';
import { Configuration } from '@/entities/openapi/configuration';
import { environment } from '@/environments/environment';
import { AgridataOIDCStorage, oidcConfig } from '@/shared/lib/auth';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor()])),
    {
      provide: Configuration,
      useValue: new Configuration({ basePath: environment.apiBaseUrl }),
    },
    provideAuth({
      config: {
        ...oidcConfig,
      },
    }),
    { provide: AbstractSecurityStorage, useClass: AgridataOIDCStorage },
    provideZonelessChangeDetection(),
  ],
};
