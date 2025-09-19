// import { secrets } from './environment.secret';

export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8060',
  cmsBaseUrl: 'http://localhost:1337',
  oidc: {
    authority: 'http://localhost:6999/realms/agate',
    clientId: 'agridata-ui',
    redirectUrl: 'http://localhost:4200/auth-response',
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['http://localhost:8060'],
  },
  // secrets: secrets,
};
