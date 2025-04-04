angular.module('dateNightApp')
  .controller('ChatController', ['$scope', 'ChatService', 'AuthService', 'UserService', '$routeParams', '$location', '$timeout', function($scope, ChatService, AuthService, UserService, $routeParams, $location, $timeout) {
    $scope.messages = [];
    $scope.newMessage = '';
    $scope.loading = true;
    $scope.error = null;
    $scope.recipient = null;
    $scope.recipientId = $routeParams.userId;
    $scope.isTyping = false;
    $scope.recipientTyping = false;
    $scope.typingTimeout = null;
    
    // Check if authenticated
    if (!AuthService.isAuthenticated()) {
      $location.path('/login');
      return;
    }
    
    // Get current user
    $scope.currentUser = AuthService.getCurrentUser();
    
    // Initialize socket connection
    ChatService.authenticate($scope.currentUser._id);
    
    // Load recipient info
    $scope.loadRecipientInfo = function() {
      if (!$scope.recipientId) {
        $scope.error = 'No recipient selected';
        $scope.loading = false;
        return;
      }
      
      UserService.getUserStatus($scope.recipientId)
        .then(function(response) {
          $scope.recipient = {
            _id: $scope.recipientId,
            online: response.data.online,
            lastActive: response.data.lastActive
          };
        })
        .catch(function(error) {
          $scope.error = 'Failed to load recipient information';
          console.error(error);
        });
    };
    
    // Load chat messages
    $scope.loadMessages = function() {
      ChatService.getMessages($scope.recipientId)
        .then(function(response) {
          $scope.messages = response.data;
          $scope.loading = false;
          
          // Mark received messages as read
          $scope.messages.forEach(function(message) {
            if (message.recipient === $scope.currentUser._id && !message.read) {
              ChatService.markAsRead(message._id);
              message.read = true;
            }
          });
          
          // Scroll to bottom
          $timeout(function() {
            const chatContainer = document.getElementById('chat-messages');
            if (chatContainer) {
              chatContainer.scrollTop = chatContainer.scrollHeight;
            }
          });
        })
        .catch(function(error) {
          $scope.error = 'Failed to load messages';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Send message
    $scope.sendMessage = function() {
      if (!$scope.newMessage.trim()) {
        return;
      }
      
      const messageData = {
        recipientId: $scope.recipientId,
        message: $scope.newMessage
      };
      
      // Optimistically add message to UI
      const tempMessage = {
        _id: 'temp-' + Date.now(),
        sender: $scope.currentUser._id,
        recipient: $scope.recipientId,
        message: $scope.newMessage,
        timestamp: new Date(),
        read: false,
        pending: true
      };
      
      $scope.messages.push(tempMessage);
      $scope.newMessage = '';
      
      // Scroll to bottom
      $timeout(function() {
        const chatContainer = document.getElementById('chat-messages');
        if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
        }
      });
      
      // Stop typing indicator
      $scope.stopTyping();
      
      // Send via API
      ChatService.sendMessage(messageData.recipientId, messageData.message)
        .then(function(response) {
          // Replace temp message with real one
          const index = $scope.messages.findIndex(m => m._id === tempMessage._id);
          if (index !== -1) {
            $scope.messages[index] = response.data;
          }
          
          // Notify via socket as well
          ChatService.sendMessageSocket(messageData.recipientId, response.data);
        })
        .catch(function(error) {
          $scope.error = 'Failed to send message';
          console.error(error);
          
          // Mark message as failed
          const index = $scope.messages.findIndex(m => m._id === tempMessage._id);
          if (index !== -1) {
            $scope.messages[index].failed = true;
          }
        });
    };
    
    // Handle typing indicator
    $scope.onTyping = function() {
      if (!$scope.isTyping) {
        $scope.isTyping = true;
        ChatService.sendTypingSignal($scope.recipientId);
      }
      
      // Clear existing timeout
      if ($scope.typingTimeout) {
        $timeout.cancel($scope.typingTimeout);
      }
      
      // Set new timeout
      $scope.typingTimeout = $timeout(function() {
        $scope.stopTyping();
      }, 2000);
    };
    
    $scope.stopTyping = function() {
      $scope.isTyping = false;
      ChatService.sendStopTypingSignal($scope.recipientId);
    };
    
    // Socket event listeners
    ChatService.onNewMessage(function(message) {
      // Add message to list if from current chat
      if (message.sender === $scope.recipientId || message.recipient === $scope.recipientId) {
        $scope.$apply(function() {
          $scope.messages.push(message);
          
          // Mark as read
          if (message.recipient === $scope.currentUser._id) {
            ChatService.markAsRead(message._id);
          }
        });
        
        // Scroll to bottom
        $timeout(function() {
          const chatContainer = document.getElementById('chat-messages');
          if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          }
        });
      }
    });
    
    ChatService.onTyping(function(data) {
      if (data.recipientId === $scope.currentUser._id) {
        $scope.$apply(function() {
          $scope.recipientTyping = true;
        });
      }
    });
    
    ChatService.onStopTyping(function(data) {
      if (data.recipientId === $scope.currentUser._id) {
        $scope.$apply(function() {
          $scope.recipientTyping = false;
        });
      }
    });
    
    ChatService.onUserStatusChange(function(data) {
      if (data.userId === $scope.recipientId) {
        $scope.$apply(function() {
          $scope.recipient.online = data.online;
          if (!data.online) {
            $scope.recipient.lastActive = new Date();
          }
        });
      }
    });
    
    // Clean up on controller destroy
    $scope.$on('$destroy', function() {
      if ($scope.typingTimeout) {
        $timeout.cancel($scope.typingTimeout);
      }
    });
    
    // Initialize
    $scope.loadRecipientInfo();
    $scope.loadMessages();
  }]);
