angular.module('dateNightApp', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'btford.socket-io',
  'dateNightApp.core',
  'dateNightApp.auth', // <-- NEW: add auth module
  'dateNightApp.chat',
  'dateNightApp.ads',
  'dateNightApp.shared' // <-- ensure shared module is included
])
.constant('API_CONFIG', {
  baseUrl: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
})
.controller('MainController', ['$scope', 'ImageService', 'ChatPollingService', 
  function($scope, ImageService, ChatPollingService) {
    ImageService.initHoverEffects();
    ChatPollingService.start();
  }
])
.controller('AppController', ['$scope', '$rootScope', 'AuthService', function($scope, $rootScope, AuthService) {
  // Initialize auth state
  $rootScope.isAuthenticated = false;  // Set default value
  $rootScope.currentUser = null;       // Set default value
  
  // Initialize page data
  $scope.init = function() {
    console.log('AppController initialized');  // Debug log
    AuthService.isAuthenticated()
      .then(function(authenticated) {
        $rootScope.isAuthenticated = authenticated;
        if (authenticated) {
          return AuthService.getCurrentUser();
        }
      })
      .then(function(user) {
        $rootScope.currentUser = user;
      })
      .catch(function(err) {
        console.error('Auth initialization error:', err);
      });
  };

  $scope.init();
}]);