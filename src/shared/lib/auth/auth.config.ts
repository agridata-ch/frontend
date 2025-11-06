import { OpenIdConfiguration } from 'angular-auth-oidc-client';

import { environment } from '@/environments/environment';

export const oidcConfig: OpenIdConfiguration = {
  ...environment.oidc,
};
