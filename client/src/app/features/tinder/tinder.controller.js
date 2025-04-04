angular.module('dateNightApp.tinder')
  .controller('TinderController', ['$scope', 'SwipeService', 'ads', function($scope, SwipeService, ads) {
    $scope.ads = ads.data;
    $scope.currentIndex = 0;
    $scope.loading = false;

    $scope.swipe = function(direction) {
      if ($scope.currentIndex >= $scope.ads.length) return;
      
      const swipeAction = {
        adId: $scope.ads[$scope.currentIndex]._id,
        direction: direction,
        timestamp: new Date()
      };

      SwipeService.recordSwipe(swipeAction);
      $scope.currentIndex++;
    };

    $scope.getCurrentAd = function() {
      return $scope.ads[$scope.currentIndex];
    };

    $scope.hasMoreAds = function() {
      return $scope.currentIndex < $scope.ads.length;
    };
  }]);
