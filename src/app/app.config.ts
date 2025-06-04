import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from '@app/app.routes';
import { oidcConfig } from '@app/auth.config';
import { AgridataOIDCStorage } from '@app/agridata-oidc-storage';
import { environment } from '@/environments/environment';
import { Configuration } from '@shared/api/openapi/configuration';
import { AbstractSecurityStorage, authInterceptor, provideAuth } from 'angular-auth-oidc-client';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
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
  ],
};
