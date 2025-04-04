angular.module('dateNightApp')
  .factory('ImageService', ['$timeout', function($timeout) {
    return {
      initHoverEffects: function() {
        $timeout(function() {
          angular.element('.hover-effect').hover(
            function() { angular.element(this).addClass('hovered'); },
            function() { angular.element(this).removeClass('hovered'); }
          );
        });
      }
    };
  }]);
