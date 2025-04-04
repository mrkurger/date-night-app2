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
]);