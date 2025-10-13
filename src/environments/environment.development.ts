export const environment = {
  production: false,
  apiBaseUrl: 'https://api.dev.agridata.ch',
  cmsBaseUrl: 'https://remarkable-growth-2947108bb8.strapiapp.com',
  cmsContactUrl: 'https://cms.agridata.ch/api/contact',
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
