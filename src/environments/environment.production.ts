export const environment = {
  production: true,
  apiBaseUrl: 'https://api.agridata.ch',
  cmsBaseUrl: 'https://cms.agridata.ch',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
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
