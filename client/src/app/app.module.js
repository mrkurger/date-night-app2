angular.module('dateNightApp', [
  'ngSanitize'
])
.controller('MainController', ['$scope', '$interval', function($scope, $interval) {
  $scope.changeImage = function(ad) {
    if (ad.album && ad.album.length) {
      if (!ad.originalImage) {
        ad.originalImage = ad.profileImage;
        ad.currentImageIndex = 0;
      }
      ad.currentImageIndex = (ad.currentImageIndex + 1) % ad.album.length;
      ad.profileImage = ad.album[ad.currentImageIndex];
    }
  };

  $scope.restoreImage = function(ad) {
    if (ad.originalImage) {
      ad.profileImage = ad.originalImage;
      ad.currentImageIndex = 0;
    }
  };

  $interval(function() {
    // Logic for updateUnreadCount and loadChatPreviews
  }, 5000);
}]);