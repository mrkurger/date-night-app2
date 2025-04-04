angular.module('dateNightApp')
  .controller('AdDetailsController', ['$scope', 'AdService', 'AuthService', 'ChatService', '$routeParams', '$location', function($scope, AdService, AuthService, ChatService, $routeParams, $location) {
    $scope.ad = null;
    $scope.loading = true;
    $scope.error = null;
    $scope.isOwner = false;
    $scope.adId = $routeParams.adId;
    
    // Load ad details
    $scope.loadAdDetails = function() {
      $scope.loading = true;
      
      AdService.getAdById($scope.adId)
        .then(function(response) {
          $scope.ad = response.data;
          
          // Check if current user is the ad owner
          const currentUser = AuthService.getCurrentUser();
          if (currentUser && $scope.ad.advertiser === currentUser._id) {
            $scope.isOwner = true;
          }
          
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to load ad details';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Initialize contact with advertiser
    $scope.startChat = function() {
      if (!AuthService.isAuthenticated()) {
        $location.path('/login');
        return;
      }
      
      $location.path('/chat/' + $scope.ad.advertiser);
    };
    
    // Toggle favorite status
    $scope.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    $scope.toggleFavorite = function() {
      const index = $scope.favorites.findIndex(fav => fav._id === $scope.ad._id);
      
      if (index === -1) {
        $scope.favorites.push($scope.ad);
      } else {
        $scope.favorites.splice(index, 1);
      }
      
      localStorage.setItem('favorites', JSON.stringify($scope.favorites));
    };
    
    $scope.isFavorite = function() {
      return $scope.favorites.some(fav => fav._id === $scope.ad._id);
    };
    
    // Initialize
    $scope.loadAdDetails();
  }]);
