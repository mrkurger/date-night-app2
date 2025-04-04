angular.module('dateNightApp', [
  'ngSanitize'
])
.controller('MainController', ['$scope', function($scope) {
  // Removed image hover and polling logic; these will be handled in:
  // - an ImageService and/or individual controllers for image components
  // - a ChatPollingService (or integrated real-time via sockets)
}]);