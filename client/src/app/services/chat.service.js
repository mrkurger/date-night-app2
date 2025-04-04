angular.module('dateNightApp')
  .factory('ChatService', ['$http', 'SocketService', function($http, SocketService) {
    return {
      authenticate: function(userId) {
        SocketService.emit('authenticate', { userId: userId });
      },
      
      getMessages: function(recipientId) {
        return $http.get(`/api/chat/${recipientId}`);
      },
      
      sendMessage: function(recipientId, content) {
        return $http.post('/api/chat', { recipientId, content });
      },
      
      markAsRead: function(messageId) {
        return $http.put(`/api/chat/${messageId}/read`);
      },
      
      onNewMessage: function(callback) {
        SocketService.on('new_message', callback);
      }
    };
  }]);
