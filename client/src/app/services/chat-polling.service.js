angular.module('dateNightApp')
  .factory('ChatPollingService', ['$interval', 'ChatService', function($interval, ChatService) {
    var pollingInterval;
    return {
      start: function() {
        // TODO (Severity medium): Implement chat polling logic (or use sockets)
        pollingInterval = $interval(function() {
          ChatService.fetchLatestMessages();
        }, 5000);
      },
      stop: function() {
        if (pollingInterval) {
          $interval.cancel(pollingInterval);
        }
      }
    };
  }]);
