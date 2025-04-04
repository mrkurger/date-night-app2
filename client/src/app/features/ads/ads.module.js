/**
 * @typedef {Object} Ad
 * @property {string} _id
 * @property {string} title
 * @property {string} description
 * @property {string} advertiser
 * @property {string[]} counties
 * @property {Date} createdAt
 */

angular.module('dateNightApp.ads', ['dateNightApp.core'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/ads', {
        templateUrl: 'app/features/ads/list/ad-list.html',
        controller: 'AdListController'
      })
      .when('/ads/:id', {
        templateUrl: 'app/features/ads/detail/ad-detail.html',
        controller: 'AdDetailController'
      });
  }]);
