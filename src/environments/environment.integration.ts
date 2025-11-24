export const environment = {
  production: false,
  instanceName: 'INT',
  appBaseUrl: 'https://int.agridata.ch',
  apiBaseUrl: 'https://api.int.agridata.ch',
  cmsBaseUrl: 'https://remarkable-growth-2947108bb8.strapiapp.com',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  canResetTestData: false,
  titleEnvPrefix: 'i-',

  googleAnalyticsEnabled: false,
  googleAnalyticsMeasurementId: 'G-6B94RMTR7J',
  googleAnalyticsDebug: false,

  oidc: {
    authority: 'https://idp-rf.agate.ch/auth/realms/agate',
    clientId: 'agridata-rf',
    redirectUrl: 'https://int.agridata.ch/auth-response',
    postLogoutRedirectUri: 'https://int.agridata.ch',
    scope: 'openid offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['https://api.int.agridata.ch'],
  },
};
