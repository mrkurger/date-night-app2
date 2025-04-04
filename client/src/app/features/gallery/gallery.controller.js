angular.module('dateNightApp.gallery')
  .controller('GalleryController', ['$scope', 'GalleryLayoutService', 'categories', function($scope, GalleryLayoutService, categories) {
    $scope.categories = categories.data;
    $scope.selectedCategory = null;
    $scope.layout = [];
    $scope.loading = false;

    $scope.calculateLayout = function() {
      const containerWidth = document.querySelector('.gallery-container').offsetWidth;
      $scope.layout = GalleryLayoutService.calculateLayout($scope.ads, containerWidth);
    };

    $scope.$watch('selectedCategory', function(newCategory) {
      if (!newCategory) return;
      
      $scope.loading = true;
      AdService.getAdsByCategory(newCategory)
        .then(function(response) {
          $scope.ads = response.data;
          $scope.calculateLayout();
        })
        .finally(function() {
          $scope.loading = false;
        });
    });

    // Recalculate layout on window resize
    angular.element(window).on('resize', $scope.calculateLayout);
    $scope.$on('$destroy', function() {
      angular.element(window).off('resize', $scope.calculateLayout);
    });
  }]);
