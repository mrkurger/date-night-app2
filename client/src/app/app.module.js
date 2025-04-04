angular.module('dateNightApp', [
  'ngRoute',
  'ngSanitize',
  'ngAnimate',
  'btford.socket-io',
  'dateNightApp.core',
  'dateNightApp.shared',
  'dateNightApp.ads',
  'dateNightApp.auth',
  'dateNightApp.chat',
  'dateNightApp.profile',
  'dateNightApp.tinder',
  'dateNightApp.gallery'
])
.constant('API_URL', process.env.API_URL || 'http://localhost:3000/api')
.constant('SOCKET_URL', process.env.SOCKET_URL || 'http://localhost:3000')
.controller('MainController', ['$scope', 'ImageService', 'ChatPollingService', function($scope, ImageService, ChatPollingService) {
  // Removed image hover and polling logic; now using new services.
  ImageService.initHoverEffects();
  ChatPollingService.start();
}]);