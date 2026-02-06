export const environment = {
  production: false,
  instanceName: 'TEST',
  appBaseUrl: 'https://test.agridata.ch',
  apiBaseUrl: 'https://api.test.agridata.ch',
  cmsBaseUrl: 'https://remarkable-growth-2947108bb8.strapiapp.com',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  canResetTestData: true,
  titleEnvPrefix: 't-',

  googleAnalyticsEnabled: false,
  googleAnalyticsMeasurementId: '',
  googleAnalyticsDebug: false,

  oidc: {
    authority: 'https://idp-rf.agate.ch/auth/realms/agate',
    clientId: 'agridata-rf',
    redirectUrl: 'https://test.agridata.ch/auth-response',
    postLogoutRedirectUri: 'https://test.agridata.ch',
    scope: 'openid offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['https://api.test.agridata.ch'],
  },
};
