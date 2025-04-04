angular.module('dateNightApp')
  .controller('AdBrowserController', ['$scope', 'AdService', '$location', function($scope, AdService, $location) {
    // View modes
    $scope.viewModes = {
      SWIPE: 'swipe',
      GRID: 'grid'
    };
    
    $scope.currentViewMode = $scope.viewModes.GRID;
    $scope.ads = [];
    $scope.currentIndex = 0;
    $scope.loading = true;
    $scope.error = null;
    $scope.counties = [
      'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
      'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
      'Trøndelag', 'Nordland', 'Troms og Finnmark'
    ];
    $scope.selectedCounty = null;
    
    // Load all ads
    $scope.loadAds = function() {
      $scope.loading = true;
      AdService.getAllAds()
        .then(function(response) {
          $scope.ads = response.data;
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to load ads';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Filter by county
    $scope.filterByCounty = function() {
      if (!$scope.selectedCounty) {
        $scope.loadAds();
        return;
      }
      
      $scope.loading = true;
      AdService.filterByCounty($scope.selectedCounty)
        .then(function(response) {
          $scope.ads = response.data;
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to filter ads';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Toggle view mode
    $scope.toggleViewMode = function() {
      $scope.currentViewMode = $scope.currentViewMode === $scope.viewModes.GRID ? 
        $scope.viewModes.SWIPE : $scope.viewModes.GRID;
    };
    
    // Swipe functions
    $scope.swipeLeft = function() {
      if ($scope.currentIndex < $scope.ads.length - 1) {
        $scope.currentIndex++;
      }
    };
    
    $scope.swipeRight = function() {
      // Add to favorites and move to next
      if ($scope.currentIndex < $scope.ads.length) {
        $scope.toggleFavorite($scope.ads[$scope.currentIndex]);
        $scope.currentIndex++;
      }
    };
    
    $scope.getCurrentAd = function() {
      return $scope.ads[$scope.currentIndex];
    };
    
    // Favorites management
    $scope.favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    $scope.toggleFavorite = function(ad) {
      const index = $scope.favorites.findIndex(fav => fav._id === ad._id);
      
      if (index === -1) {
        $scope.favorites.push(ad);
      } else {
        $scope.favorites.splice(index, 1);
      }
      
      localStorage.setItem('favorites', JSON.stringify($scope.favorites));
    };
    
    $scope.isFavorite = function(ad) {
      return $scope.favorites.some(fav => fav._id === ad._id);
    };
    
    // View ad details
    $scope.viewAdDetails = function(adId) {
      $location.path(`/ads/${adId}`);
    };
    
    // Use geolocation for nearby search
    $scope.searchNearby = function() {
      if (!navigator.geolocation) {
        $scope.error = 'Geolocation is not supported by your browser';
        return;
      }
      
      navigator.geolocation.getCurrentPosition(function(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        $scope.loading = true;
        AdService.searchNearby(lon, lat, 10000) // 10km radius
          .then(function(response) {
            $scope.ads = response.data;
            $scope.loading = false;
          })
          .catch(function(error) {
            $scope.error = 'Failed to find nearby ads';
            $scope.loading = false;
            console.error(error);
          });
      }, function() {
        $scope.error = 'Unable to retrieve your location';
      });
    };
    
    // Load initial ads
    AdService.getAds()
      .then(function(response) {
        $scope.ads = response.data;
      })
      .finally(function() {
        $scope.loading = false;
      });

    // Initialize
    $scope.loadAds();
  }]);
