angular.module('dateNightApp')
  .service('ChatService', ['$http', 'AuthService', 'socketFactory', function($http, AuthService, socketFactory) {
    const baseUrl = '/api/chat';
    
    // Initialize socket connection
    const socket = socketFactory({
      ioSocket: io.connect('/', {
        auth: {
          token: AuthService.getToken()
        }
      })
    });
    
    this.socket = socket;
    
    // Chat methods
    this.getMessages = function(recipientId) {
      return $http.get(`${baseUrl}/${recipientId}`, {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      });
    };
    
    this.sendMessage = function(recipientId, message) {
      return $http.post(baseUrl, { recipientId, message }, {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      });
    };
    
    this.markAsRead = function(messageId) {
      return $http.put(`${baseUrl}/${messageId}/read`, {}, {
        headers: { Authorization: `Bearer ${AuthService.getToken()}` }
      });
    };
    
    // Socket event listeners
    this.onNewMessage = function(callback) {
      socket.on('new_message', callback);
    };
    
    this.onUserStatus = function(callback) {
      socket.on('user_status', callback);
    };
  }]);
