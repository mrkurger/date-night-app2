/**
 * @typedef {Object} AuthResponse
 * @property {string} token
 * @property {User} user
 */

angular.module('dateNightApp.auth', ['dateNightApp.core'])
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });
