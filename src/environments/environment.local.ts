export const environment = {
  production: false,
  appBaseUrl: 'http://localhost:4200',
  apiBaseUrl: 'http://localhost:8060',
  cmsBaseUrl: 'http://localhost:1337',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  canResetTestData: true,
  gaMeasurementId: 'G-VPFVTHHTK0',

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
};
