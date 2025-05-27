export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8060',
  oidc: {
    authority: 'http://localhost:6999/realms/agate',
    clientId: 'agridata-ui',
    redirectUrl: 'http://localhost:4200/auth-response',
    postLogoutRedirectUri: window.location.origin,
    scope: 'openid',
    responseType: 'code',
  },
};
