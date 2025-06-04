export const environment = {
  production: false,
  apiBaseUrl: 'https://api.dev.agridata.ch',
  oidc: {
    authority: 'https://idp-rf.agate.ch/auth/realms/agate',
    clientId: 'agridata-rf',
    redirectUrl: 'https://dev.agridata.ch/auth-response',
    postLogoutRedirectUri: 'https://dev.agridata.ch',
    scope: 'openid',
    responseType: 'code',
    silentRenew: true,
    useRefreshToken: true,
    secureRoutes: ['https://api.dev.agridata.ch'],
  },
};
