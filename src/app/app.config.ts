import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { Configuration } from '@shared/api/openapi/configuration';
import { environment } from '@/environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(),
    {
      provide: Configuration,
      useValue: new Configuration({ basePath: environment.apiBaseUrl }),
    },
  ],
};
