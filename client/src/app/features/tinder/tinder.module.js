/**
 * @typedef {Object} SwipeAction
 * @property {string} adId
 * @property {('left'|'right')} direction
 * @property {Date} timestamp
 */

angular.module('dateNightApp.tinder', ['dateNightApp.core', 'dateNightApp.ads'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/tinder', {
        templateUrl: 'app/features/tinder/tinder.html',
        controller: 'TinderController'
      });
  }])
  .service('SwipeService', ['$http', function($http) {
    return {
      recordSwipe: function(swipeAction) {
        return $http.post('/swipes', swipeAction);
      }
    };
  }]);
