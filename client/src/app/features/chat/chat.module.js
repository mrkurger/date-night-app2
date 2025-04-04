/**
 * @typedef {Object} ChatMessage
 * @property {string} _id
 * @property {string} sender
 * @property {string} recipient
 * @property {string} content
 * @property {boolean} read
 * @property {Date} createdAt
 * @property {string} encryptionKey // TODO: Add for E2E encryption
 * @property {string} attachmentUrl // TODO: Add for file sharing
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

// TODO: Add socket reconnection handling
// TODO: Add offline message queue
// TODO: Add encryption service
// TODO: Add file upload handling
