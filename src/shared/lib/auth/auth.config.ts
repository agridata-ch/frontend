import { LogLevel, OpenIdConfiguration } from 'angular-auth-oidc-client';

import { environment } from '@/environments/environment';

export const oidcConfig: OpenIdConfiguration = {
  ...environment.oidc,
  logLevel: LogLevel.Debug, // Set log level to Debug for detailed logs
};
