angular.module('dateNightApp')
  .factory('UserService', ['$http', function($http) {
    return {
      getCurrentUser: function() {
        return $http.get('/api/users/me');
      },
      updateUser: function(userData) {
        return $http.put('/api/users/me', userData);
      },
      updateTravelPlan: function(counties) {
        return $http.put('/api/users/travel-plan', { counties });
      },
      getUserStatus: function(userId) {
        return $http.get(`/api/users/${userId}/status`);
      }
    };
  }]);
