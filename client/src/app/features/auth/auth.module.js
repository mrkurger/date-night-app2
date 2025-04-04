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
  })
  .controller('LoginController', ['$scope', function($scope) {
    console.log('LoginController initialized');
    // ...existing login logic...
  }])
  .controller('RegisterController', ['$scope', function($scope) {
    console.log('RegisterController initialized');
    // ...existing register logic...
  }])
  .controller('AuthCallbackController', ['$scope', function($scope) {
    console.log('AuthCallbackController initialized');
    // ...existing auth callback logic...
  }]);
