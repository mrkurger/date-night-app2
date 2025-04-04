angular.module('dateNightApp')
  .factory('ChatPollingService', ['$interval', 'ChatService', function($interval, ChatService) {
    let pollingPromise;
    
    return {
      start: function() {
        if (!pollingPromise) {
          pollingPromise = $interval(function() {
            ChatService.getUnreadCount();
          }, 30000); // Poll every 30 seconds
        }
      },
      stop: function() {
        if (pollingPromise) {
          $interval.cancel(pollingPromise);
          pollingPromise = null;
        }
      }
    };
  }]);
