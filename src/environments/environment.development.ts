export const environment = {
  production: false,
  instanceName: 'DEV',
  appBaseUrl: 'https://dev.agridata.ch',
  apiBaseUrl: 'https://api.dev.agridata.ch',
  cmsBaseUrl: 'https://remarkable-growth-2947108bb8.strapiapp.com',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  canResetTestData: true,
  titleEnvPrefix: 'd-',

  googleAnalyticsEnabled: false,
  googleAnalyticsMeasurementId: 'G-7DEQCX0490',
  googleAnalyticsDebug: false,

  oidc: {
    authority: 'https://idp-rf.agate.ch/auth/realms/agate',
    clientId: 'agridata-rf',
    redirectUrl: 'https://dev.agridata.ch/auth-response',
    postLogoutRedirectUri: 'https://dev.agridata.ch',
    scope: 'openid offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['https://api.dev.agridata.ch'],
  },
};
