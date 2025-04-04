angular.module('dateNightApp')
  .controller('GalleryController', ['$scope', 'AdsService', function($scope, AdsService) {
    // Load ads for gallery view based on prototype
    // ...existing code...
    $scope.ads = [];
    
    AdsService.getGalleryAds().then(function(response) {
      $scope.ads = response.data;
    });
    
    // Additional gallery logic if needed
    // ...existing code...
  }]);
