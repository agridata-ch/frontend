export const environment = {
  production: true,
  instanceName: 'PROD',
  appBaseUrl: 'https://agridata.ch',
  apiBaseUrl: 'https://api.agridata.ch',
  cmsBaseUrl: 'https://cms.agridata.ch',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  canResetTestData: false,
  titleEnvPrefix: '',

  googleAnalyticsEnabled: true,
  googleAnalyticsMeasurementId: 'G-QPQ6KHCPXS',
  googleAnalyticsDebug: false,

  oidc: {
    authority: 'https://idp.agate.ch/auth/realms/agate',
    clientId: 'agridata',
    redirectUrl: 'https://agridata.ch/auth-response',
    postLogoutRedirectUri: 'https://agridata.ch',
    scope: 'openid offline_access',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['https://api.agridata.ch'],
  },
};
