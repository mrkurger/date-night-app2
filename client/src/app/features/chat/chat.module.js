/**
 * @typedef {Object} ChatMessage
 * @property {string} _id
 * @property {string} sender
 * @property {string} recipient
 * @property {string} content
 * @property {boolean} read
 * @property {Date} createdAt
 */

angular.module('dateNightApp.chat', ['dateNightApp.core', 'btford.socket-io'])
  .config(['$routeProvider', function($routeProvider) {
    $routeProvider
      .when('/chat', {
        templateUrl: 'app/features/chat/list/chat-list.html',
        controller: 'ChatListController',
        resolve: { auth: requireAuth }
      });
  }])
  .run(['ChatService', 'AuthService', function(ChatService, AuthService) {
    if (AuthService.isAuthenticated()) {
      ChatService.initialize();
    }
  }]);
