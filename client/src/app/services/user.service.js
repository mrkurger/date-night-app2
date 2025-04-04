angular.module('dateNightApp')
  .factory('UserService', ['$http', function($http) {
    const baseUrl = '/api/users';
    
    return {
      getCurrentUser: function() {
        return $http.get(`${baseUrl}/me`);
      },
      
      updateUser: function(userData) {
        return $http.put(`${baseUrl}/me`, userData);
      },
      
      updateTravelPlan: function(travelPlan) {
        return $http.put(`${baseUrl}/travel-plan`, { travelPlan: travelPlan });
      },
      
      getUserStatus: function(userId) {
        return $http.get(`${baseUrl}/${userId}/status`);
      }
    };
  }]);
