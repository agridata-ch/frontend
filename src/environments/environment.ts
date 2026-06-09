export const environment = {
  production: false,
  instanceName: 'default',
  appBaseUrl: 'http://localhost',
  apiBaseUrl: 'https://localhost',
  cmsBaseUrl: 'https://localhost:1337',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
  cmsOnboardingFormUrl: 'https://localhost:1337/api/onboarding-form',
  canResetTestData: true,
  oidc: {},
  titleEnvPrefix: '',
  // Google Analytics
  googleAnalyticsEnabled: true,
  googleAnalyticsMeasurementId: 'G-W63GH77CQJ',
  // if true received data can be observed in debug view in GA and it does not affect normal reports
  googleAnalyticsDebug: false,
};
