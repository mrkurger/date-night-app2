angular.module('dateNightApp')
  .controller('AdManagementController', ['$scope', 'AdService', 'AuthService', '$location', function($scope, AdService, AuthService, $location) {
    $scope.ads = [];
    $scope.loading = true;
    $scope.error = null;
    $scope.newAd = {};
    $scope.editingAd = null;
    $scope.isEditing = false;
    $scope.counties = [
      'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
      'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
      'Trøndelag', 'Nordland', 'Troms og Finnmark'
    ];
    
    // Check if user is advertiser
    if (!AuthService.isAdvertiser()) {
      $location.path('/login');
      return;
    }
    
    // Load user's ads
    $scope.loadUserAds = function() {
      $scope.loading = true;
      AdService.getAllAds() // We would ideally have a getUserAds endpoint
        .then(function(response) {
          // Filter to only show current user's ads
          const currentUser = AuthService.getCurrentUser();
          $scope.ads = response.data.filter(ad => ad.advertiser === currentUser._id);
          $scope.loading = false;
        })
        .catch(function(error) {
          $scope.error = 'Failed to load your ads';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Create new ad
    $scope.createAd = function() {
      if (!$scope.newAdForm.$valid) {
        return;
      }
      
      $scope.loading = true;
      AdService.createAd($scope.newAd)
        .then(function(response) {
          $scope.ads.push(response.data);
          $scope.newAd = {};
          $scope.loading = false;
          
          // Close modal
          angular.element('#newAdModal').modal('hide');
        })
        .catch(function(error) {
          $scope.error = 'Failed to create ad';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Edit ad
    $scope.startEditing = function(ad) {
      $scope.editingAd = angular.copy(ad);
      $scope.isEditing = true;
      angular.element('#editAdModal').modal('show');
    };
    
    $scope.updateAd = function() {
      if (!$scope.editAdForm.$valid) {
        return;
      }
      
      $scope.loading = true;
      AdService.updateAd($scope.editingAd._id, $scope.editingAd)
        .then(function(response) {
          // Update in local array
          const index = $scope.ads.findIndex(a => a._id === response.data._id);
          if (index !== -1) {
            $scope.ads[index] = response.data;
          }
          
          $scope.loading = false;
          $scope.isEditing = false;
          $scope.editingAd = null;
          
          // Close modal
          angular.element('#editAdModal').modal('hide');
        })
        .catch(function(error) {
          $scope.error = 'Failed to update ad';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Delete ad
    $scope.confirmDelete = function(ad) {
      $scope.adToDelete = ad;
      angular.element('#deleteAdModal').modal('show');
    };
    
    $scope.deleteAd = function() {
      $scope.loading = true;
      
      AdService.deleteAd($scope.adToDelete._id)
        .then(function() {
          // Remove from local array
          const index = $scope.ads.findIndex(a => a._id === $scope.adToDelete._id);
          if (index !== -1) {
            $scope.ads.splice(index, 1);
          }
          
          $scope.loading = false;
          $scope.adToDelete = null;
          
          // Close modal
          angular.element('#deleteAdModal').modal('hide');
        })
        .catch(function(error) {
          $scope.error = 'Failed to delete ad';
          $scope.loading = false;
          console.error(error);
        });
    };
    
    // Set location with HTML5 Geolocation API
    $scope.setCurrentLocation = function(target) {
      if (!navigator.geolocation) {
        $scope.error = 'Geolocation is not supported by your browser';
        return;
      }
      
      navigator.geolocation.getCurrentPosition(function(position) {
        $scope.$apply(function() {
          const ad = target === 'new' ? $scope.newAd : $scope.editingAd;
          
          ad.coordinates = {
            type: 'Point',
            coordinates: [position.coords.longitude, position.coords.latitude]
          };
          
          // Also set a friendly location name if possible (reverse geocoding)
          // This is simplified - you might want to use a geocoding service
          ad.location = `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`;
        });
      }, function() {
        $scope.$apply(function() {
          $scope.error = 'Unable to retrieve your location';
        });
      });
    };
    
    // Initialize
    $scope.loadUserAds();
  }]);
