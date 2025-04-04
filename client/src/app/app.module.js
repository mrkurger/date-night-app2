angular.module('dateNightApp', [
  'ngSanitize'
])
.controller('MainController', ['$scope', 'ImageService', 'ChatPollingService', function($scope, ImageService, ChatPollingService) {
  // Removed image hover and polling logic; now using new services.
  ImageService.initHoverEffects();
  ChatPollingService.start();
}]);