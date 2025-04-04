angular.module('dateNightApp')
  .factory('ChatService', ['$http', 'socket', function($http, socket) {
    const baseUrl = '/api/chat';
    
    // Socket event handlers
    function onNewMessage(callback) {
      socket.on('new_message', callback);
    }
    
    function onTyping(callback) {
      socket.on('typing', callback);
    }
    
    function onStopTyping(callback) {
      socket.on('stop_typing', callback);
    }
    
    function onUserStatusChange(callback) {
      socket.on('user_status_change', callback);
    }
    
    return {
      getMessages: function(recipientId) {
        return $http.get(`${baseUrl}/${recipientId}`);
      },
      
      sendMessage: function(recipientId, message) {
        return $http.post(baseUrl, { recipientId, message });
      },
      
      markAsRead: function(messageId) {
        return $http.put(`${baseUrl}/${messageId}/read`);
      },
      
      getUnreadCount: function() {
        return $http.get(`${baseUrl}/unread/count`);
      },
      
      // Socket methods
      sendMessageSocket: function(recipientId, message) {
        socket.emit('send_message', { recipientId, message });
      },
      
      sendTypingSignal: function(recipientId) {
        socket.emit('typing', { recipientId });
      },
      
      sendStopTypingSignal: function(recipientId) {
        socket.emit('stop_typing', { recipientId });
      },
      
      authenticate: function(userId) {
        socket.emit('authenticate', { userId });
      },
      
      // Event listeners
      onNewMessage: onNewMessage,
      onTyping: onTyping,
      onStopTyping: onStopTyping,
      onUserStatusChange: onUserStatusChange
    };
  }]);
