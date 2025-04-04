/**
 * @typedef {Object} User
 * @property {string} _id
 * @property {string} username
 * @property {('user'|'advertiser')} role
 * @property {string[]} [album]
 * @property {boolean} online
 * @property {Date} lastActive
 */

angular.module('dateNightApp.core', [])
  .factory('ErrorHandler', ['$rootScope', function($rootScope) {
    return {
      handleError: function(error) {
        $rootScope.$emit('error', error);
        console.error('Application error:', error);
      }
    };
  }])
  .factory('LoadingInterceptor', ['$rootScope', function($rootScope) {
    return {
      request: function(config) {
        $rootScope.$broadcast('loading:start');
        return config;
      },
      response: function(response) {
        $rootScope.$broadcast('loading:finish');
        return response;
      }
    };
  }])
  .factory('AuthService', ['$http', '$q', function($http, $q) {
    var currentUser = null;
    
    return {
      isAuthenticated: function() {
        // For development, return mock authentication
        return $q.resolve(false);
      },
      getCurrentUser: function() {
        // For development, return mock user
        return $q.resolve(null);
      },
      logout: function() {
        currentUser = null;
        return $q.resolve();
      }
    };
  }]);
